<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\DynamicFieldOptions;

class DynamicFieldOptionController extends BaseApiController
{
    /**
     * Display a listing of active dynamic field options for dropdown.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        try {

            $dynamicOptions = DynamicFieldOptions::where('status', 1)
                ->select('id', 'name', 'value', 'status');
            if($user->role_id != 1){
                if($user->role_id != 2){
                    $dynamicOptions = $dynamicOptions->where('branch_id', $user->branch_id);
                }
            }
            if ($request->filled('branch_id')) {
                $dynamicOptions = $dynamicOptions->where('branch_id', $request->branch_id);
            }
            if ($request->filled('field_id')) {
                $dynamicOptions = $dynamicOptions->where('field_id', $request->field_id);
            }
            $dynamicOptions = $dynamicOptions->get();
            
            if ($dynamicOptions->isNotEmpty()) {
                return $this->sendResponse($dynamicOptions, 'Dynamic field options fetched successfully');
            } else {
                return $this->sendResponse([], 'No dynamic field options found');
            }
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch dynamic field options', $e->getMessage(), null, 500);
        }
    }

    public function get_dynamic_field_options(Request $request)
    {
        try {
            $user = auth()->user();
            $search = $request->input('search', '');
            $sortField = $request->input('sort_field', 'id');
            $sortOrder = $request->input('sort_order', 'desc');
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);

            $query = DynamicFieldOptions::with(['branch', 'dynamicField']);

            // Search filter
            if (!empty($search)) {
                $query->whereAny([
                    'id',
                    'name',
                    'value',
                    'status'
                ], 'LIKE', "%{$search}%");
            }            if ($request->filled('field_id')) {
                $query->where('field_id', $request->field_id);
            }            if($user->role_id != 1){
                $query->where("branch_id", $user->branch_id);
            }
            // Sort
            if (in_array($sortField, ['id', 'name', 'value', 'status', 'created_at'])) {
                $query->orderBy($sortField, strtoupper($sortOrder) === 'DESC' ? 'desc' : 'asc');
            }

            // Get total before pagination
            $total = $query->count();

            // Paginate
            $dynamicOptions = $query->paginate($perPage, ['*'], 'page', $page);
            
            $data = $dynamicOptions->items();

            $formattedData = array_map(function ($dynamicOptions) {
                return [
                    'id' => $dynamicOptions->id,
                    'branch_id' => $dynamicOptions->branch_id,
                    'field_id' => $dynamicOptions->field_id,
                    'section_id' => $dynamicOptions->section_id,
                    'name' => $dynamicOptions->name,
                    'value' => $dynamicOptions->value,
                    'status' => $dynamicOptions->status,
                    'created_at' => $dynamicOptions->created_at,
                    'updated_at' => $dynamicOptions->updated_at,
                    'branch_name' => $dynamicOptions->branch?->name,
                    'field_name' => $dynamicOptions->dynamicField?->name,
                ];
            }, $data);

            return $this->sendPaginatedResponse($formattedData, $dynamicOptions, 'Dynamic field options fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch dynamic field options', $e->getMessage(), null, 500);
        }
    }

    public function add_update_dynamic_field_option(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'field_id' => 'required|numeric|exists:dynamic_lead_fields,id,deleted_at,NULL',
            'branch_id' => 'required|numeric|exists:branches,id,deleted_at,NULL',
            'name' => 'required|string',
            'value' => 'required|string',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            $optionData = [
                'branch_id' => $request->branch_id,
                'field_id' => $request->field_id,
                'name' => $request->name,
                'value' => $request->value,
                'status' => $request->status,
            ];

            if ($request->filled('options_id')) {
                // Update existing option
                $option = DynamicFieldOptions::find($request->options_id);
                if (!$option) {
                    return $this->sendError('Dynamic field option not found', null, null, 404);
                }
                $optionData['updated_by'] = auth()->id();
                $option->update($optionData);
            } else {
                // Create new option
                $optionData['created_by'] = auth()->id();
                $option = DynamicFieldOptions::create($optionData);
            }

            return $this->sendResponse($option, 'Dynamic field option added/updated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to add/update dynamic field option', $e->getMessage(), null, 500);
        }
    }

    public function show($id)
    {
        try {
            $dynamicOption = DynamicFieldOptions::with(['branch', 'dynamicField'])->find($id);

            if (!$dynamicOption) {
                return $this->sendError('Dynamic field option not found', null, null, 404);
            }
            $dynamicOption->branch_name = optional($dynamicOption->branch)->name;
            $dynamicOption->field_name = optional($dynamicOption->dynamicField)->name;
            $dynamicOption->created_by_name = optional($dynamicOption->createdByUser)->name;
            $dynamicOption->updated_by_name = optional($dynamicOption->updatedByUser)->name;

            return $this->sendResponse($dynamicOption, 'Dynamic field options fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch dynamic field option', $e->getMessage(), null, 500);
        }
    }

    public function update_dynamic_option_status(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dynamic_field_option_id' => 'required|numeric|exists:dynamic_field_options,id,deleted_at,NULL',
            'status' => 'required|in:0,1',
        ]);
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            $dynamicOption = DynamicFieldOptions::find($request->dynamic_field_option_id);
            if (!$dynamicOption) {
                return $this->sendError('Dynamic field option not found', null, null, 404);
            }

            $dynamicOption->status = $request->status;
            $dynamicOption->updated_by = auth()->id();
            $dynamicOption->save();

            return $this->sendResponse($dynamicOption, 'Dynamic field options status updated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to update dynamic field option status', $e->getMessage(), null, 500);
        }
    }

    public function destroy($id)
    {
        try {
            $dynamicOption = DynamicFieldOptions::find($id);

            if (!$dynamicOption) {
                return $this->sendError('Dynamic field options not found', null, null, 404);
            }

            // DELETE record
            $dynamicOption->delete();

            return $this->sendResponse(null, 'Dynamic field options deleted successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to delete dynamic field option', $e->getMessage(), null, 500);
        }
    }
}
