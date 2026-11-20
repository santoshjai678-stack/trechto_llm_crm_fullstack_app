<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Subscription;
use App\Models\SubscriptionFeature;
use App\Models\BranchSubscribedDetails;
use DB;

class SubscriptionController extends BaseApiController
{
    /**
     * Get active subscriptions without pagination (simple listing).
     */
    public function index(Request $request)
    {
        $query = Subscription::with('feature')->where('status', 1);

        if ($request->filled('is_trial')) {
            $query->where('is_trial', $request->is_trial);
        }

        $subscriptions = $query->get();

        if ($subscriptions->isNotEmpty()) {
            return $this->sendResponse($subscriptions, 'Subscription fetched successfully');
        } else {
            return $this->sendResponse($subscriptions, 'Subscription data not found');
        }
    }

    /**
     * List subscriptions with search, sort and pagination.
     */
    public function get_subscription(Request $request)
    {
        $query = Subscription::with('feature');

        /*
        |--------------------------------------------------------------------------
        | Searching
        |--------------------------------------------------------------------------
        */
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('code', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filter by status / trial
        |--------------------------------------------------------------------------
        */
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('is_trial')) {
            $query->where('is_trial', $request->is_trial);
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */
        $sortBy = $request->get('sort_by', 'id');
        $sortOrder = $request->get('sort_order', 'desc');

        $sortMap = [
            'id' => 'id',
            'name' => 'name',
            'code' => 'code',
            'price' => 'price',
            'duration' => 'duration',
            'duration_type' => 'duration_type',
            'created_at' => 'created_at',
            'status' => 'status',
        ];

        $sortBy = $sortMap[$sortBy] ?? 'id';

        if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $query->orderBy($sortBy, $sortOrder);

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */
        $perPage = (int) $request->get('per_page', 10);

        if (!in_array($perPage, [1, 10, 25, 50, 100])) {
            $perPage = 10;
        }

        $subscriptions = $query->paginate($perPage);

        return $this->sendPaginatedResponse($subscriptions->items(), $subscriptions, 'Subscription fetched successfully');
    }

    /**
     * Store a newly created subscription.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:branch,sub-branch',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:subscriptions,code',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'duration_type' => 'required|string|in:day,month,year',
            'is_trial' => 'required|boolean|in:0,1',
            'status' => 'required|boolean|in:0,1',

            // Subscription features (optional)
            'lms_crm_access' => 'required|integer|min:0',
            'max_users' => 'required|integer|min:0',
            'max_users_status' => 'nullable|boolean|in:0,1',
            'max_users_is_unlimited' => 'nullable|boolean|in:0,1',
            'max_branches' => 'required|integer|min:0',
            'max_branches_status' => 'nullable|boolean|in:0,1',
            'max_branches_is_unlimited' => 'nullable|boolean|in:0,1',
            'max_leads' => 'required|integer|min:0',
            'max_leads_status' => 'nullable|boolean|in:0,1',
            'max_leads_is_unlimited' => 'nullable|boolean|in:0,1',
            'max_comment' => 'required|integer|min:0',
            'max_comment_status' => 'nullable|boolean|in:0,1',
            'max_comment_is_unlimited' => 'nullable|boolean|in:0,1',
            'max_compaigns' => 'required|integer|min:0',
            'max_compaigns_status' => 'nullable|boolean|in:0,1',
            'max_compaigns_is_unlimited' => 'nullable|boolean|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            DB::beginTransaction();
            $data = $request->only([
                'type',
                'name',
                'code',
                'description',
                'price',
                'duration',
                'duration_type',
                'is_trial',
                'status',
            ]);

            $subscription = Subscription::create($data);

            if($subscription){
                // Create related subscription features if provided
                $featuresData['subscription_id'] = $subscription->id;
                $featuresData['lms_crm_access'] = $request->lms_crm_access;
                $featuresData['max_users'] = $request->max_users;
                $featuresData['max_users_status'] = $request->max_users_status;
                $featuresData['max_users_is_unlimited'] = $request->max_users_is_unlimited;
                $featuresData['max_branches'] = $request->max_branches;
                $featuresData['max_branches_status'] = $request->max_branches_status;
                $featuresData['max_branches_is_unlimited'] = $request->max_branches_is_unlimited;
                $featuresData['max_leads'] = $request->max_leads;
                $featuresData['max_leads_status'] = $request->max_leads_status;
                $featuresData['max_leads_is_unlimited'] = $request->max_leads_is_unlimited;
                $featuresData['max_comment'] = $request->max_comment;
                $featuresData['max_comment_status'] = $request->max_comment_status;
                $featuresData['max_comment_is_unlimited'] = $request->max_comment_is_unlimited;
                $featuresData['max_compaigns'] = $request->max_compaigns;
                $featuresData['max_compaigns_status'] = $request->max_compaigns_status;
                $featuresData['max_compaigns_is_unlimited'] = $request->max_compaigns_is_unlimited;
                $featuresData['status'] = $request->status;
                SubscriptionFeature::create($featuresData);
            }
            DB::commit();
            return $this->sendResponse($subscription, 'Subscription created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Unable to create the subscription. Please try again after sometime.', ['error_message' => $e->getMessage()], null, 410);
        }
    }

    /**
     * Show a single subscription by ID.
     */
    public function show(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subscription_id' => 'required|numeric|exists:subscriptions,id,deleted_at,NULL',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $subscription = Subscription::with(['feature'])
            ->withTrashed()
            ->find($request->subscription_id);

        return $this->sendResponse($subscription, 'Subscription fetched successfully');
    }

    /**
     * Update an existing subscription.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subscription_id' => 'required|numeric|exists:subscriptions,id,deleted_at,NULL',
            'type' => 'required|string|in:branch,sub-branch',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:subscriptions,code,' . $request->subscription_id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'duration_type' => 'required|string|in:day,month,year',
            'is_trial' => 'required|boolean|in:0,1',
            'status' => 'required|boolean|in:0,1',

            // Subscription features (optional)
            'lms_crm_access' => 'required|integer|min:0',
            'max_users' => 'required|integer|min:0',
            'max_users_status' => 'nullable|boolean|in:0,1',
            'max_users_is_unlimited' => 'nullable|boolean|in:0,1',
            'max_branches' => 'required|integer|min:0',
            'max_branches_status' => 'nullable|boolean|in:0,1',
            'max_branches_is_unlimited' => 'nullable|boolean|in:0,1',
            'max_leads' => 'required|integer|min:0',
            'max_leads_status' => 'nullable|boolean|in:0,1',
            'max_leads_is_unlimited' => 'nullable|boolean|in:0,1',
            'max_comment' => 'required|integer|min:0',
            'max_comment_status' => 'nullable|boolean|in:0,1',
            'max_comment_is_unlimited' => 'nullable|boolean|in:0,1',
            'max_compaigns' => 'required|integer|min:0',
            'max_compaigns_status' => 'nullable|boolean|in:0,1',
            'max_compaigns_is_unlimited' => 'nullable|boolean|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $subscription = Subscription::find($request->subscription_id);

        if (!$subscription) {
            return $this->sendError('Subscription not found', null, null, 404);
        }

        $data = $request->only([
            'type',
            'name',
            'code',
            'description',
            'price',
            'duration',
            'duration_type',
            'is_trial',
            'status',
        ]);

        $subscription->update($data);

        // Create / update related subscription features if provided
        // if ($request->has('features') && is_array($request->features)) {
            $featuresData['subscription_id'] = $subscription->id;
            $featuresData['lms_crm_access'] = $request->lms_crm_access;
            $featuresData['max_users'] = $request->max_users;
            $featuresData['max_users_status'] = $request->max_users_status;
            $featuresData['max_users_is_unlimited'] = $request->max_users_is_unlimited;
            $featuresData['max_branches'] = $request->max_branches;
            $featuresData['max_branches_status'] = $request->max_branches_status;
            $featuresData['max_branches_is_unlimited'] = $request->max_branches_is_unlimited;
            $featuresData['max_leads'] = $request->max_leads;
            $featuresData['max_leads_status'] = $request->max_leads_status;
            $featuresData['max_leads_is_unlimited'] = $request->max_leads_is_unlimited;
            $featuresData['max_comment'] = $request->max_comment;
            $featuresData['max_comment_status'] = $request->max_comment_status;
            $featuresData['max_comment_is_unlimited'] = $request->max_comment_is_unlimited;
            $featuresData['max_compaigns'] = $request->max_compaigns;
            $featuresData['max_compaigns_status'] = $request->max_compaigns_status;
            $featuresData['max_compaigns_is_unlimited'] = $request->max_compaigns_is_unlimited;
            $featuresData['status'] = $request->status;

            $subscription->feature()->updateOrCreate(
                ['subscription_id' => $subscription->id],
                $featuresData
            );
        // }

        return $this->sendResponse($subscription->fresh(), 'Subscription updated successfully');
    }

    /**
     * Update subscription status only.
     */
    public function update_status(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subscription_id' => 'required|numeric|exists:subscriptions,id,deleted_at,NULL',
            'status' => 'required|boolean|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $subscription = Subscription::find($request->subscription_id);

        if (!$subscription) {
            return $this->sendError('Subscription not found', null, null, 404);
        }

        $subscription->status = $request->status;
        $subscription->save();

        $featuresData['status'] = $request->status;

        $subscription->feature()->updateOrCreate(
            ['subscription_id' => $subscription->id],
            $featuresData
        );
        
        return $this->sendResponse($subscription, 'Subscription status updated successfully');
    }

    /**
     * Soft delete a subscription.
     */
    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subscription_id' => 'required|numeric|exists:subscriptions,id,deleted_at,NULL',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $branchSubscribedDetails = BranchSubscribedDetails::where("subscription_id", $request->subscription_id)->first();

        $subscription = Subscription::find($request->subscription_id);

        if (!$subscription) {
            return $this->sendError('Subscription not found', null, null, 404);
        }
        SubscriptionFeature::where("subscription_id", $request->subscription_id)->delete();
        $subscription->delete();

        return $this->sendResponse(null, 'Subscription deleted successfully');
    }
}

