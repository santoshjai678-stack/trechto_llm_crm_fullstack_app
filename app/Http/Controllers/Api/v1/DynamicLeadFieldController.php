<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use App\Models\DynamicLeadField;
use App\Models\DynamicFieldOptions;
use App\Models\Branch;

class DynamicLeadFieldController extends BaseApiController
{
    /**
     * Display a listing of active dynamic lead fields for dropdown.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        try {

            $dynamicFields = DynamicLeadField::where('status', 1)
                ->select('id', 'branch_id', 'name', 'slug', 'field_length', 'field_label', 'input_type', 'max_length', 'min_length', 'is_unique', 'show_on_lead_list', 'is_required', 'show_in_filter', 'is_birthday_field', 'status');
            if($user->role_id != 1){
                if($user->role_id != 2){
                    $dynamicFields = $dynamicFields->where('branch_id', $user->branch_id);
                }
            }
            if ($request->filled('branch_id')) {
                $dynamicFields = $dynamicFields->where('branch_id', $request->branch_id);
            }
            if ($request->filled('section_id')) {
                $dynamicFields = $dynamicFields->where('section_id', $request->section_id);
            }
            $dynamicFields = $dynamicFields->get();
            
            if ($dynamicFields->isNotEmpty()) {
                return $this->sendResponse($dynamicFields, 'Dynamic lead fields fetched successfully');
            } else {
                return $this->sendResponse([], 'No dynamic lead fields found');
            }
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch dynamic lead fields', $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Display a listing of active dynamic lead fields for filter.
     */
    public function dynamic_field_for_filter(Request $request)
    {
        $user = auth()->user();
        try {

            $dynamicFields = DynamicLeadField::where('status', 1)->where('show_in_filter', 1)
                ->select('id', 'branch_id', 'name', 'slug', 'field_length', 'field_label', 'input_type', 'max_length', 'min_length', 'is_unique', 'show_on_lead_list', 'is_required', 'show_in_filter', 'is_birthday_field', 'status');
            
            if($user->role_id != 1){
                if($user->role_id != 2){
                    $dynamicFields = $dynamicFields->where('branch_id', $user->branch_id);
                }
            }
            if ($request->filled('branch_id')) {
                $dynamicFields = $dynamicFields->where('branch_id', $request->branch_id);
            }
            $dynamicFields = $dynamicFields->get();
            
            if ($dynamicFields->isNotEmpty()) {
                return $this->sendResponse($dynamicFields, 'Dynamic lead fields fetched successfully');
            } else {
                return $this->sendResponse([], 'No dynamic lead fields found');
            }
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch dynamic lead fields', $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Display a listing of active dynamic lead fields for datatable list.
     */
    public function dynamic_field_for_datatable_list(Request $request)
    {
        $user = auth()->user();
        try {

            $dynamicFields = DynamicLeadField::where('status', 1)->where("show_on_lead_list", 1)
                ->select('id', 'branch_id', 'name', 'slug', 'field_length', 'field_label', 'input_type', 'max_length', 'min_length', 'is_unique', 'show_on_lead_list', 'is_required', 'show_in_filter', 'is_birthday_field', 'status');
            if($user->role_id != 1){
                if($user->role_id != 2){
                    $dynamicFields = $dynamicFields->where('branch_id', $user->branch_id);
                }
            }
            if ($request->filled('branch_id')) {
                $dynamicFields = $dynamicFields->where('branch_id', $request->branch_id);
            }
        
            $dynamicFields = $dynamicFields->get();
            
            if ($dynamicFields->isNotEmpty()) {
                return $this->sendResponse($dynamicFields, 'Dynamic lead fields fetched successfully');
            } else {
                return $this->sendResponse([], 'No dynamic lead fields found');
            }
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch dynamic lead fields', $e->getMessage(), null, 500);
        }
    }

    public function get_dynamic_lead_fields(Request $request)
    {
        try {
            $user = auth()->user();
            $search = $request->input('search', '');
            $sortField = $request->input('sort_field', 'id');
            $sortOrder = $request->input('sort_order', 'desc');
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);

            $query = DynamicLeadField::with(['branch', 'section']);

            // Search filter
            if (!empty($search)) {
                $query->whereAny([
                    'id',
                    'name',
                    'slug',
                    'field_length',
                    'field_label',
                    'input_type',
                    'max_length',
                    'min_length',
                    'is_unique',
                    'show_on_lead_list',
                    'is_required',
                    'show_in_filter',
                    'is_birthday_field',
                    'status'
                ], 'LIKE', "%{$search}%");
            }
            if($user->role_id != 1){
                $query->where("branch_id", $user->branch_id);
            }
            // Sort
            if (in_array($sortField, ['id', 'name', 'email', 'phone_number', 'status', 'created_at'])) {
                $query->orderBy($sortField, strtoupper($sortOrder) === 'DESC' ? 'desc' : 'asc');
            }

            // Get total before pagination
            $total = $query->count();

            // Paginate
            $dynamicFields = $query->paginate($perPage, ['*'], 'page', $page);
            
            $data = $dynamicFields->items();
            $formattedData = array_map(function ($dynamicField) {
                return [
                    'id' => $dynamicField->id,
                    'branch_id' => $dynamicField->branch_id,
                    'section_id' => $dynamicField->section_id,
                    'name' => $dynamicField->name,
                    'slug' => $dynamicField->slug,
                    'field_length' => $dynamicField->field_length,
                    'field_label' => $dynamicField->field_label,
                    'input_type' => $dynamicField->input_type,
                    'max_length' => $dynamicField->max_length,
                    'min_length' => $dynamicField->min_length,
                    'is_unique' => $dynamicField->is_unique,
                    'show_on_lead_list' => $dynamicField->show_on_lead_list,
                    'is_required' => $dynamicField->is_required,
                    'show_in_filter' => $dynamicField->show_in_filter,
                    'is_birthday_field' => $dynamicField->is_birthday_field,
                    'status' => $dynamicField->status,
                    'created_at' => $dynamicField->created_at,
                    'updated_at' => $dynamicField->updated_at,
                    // Relations
                    'branch_name' => $dynamicField->branch?->name,
                    'section_name' => $dynamicField->section?->name,
                ];
            }, $data);

            return $this->sendPaginatedResponse($formattedData, $dynamicFields, 'Dynamic lead fields fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch dynamic lead fields', $e->getMessage(), null, 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|numeric|exists:branches,id,deleted_at,NULL',
            'section_id' => 'required|numeric|exists:form_sections,id,deleted_at,NULL',
            'name' => 'required|string',
            'slug' => [
                'required',
                'string',
                'regex:/^[A-Za-z_]{2,100}$/',
                Rule::unique('dynamic_lead_fields', 'slug')
                    ->where('branch_id', $request->branch_id)->whereNull('deleted_at'),
            ],
            'field_length' => 'required|numeric',
            'field_label' => 'required|string|in:Varchar,Integer,Boolean,Date,Datetime,Text',
            'input_type' => 'required|string|in:text,number,email,select,checkbox,radio,date,datetime,time,file',
            'max_length' => 'nullable|numeric',
            'min_length' => 'nullable|numeric',
            'is_searchable' => 'required|in:0,1',
            'is_unique' => 'required|in:0,1',
            'show_on_lead_list' => 'required|in:0,1',
            'is_required' => 'required|in:0,1',
            'show_in_filter' => 'required|in:0,1',
            'is_birthday_field' => 'required|in:0,1',
            'status' => 'required|in:0,1',
        ],[
            'slug.regex' => 'The slug may only contain letters and underscores, and must be between 2 to 100 characters.',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            $branch = Branch::find($request->branch_id);

            $dynamicLeadFieldData = DynamicLeadField::where('branch_id', $request->branch_id)->latest()->first();
            
            $dynamicField = new DynamicLeadField(); 
            $dynamicField->branch_id = $request->branch_id;
            $dynamicField->section_id = $request->section_id;
            $dynamicField->name = $request->name;
            $dynamicField->slug = $request->slug;
            $dynamicField->field_length = $request->field_length;
            $dynamicField->field_label = $request->field_label;
            $dynamicField->input_type = $request->input_type;
            $dynamicField->max_length = $request->max_length ?? 0;
            $dynamicField->min_length = $request->min_length ?? 0;
            $dynamicField->is_searchable = $request->is_searchable;
            $dynamicField->is_unique = $request->is_unique;
            $dynamicField->show_on_lead_list = $request->show_on_lead_list;
            $dynamicField->is_required = $request->is_required;
            $dynamicField->show_in_filter = $request->show_in_filter;
            $dynamicField->is_birthday_field = $request->is_birthday_field;
            $dynamicField->status = $request->status;
            $dynamicField->created_by = auth()->id();
            $dynamicField->save();

            $columnName = $request->slug;
            $lead_table_name = $branch->crm_db_name;
            $lead_comment_table_name = $branch->crm_comment_db_name;
            $last_field_name = $dynamicLeadFieldData ? $dynamicLeadFieldData->slug == null ? "sales_id" : $dynamicLeadFieldData->slug : "sales_id";

            if (!Schema::hasTable($lead_table_name)) {
                Schema::create($lead_table_name, function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('branch_id')->index();
                    $table->unsignedBigInteger('user_id')->index();
                    $table->unsignedBigInteger('sales_id')->index();
                    $table->string('lead_status', 100)->index();
                    $table->date('follow_up_date')->index();
                    $table->date('comment_date')->index();
                    $table->tinyInteger('is_deleted')->default(0)->index();
                    $table->tinyInteger('is_duplicate_entry')->default(0)->index();
                    $table->tinyInteger('is_this_facebook_lead')->default(0)->index();
                    $table->string('facebook_lead_id', 255)->index()->nullable();
                    $table->tinyInteger('is_this_instagram_lead')->default(0)->index();
                    $table->string('instagram_lead_id', 255)->index()->nullable();
                    // created_at with default current timestamp 
                    $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
                    // updated_at with default current timestamp and auto-update 
                    $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'))->useCurrentOnUpdate();
                });
            }
            
            if (!Schema::hasColumn($lead_table_name, $columnName)) {
                Schema::table($lead_table_name, function (Blueprint $table) use ($request, $columnName, $last_field_name) {

                    switch ($request->field_label) {

                        case 'Varchar':
                            $table->string($columnName, $request->field_length)->nullable()->after($last_field_name);
                            break;

                        case 'Integer':
                            $table->integer($columnName)->nullable()->after($last_field_name);
                            break;

                        case 'Boolean':
                            $table->boolean($columnName)->default(0)->after($last_field_name);
                            break;

                        case 'Date':
                            $table->date($columnName)->nullable()->after($last_field_name);
                            break;

                        case 'Datetime':
                            $table->dateTime($columnName)->nullable()->after($last_field_name);
                            break;

                        case 'Text':
                            $table->text($columnName)->nullable()->after($last_field_name);
                            break;

                        default:
                            $table->string($columnName, $request->field_length)->nullable()->after($last_field_name);
                    }
                });
            }

            if (!Schema::hasTable($lead_comment_table_name)) {
                Schema::create($lead_comment_table_name, function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('lead_id')->index();
                    $table->unsignedBigInteger('commented_by')->index();
                    $table->unsignedBigInteger('comment_id')->index();
                    $table->text('comment')->nullable();
                    $table->text('other_comment')->nullable();
                    // created_at with default current timestamp 
                    $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
                    // updated_at with default current timestamp and auto-update 
                    $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'))->useCurrentOnUpdate();
                });
            }
            
            $branch->is_crm_db_created = 1;
            $branch->save();

            return $this->sendResponse($dynamicField, 'Dynamic lead fields created successfully', 201);
        } catch (\Exception $e) {
            return $this->sendError('Failed to create dynamic lead field', $e->getMessage(), null, 500);
        }
    }
    
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dynamic_lead_field_id' => 'required|numeric|exists:dynamic_lead_fields,id,deleted_at,NULL',
            'branch_id' => 'required|numeric|exists:branches,id,deleted_at,NULL',
            'section_id' => 'required|numeric|exists:form_sections,id,deleted_at,NULL',
            'name' => 'required|string',
            'slug' => [
                'required',
                'string',
                'regex:/^[A-Za-z_]{2,100}$/',
                Rule::unique('dynamic_lead_fields', 'slug')
                    ->where('branch_id', $request->branch_id)
                    ->ignore($request->dynamic_lead_field_id, 'id'),
            ],
            'field_length' => 'required|numeric',
            'field_label' => 'required|string|in:Varchar,Integer,Boolean,Date,Datetime,Text',
            'input_type' => 'required|string|in:text,number,email,select,checkbox,radio,date,datetime,time,file',
            'max_length' => 'nullable|numeric',
            'min_length' => 'nullable|numeric',
            'is_searchable' => 'required|in:0,1',
            'is_unique' => 'required|in:0,1',
            'show_on_lead_list' => 'required|in:0,1',
            'is_required' => 'required|in:0,1',
            'show_in_filter' => 'required|in:0,1',
            'is_birthday_field' => 'required|in:0,1',
            'status' => 'required|in:0,1',
        ], [
            'slug.regex' => 'Slug only allows letters and underscores (2–100 chars)',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            // DB::beginTransaction();

            $dynamicField = DynamicLeadField::find($request->dynamic_lead_field_id);
            if (!$dynamicField) {
                DB::rollBack();
                return $this->sendError('Dynamic lead field not found', null, null, 404);
            }

            $branch = Branch::find($request->branch_id);
            $lead_table_name = $branch->crm_db_name;
            
            // OLD VALUES
            $oldSlug = $dynamicField->slug;
            $oldType = $dynamicField->field_label;

            // NEW VALUES (FROM REQUEST)
            $newSlug = $request->slug;
            $newType = $request->field_label;
            
            // CHECK CHANGES
            $slugChanged = $oldSlug !== $newSlug;
            $typeChanged = $oldType !== $newType;
            $lengthChanged = $dynamicField->getOriginal('field_length') != $request->field_length;

            // UPDATE MODEL
            $dynamicField->branch_id = $request->branch_id;
            $dynamicField->section_id = $request->section_id;
            $dynamicField->name = $request->name;
            $dynamicField->input_type = $request->input_type;
            $dynamicField->max_length = $request->max_length ?? 0;
            $dynamicField->min_length = $request->min_length ?? 0;
            $dynamicField->is_searchable = $request->is_searchable;
            $dynamicField->is_unique = $request->is_unique;
            $dynamicField->show_on_lead_list = $request->show_on_lead_list;
            $dynamicField->is_required = $request->is_required;
            $dynamicField->show_in_filter = $request->show_in_filter;
            $dynamicField->is_birthday_field = $request->is_birthday_field;
            $dynamicField->status = $request->status;
            $dynamicField->updated_by = auth()->id();
            $dynamicField->save();

            // =========================
            // 1. RENAME COLUMN
            // =========================
            // dd(Schema::hasColumn($lead_table_name, $oldSlug),$oldSlug, $newSlug );
            if ($slugChanged && Schema::hasColumn($lead_table_name, $oldSlug)) {
                Schema::table($lead_table_name, function (Blueprint $table) use ($oldSlug, $newSlug) {
                    $table->renameColumn($oldSlug, $newSlug);
                });
                
                Schema::table($lead_table_name, function (Blueprint $table) use ($newSlug, $request) {
                    if($request->field_label == "Varchar"){
                        $table->string($newSlug, $request->field_length)->nullable()->change();
                    }
                });

                $dynamicField->slug = $newSlug;
                if($dynamicField->field_length != $request->field_length){
                    $dynamicField->field_length = $request->field_length;
                }
                $dynamicField->update();
            }

            // =========================
            // 2. CHANGE TYPE OR LENGTH
            // =========================
            if (Schema::hasColumn($lead_table_name, $newSlug) && ($typeChanged || $lengthChanged)) {
                Schema::table($lead_table_name, function (Blueprint $table) use (
                    $newType,
                    $newSlug,
                    $request,
                    $lead_table_name,
                    $lengthChanged,
                    $typeChanged
                ) {

                    switch ($newType) {

                        case 'Varchar':

                            // Only check when reducing length
                            $maxLength = DB::table($lead_table_name)
                                ->selectRaw("MAX(CHAR_LENGTH($newSlug)) as max_length")
                                ->value('max_length');

                            if ($maxLength && $maxLength > $request->field_length) {
                                throw new \Exception(
                                    "Cannot reduce length. Existing data ($maxLength) exceeds {$request->field_length}"
                                );
                            }

                            // ✅ This will run when:
                            // - type changed
                            // - OR field_length changed
                            $table->string($newSlug, $request->field_length)->nullable()->change();
                            break;

                        case 'Integer':
                            if ($typeChanged) {
                                $table->integer($newSlug)->nullable()->change();
                            }
                            break;

                        case 'Boolean':
                            if ($typeChanged) {
                                $table->boolean($newSlug)->default(0)->change();
                            }
                            break;

                        case 'Date':
                            if ($typeChanged) {
                                $table->date($newSlug)->nullable()->change();
                            }
                            break;

                        case 'Datetime':
                            if ($typeChanged) {
                                $table->dateTime($newSlug)->nullable()->change();
                            }
                            break;

                        case 'Text':
                            if ($typeChanged) {
                                $table->text($newSlug)->nullable()->change();
                            }
                            break;
                    }
                });
                $dynamicField->slug = $newSlug;
                $dynamicField->field_length = $request->field_length;
                $dynamicField->field_label = $newType;
                $dynamicField->update();
            }

            // DB::commit();

            return $this->sendResponse($dynamicField, 'Dynamic lead field updated successfully');

        } catch (\Exception $e) {
            // DB::rollBack(); // correct method name
            return $this->sendError('Failed to update dynamic lead field', $e->getMessage(), null, 500);
        }
    }
    
    public function show($id)
    {
        try {
            $dynamicField = DynamicLeadField::with(['branch', 'section'])->find($id);

            if (!$dynamicField) {
                return $this->sendError('Dynamic lead field not found', null, null, 404);
            }
            $dynamicField->branch_name = optional($dynamicField->branch)->name;
            $dynamicField->section_name = optional($dynamicField->section)->name;
            $dynamicField->created_by_name = optional($dynamicField->createdByUser)->name;
            $dynamicField->updated_by_name = optional($dynamicField->updatedByUser)->name;

            return $this->sendResponse($dynamicField, 'Dynamic lead fields fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch dynamic lead field', $e->getMessage(), null, 500);
        }
    }

    public function update_dynamic_lead_field_status(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dynamic_lead_field_id' => 'required|numeric|exists:dynamic_lead_fields,id,deleted_at,NULL',
            'status' => 'required|in:0,1',
        ]);
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            $dynamicField = DynamicLeadField::find($request->dynamic_lead_field_id);
            if (!$dynamicField) {
                return $this->sendError('Dynamic lead field not found', null, null, 404);
            }

            $dynamicField->status = $request->status;
            $dynamicField->updated_by = auth()->id();
            $dynamicField->save();

            return $this->sendResponse($dynamicField, 'Dynamic lead fields status updated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to update dynamic lead field status', $e->getMessage(), null, 500);
        }
    }

    public function destroy($id)
    {
        try {
            $dynamicField = DynamicLeadField::find($id);

            if (!$dynamicField) {
                return $this->sendError('Dynamic lead fields not found', null, null, 404);
            }

            $branch = Branch::find($dynamicField->branch_id);

            $lead_table_name = $branch->crm_db_name;
            $lead_comment_table_name = $branch->crm_comment_db_name;

            $column = $dynamicField->slug;

            // DROP from lead table
            if (Schema::hasColumn($lead_table_name, $column)) {
                Schema::table($lead_table_name, function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }

            // DROP from comment table (optional)
            // if (Schema::hasColumn($lead_comment_table_name, $column)) {
            //     Schema::table($lead_comment_table_name, function (Blueprint $table) use ($column) {
            //         $table->dropColumn($column);
            //     });
            // }

            // DELETE record
            $dynamicField->delete();

            return $this->sendResponse(null, 'Dynamic lead fields deleted successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to delete dynamic lead field', $e->getMessage(), null, 500);
        }
    }
}
