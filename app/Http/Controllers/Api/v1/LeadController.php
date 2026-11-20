<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\File;
use Intervention\Image\Laravel\Facades\Image;
use App\Models\Branch;
use App\Models\DynamicFieldOptions;
use App\Models\DynamicLeadField;
use App\Models\Lead;
use App\Models\LeadComment;
use DB;

class LeadController extends BaseApiController
{
    private function getBranchFromRequest(Request $request)
    {
        $user = auth()->user();
        $branchId = $request->input('branch_id');

        if ($branchId) {
            return Branch::find($branchId);
        }

        // non-super users are always tied to their own branch
        if ($user && $user->role_id != 1) {
            $branchId = $user->branch_id ?? null;
            if ($branchId) {
                return Branch::find($branchId);
            }
        }

        // For super-admin or fallback, choose first branch if none provided
        return Branch::first();
    }

    private function buildDynamicFieldRules(Branch $branch, $leadId = null)
    {
        $dynamicFields = DynamicLeadField::where('branch_id', $branch->id)->where('status', 1)->get();
        $rules = [];

        foreach ($dynamicFields as $field) {
            if (!$field->slug) {
                continue;
            }

            $fieldRule = [];
            $isRequired = $field->is_required == 1 ? 'required' : 'nullable';
            $fieldRule[] = $isRequired;

            // Basic type validation
            switch ($field->input_type) {
                case 'email':
                    $fieldRule[] = 'email';
                    break;
                case 'number':
                    $fieldRule[] = 'numeric';
                    break;
                case 'date':
                    $fieldRule[] = 'date';
                    break;
                case 'datetime':
                    $fieldRule[] = 'date';
                    break;
                case 'time':
                    $fieldRule[] = 'date_format:H:i';
                    break;
                case 'file':
                    $fieldRule[] = 'image|mimes:jpeg,png,jpg|max:2048';
                    break;
                case 'checkbox':
                case 'radio':
                case 'select':
                    $options = DynamicFieldOptions::where('field_id', $field->id)
                        ->where('status', 1)
                        ->pluck('value')
                        ->toArray();
                    if (!empty($options)) {
                        $fieldRule[] = Rule::in($options);
                    }
                    break;
                default:
                    $fieldRule[] = 'string';
                    break;
            }

            if ($field->min_length && is_numeric($field->min_length)) {
                if($field->min_length != 0 && $field->field_label == "Varchar"){
                    $fieldRule[] = 'min:' . intval($field->min_length);
                }
            }

            if ($field->max_length && is_numeric($field->max_length)) {
                if($field->max_length != 0 && $field->field_label == "Varchar"){
                    $fieldRule[] = 'max:' . intval($field->max_length);
                }
            }

            // Unique if requested
            if ($field->is_unique == 1) {
                $table = $branch->crm_db_name;
                if ($leadId) {
                    $fieldRule[] = Rule::unique($table, $field->slug)->ignore($leadId);
                } else {
                    $fieldRule[] = Rule::unique($table, $field->slug);
                }
            }

            $rules[$field->slug] = $fieldRule;
        }

        return $rules;
    }

    public function index(Request $request)
    {
        $branch = $this->getBranchFromRequest($request);
        if (!$branch) {
            return $this->sendError('Branch not found', null, null, 422);
        }

        $model = new Lead([], $branch->id);
        $query = $model->newQuery();

        // soft-delete style support
        if (Schema::hasColumn($branch->crm_db_name, 'is_deleted')) {
            $query->where('is_deleted', 0);
        }

        // search text
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lead_status', 'LIKE', "%{$search}%")
                    ->orWhere('sales_id', 'LIKE', "%{$search}%")
                    ->orWhere('id', 'LIKE', "%{$search}%");
            });
        }

        // date range filter (created_at)
        if ($request->filled('from_date') && $request->filled('to_date')) {
            $query->whereBetween('created_at', [$request->from_date.' 00:00:00', $request->to_date.' 23:59:59']);
        } elseif ($request->filled('from_date')) {
            $query->where('created_at', '>=', $request->from_date.' 00:00:00');
        } elseif ($request->filled('to_date')) {
            $query->where('created_at', '<=', $request->to_date.' 23:59:59');
        }

        // lead status filter
        if ($request->filled('lead_status')) {
            $query->where('lead_status', $request->input('lead_status'));
        }

        // explicit branch filter for super-admin / admin view
        if ($request->filled('branch_id')) {
            // branch filter is set in branch context by getBranchFromRequest already
            $query->where('branch_id', $request->branch_id);
        }

        // dynamic fields filter
        $filterableFields = DynamicLeadField::where('status', 1)->where('show_in_filter', 1)
            ->when($request->filled('branch_id'), function ($q) use ($request) {
                return $q->where('branch_id', $request->branch_id);
            })
            ->get()
            ->pluck('slug')
            ->filter()
            ->toArray();

        foreach ($filterableFields as $fieldSlug) {
            if ($request->filled($fieldSlug)) {
                $query->where($fieldSlug, $request->input($fieldSlug));
            }
        }

        // sorting
        $sortBy = $request->input('sort_by', 'id');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'branch_subbranch' || $sortBy === 'branch_name') {
            // branch name sorting is handled client-side via branch_id since there is no cross-branch join
            $query->orderBy('branch_id', $sortOrder);
        } elseif (Schema::hasColumn($branch->crm_db_name, $sortBy)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        $perPage = $request->input('per_page', 10);
        $leads = $query->paginate($perPage);

        $leads->getCollection()->transform(function ($lead) {
            $leadArray = $lead->toArray();
            $leadArray['branch_name'] = Branch::find($lead->branch_id)?->name ?? null;
            $leadArray['branch_subbranch'] = $leadArray['branch_name'];
            
            $commentmodel = new LeadComment([], $lead->branch_id);
            $commentquery = $commentmodel->newQuery();
            $comments = $commentquery->where('id', $lead->id)->latest()->limit(5)->get();
            $latest_comments = $commentquery->where('id', $lead->id)->latest()->limit(10)->get();
            $leadArray['last_five_comments'] = $comments;
            $leadArray['latest_comments'] = $latest_comments;
            
            return $leadArray;
        });

        return $this->sendPaginatedResponse($leads->items(), $leads, 'Leads fetched successfully');
    }

    public function show($id, Request $request)
    {
        $branch = $this->getBranchFromRequest($request);
        if (!$branch) {
            return $this->sendError('Branch not found', null, null, 422);
        }

        $model = new Lead([], $branch->id);
        $lead = $model->find($id);

        if (!$lead) {
            return $this->sendError('Lead not found', null, null, 404);
        }

        return $this->sendResponse($lead, 'Lead fetched successfully');
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $branch = $this->getBranchFromRequest($request);
        if (!$branch) {
            return $this->sendError('Branch is required', null, null, 422);
        }

        $baseRules = [
            'branch_id' => 'required|numeric|exists:branches,id',
            // 'user_id' => 'required|numeric',
            'sales_id' => 'required|numeric',
            'lead_status' => 'required|string|max:100',
            'follow_up_date' => 'required|date',
        ];

        $dynamicRules = $this->buildDynamicFieldRules($branch);
        $validator = Validator::make($request->all(), array_merge($baseRules, $dynamicRules));

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $lead = new Lead([], $branch->id);

        // fill static fields
        $lead->branch_id = $branch->id;
        $lead->user_id = $user->id;
        $lead->sales_id = $request->sales_id;
        $lead->lead_status = $request->lead_status;
        $lead->follow_up_date = $request->follow_up_date;
        $lead->comment_date = $request->comment_date;
        $lead->is_deleted = $request->input('is_deleted', 0);

        // dynamic fields
        $dynamicFields = DynamicLeadField::where('branch_id', $branch->id)->where('status', 1)->get();
        foreach ($dynamicRules as $dSlug => $dRules) {
            $field = $dynamicFields->firstWhere('slug', $dSlug);
            
            if ($field && $field->input_type === 'file' && $request->hasFile($dSlug)) {
                $upload = $request->file($dSlug);
                $directory = public_path('uploads/lead_files/'.$branch->id);
                if (!File::exists($directory)) {
                    File::makeDirectory($directory, 0755, true);
                }

                $filename = time() . '_' . uniqid() . '.' . $upload->getClientOriginalExtension();
                Image::read($upload)
                    ->resize(305, 305)
                    ->save($directory . '/' . $filename);
                $lead->{$dSlug} = isset($filename) ? 'uploads/lead_files/'.$branch->id.'/'.$filename : null;
            } elseif ($request->filled($dSlug) || $request->has($dSlug)) {
                $lead->{$dSlug} = $request->input($dSlug);
            }
        }
        $lead->save();
        
        $leadcomment = new LeadComment([], $branch->id);
        if($request->filled('comment_id') || $request->has('comment_id')) {
            $leadcomment->comment_id = $request->input('comment_id');
            $leadcomment->other_comment = $request->input('other_comment');
            $leadcomment->id = $lead->id;
            $leadcomment->save();
        }

        return $this->sendResponse($lead, 'Lead created successfully', 201);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        $branch = $this->getBranchFromRequest($request);
        if (!$branch) {
            return $this->sendError('Branch is required', null, null, 422);
        }

        $leadId = $request->input('lead_id');
        if (!$leadId) {
            return $this->sendError('Lead ID is required', null, null, 422);
        }

        $model = new Lead([], $branch->id);
        $lead = $model->find($leadId);

        if (!$lead) {
            return $this->sendError('Lead not found', null, null, 404);
        }

        $baseRules = [
            'lead_id' => 'required|numeric',
            'branch_id' => 'required|numeric|exists:branches,id',
            // 'user_id' => 'nullable|numeric',
            'sales_id' => 'nullable|numeric',
            'lead_status' => 'nullable|string|max:100',
            'follow_up_date' => 'nullable|date',
            'comment_date' => 'nullable|date',
        ];

        $dynamicRules = $this->buildDynamicFieldRules($branch, $leadId);
        $validator = Validator::make($request->all(), array_merge($baseRules, $dynamicRules));

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $lead->user_id = $user->id;
        $lead->sales_id = $request->input('sales_id', $lead->sales_id);
        $lead->lead_status = $request->input('lead_status', $lead->lead_status);
        $lead->follow_up_date = $request->input('follow_up_date', $lead->follow_up_date);
        $lead->comment_date = $request->input('comment_date', $lead->comment_date);


        $dynamicFields = DynamicLeadField::where('branch_id', $branch->id)->where('status', 1)->get();
        foreach ($dynamicRules as $dSlug => $dRules) {
            $field = $dynamicFields->firstWhere('slug', $dSlug);
                
            if ($field && $field->input_type === 'file' && $request->hasFile($dSlug)) {
                if (!empty($lead->{$dSlug})) {
                    $oldFilePath = public_path($lead->{$dSlug});
                    if (File::exists($oldFilePath)) {
                        File::delete($oldFilePath);
                    }
                }

                $upload = $request->file($dSlug);
                $directory = public_path('uploads/lead_files/'.$branch->id);
                if (!File::exists($directory)) {
                    File::makeDirectory($directory, 0755, true);
                }

                $filename = time() . '_' . uniqid() . '.' . $upload->getClientOriginalExtension();
                Image::read($upload)
                    ->resize(305, 305)
                    ->save($directory . '/' . $filename);
                $lead->{$dSlug} = isset($filename) ? 'uploads/lead_files/'.$branch->id.'/'.$filename : null;
            } elseif ($request->filled($dSlug) || $request->has($dSlug)) {
                $lead->{$dSlug} = $request->input($dSlug);
            }
        }
        $lead->save();

        $leadcomment = new LeadComment([], $branch->id);
        if($request->filled('comment_id') || $request->has('comment_id')) {
            $comment = Comment::where('id', $request->input('comment_id'))->first();
            $leadcomment->comment_id = $request->input('comment_id');
            $leadcomment->other_comment = $request->input('other_comment');
            $leadcomment->lead_id = $lead->id;
            $leadcomment->commented_by = $user->id;
            $leadcomment->comment = $comment->comment;
            $leadcomment->save();
        }

        return $this->sendResponse($lead, 'Lead updated successfully');
    }

    public function update_lead_status(Request $request)
    {
        $branch = $this->getBranchFromRequest($request);
        if (!$branch) {
            return $this->sendError('Branch is required', null, null, 422);
        }

        $validator = Validator::make($request->all(), [
            'lead_id' => 'required|numeric',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $model = new Lead([], $branch->id);
        $lead = $model->find($request->lead_id);

        if (!$lead) {
            return $this->sendError('Lead not found', null, null, 404);
        }

        $lead->status = $request->status;
        $lead->save();

        return $this->sendResponse($lead, 'Lead status updated successfully');
    }

    public function destroy($id, Request $request)
    {
        $branch = $this->getBranchFromRequest($request);
        if (!$branch) {
            return $this->sendError('Branch is required', null, null, 422);
        }

        $model = new Lead([], $branch->id);
        $lead = $model->find($id);

        if (!$lead) {
            return $this->sendError('Lead not found', null, null, 404);
        }

        $lead->is_deleted = 1;
        $lead->save();

        return $this->sendResponse(null, 'Lead deleted successfully');
    }
}
