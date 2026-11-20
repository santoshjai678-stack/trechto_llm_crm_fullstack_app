<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\FormSection;

class FormSectionController extends BaseApiController
{
    /**
     * Display a listing of active roles for dropdown.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        try {
            $formSection = FormSection::where('status', 1)
                ->select('id', 'name');
            
            if($user->role_id != 1){
                $formSection = $formSection->where('branch_id', $user->branch_id);
            }

            if ($request->filled('branch_id')) {
                $formSection = $formSection->where('branch_id', $request->branch_id);
            }

            $formSection = $formSection->get();
            
            if ($formSection->isNotEmpty()) {
                return $this->sendResponse($formSection, 'Form sections fetched successfully');
            } else {
                return $this->sendResponse([], 'No form sections found');
            }
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch form sections', $e->getMessage(), null, 500);
        }
    }

    /**
     * Display a listing of active roles for dropdown.
     */
    public function get_form_section_with_fields(Request $request)
    {
        $user = auth()->user();
        try {
            $formSection = FormSection::with(['dynamicField', 'dynamicField.dynamicFieldOption'])->where('status', 1)
                ->select('id', 'name');
            
            if($user->role_id != 1){
                $formSection = $formSection->where('branch_id', $user->branch_id);
            }

            if ($request->filled('branch_id')) {
                $formSection = $formSection->where('branch_id', $request->branch_id);
            }

            $formSection = $formSection->get();
            
            if ($formSection->isNotEmpty()) {
                return $this->sendResponse($formSection, 'Form sections fetched successfully');
            } else {
                return $this->sendResponse([], 'No form sections found');
            }
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch form sections', $e->getMessage(), null, 500);
        }
    }

    public function get_form_sections(Request $request)
    {
        try {
            $user = auth()->user();
            $query = FormSection::with('branch');
            
            if($user->role_id != 1){
                $query->where("branch_id", $user->branch_id);
            }

            if ($request->filled('search')) {
                $query->where('name', 'LIKE', "%{$request->search}%");
            }

            if ($request->filled('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }

            $sortBy = $request->get('sort_by', 'id');
            $sortOrder = $request->get('sort_order', 'desc');

            $allowedSort = ['id', 'name', 'branch_id', 'status', 'created_at', 'updated_at'];
            if (!in_array($sortBy, $allowedSort)) {
                $sortBy = 'id';
            }
            if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
                $sortOrder = 'desc';
            }

            $query->orderBy($sortBy, $sortOrder);

            $perPage = (int) $request->get('per_page', 10);
            if (!in_array($perPage, [1, 10, 25, 50, 100])) {
                $perPage = 10;
            }

            $formSections = $query->paginate($perPage);

            return $this->sendPaginatedResponse($formSections->items(), $formSections, 'Form sections fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch form sections', $e->getMessage(), null, 500);
        }
    }

    public function add_form_section(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|numeric|exists:branches,id,deleted_at,NULL',
            'name' => 'required|string|max:255',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            $formSection = FormSection::create([
                'branch_id' => $request->branch_id,
                'name' => $request->name,
                'status' => $request->status,
                'created_by' => auth()->id(),
            ]);

            return $this->sendResponse($formSection, 'Form section created successfully', 201);
        } catch (\Exception $e) {
            return $this->sendError('Failed to create form section', $e->getMessage(), null, 500);
        }
    }

    public function update_form_section(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'form_section_id' => 'required|numeric|exists:form_sections,id,deleted_at,NULL',
            'branch_id' => 'required|numeric|exists:branches,id,deleted_at,NULL',
            'name' => 'required|string|max:255',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            $formSection = FormSection::find($request->form_section_id);
            if (!$formSection) {
                return $this->sendError('Form section not found', null, null, 404);
            }

            $formSection->branch_id = $request->branch_id;
            $formSection->name = $request->name;
            $formSection->status = $request->status;
            $formSection->updated_by = auth()->id();
            $formSection->save();

            return $this->sendResponse($formSection, 'Form section updated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to update form section', $e->getMessage(), null, 500);
        }
    }

    public function view_form_section($id)
    {
        try {
            $formSection = FormSection::with('branch')->find($id);
            if (!$formSection) {
                return $this->sendError('Form section not found', null, null, 404);
            }
            return $this->sendResponse($formSection, 'Form section fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch form section', $e->getMessage(), null, 500);
        }
    }

    public function update_form_section_status(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'form_section_id' => 'required|numeric|exists:form_sections,id,deleted_at,NULL',
            'status' => 'required|in:0,1',
        ]);
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            $formSection = FormSection::find($request->form_section_id);
            if (!$formSection) {
                return $this->sendError('Form section not found', null, null, 404);
            }

            $formSection->status = $request->status;
            $formSection->updated_by = auth()->id();
            $formSection->save();

            return $this->sendResponse($formSection, 'Form section status updated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to update form section status', $e->getMessage(), null, 500);
        }
    }

    public function delete_form_section($id)
    {
        try {
            $formSection = FormSection::find($id);

            if (!$formSection) {
                return $this->sendError('Form section not found', null, null, 404);
            }

            $formSection->delete();

            return $this->sendResponse(null, 'Form section deleted successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to delete form section', $e->getMessage(), null, 500);
        }
    }
}
