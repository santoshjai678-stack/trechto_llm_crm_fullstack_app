<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Role;
use App\Models\Branch;
use App\Models\Country;
use App\Models\State;
use App\Models\City;

class EmployeeController extends BaseApiController
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $employees = User::select("id", "name", "email", "phone_number", "status")->where("status", 1)->where("role_id", "!=", 1);
        if($user->role_id != 1){
            $employees = $employees->where("branch_id", $user->branch_id);
            $employees = $employees->where("role_id", ">",$user->role_id);
        }

        if ($request->has('branch_id') && $request->branch_id) {
            $employees = $employees->where("branch_id", $request->branch_id);
        }

        if ($request->has('role_id') && $request->role_id) {
            $employees = $employees->where("role_id", $request->role_id);
        }

        $employees = $employees->get();

        if($employees->isNotEmpty()){
            return $this->sendResponse($employees, 'Employee fetched successfully');
        }else{
            return $this->sendResponse($employees, 'Employee data not found');
        }
    }
    
    public function get_sales_executives(Request $request)
    {
        $user = auth()->user();
        $employees = User::select("id", "name", "email", "phone_number", "status")->where("status", 1)->where("role_id", "!=", 1);
        if($user->role_id != 1){
            $employees = $employees->where("branch_id", $user->branch_id);
        }
        $employees = $employees->where("role_id", 6);

        if ($request->has('branch_id') && $request->branch_id) {
            $employees = $employees->where("branch_id", $request->branch_id);
        }

        $employees = $employees->get();

        if($employees->isNotEmpty()){
            return $this->sendResponse($employees, 'Employee fetched successfully');
        }else{
            return $this->sendResponse($employees, 'Employee data not found');
        }
    }

    /**
     * Get Employee List
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEmployeeList(Request $request)
    {
        try {
            $user = auth()->user();
            $search = $request->input('search', '');
            $sortField = $request->input('sort_field', 'id');
            $sortOrder = $request->input('sort_order', 'desc');
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);

            $query = User::with(['role', 'branch', 'country', 'state', 'city'])->where("role_id", ">", $user->role_id);

            // Search filter
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%");
                });
            }
            if($user->role_id != 1){
                $query->where("branch_id", $user->branch_id);
                $query->where("role_id", ">",$user->role_id);
            }
            // Sort
            if (in_array($sortField, ['id', 'name', 'email', 'phone_number', 'status', 'created_at'])) {
                $query->orderBy($sortField, strtoupper($sortOrder) === 'DESC' ? 'desc' : 'asc');
            }

            // Get total before pagination
            $total = $query->count();

            // Paginate
            $employees = $query->paginate($perPage, ['*'], 'page', $page);

            $data = $employees->items();
            $formattedData = array_map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'role_id' => $employee->role_id,
                    'branch_id' => $employee->branch_id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                    'phone_number' => $employee->phone_number,
                    'address' => $employee->address,
                    'city_id' => $employee->city_id,
                    'state_id' => $employee->state_id,
                    'country_id' => $employee->country_id,
                    'zip' => $employee->zip,
                    'profile_image' => $employee->profile_image,
                    'status' => $employee->status,
                    'created_at' => $employee->created_at,
                    'updated_at' => $employee->updated_at,
                    // Relations
                    'role_name' => $employee->role?->name,
                    'branch_name' => $employee->branch?->name,
                    'country_name' => $employee->country?->name,
                    'state_name' => $employee->state?->name,
                    'city_name' => $employee->city?->name,
                ];
            }, $data);

            return $this->sendPaginatedResponse(
                $formattedData,
                $employees,
                'Employee list fetched successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch employees', $e->getMessage(), null, 500);
        }
    }

    /**
     * Add Employee
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Validate
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'role_id' => 'required|exists:roles,id,deleted_at,NULL',
                'branch_id' => 'required|exists:branches,id,deleted_at,NULL',
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                    'regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
                ],
                'phone_number' => 'required|numeric|digits:10',
                'address' => 'nullable|string',
                'country_id' => 'nullable|exists:countries,id,deleted_at,NULL',
                'state_id' => 'nullable|exists:states,id,deleted_at,NULL',
                'city_id' => 'nullable|exists:cities,id,deleted_at,NULL',
                'zip' => ['nullable', 'numeric', 'regex:/^\d{4,6}$/'],
                'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'status' => 'required|in:0,1',
            ],[
                "password.regex" => "The password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.",
                'zip.regex' => 'ZIP must be 4 to 6 digits only.',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error', $validator->errors(), null, 422);
            }
            $user = auth()->user();
            if(!in_array($user->role_id, [1, 2, 3])){
                return $this->sendError('Unauthorized', null, null, 403);
            }

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('profile_image')) {
                $file = $request->file('profile_image');
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/employees'), $fileName);
                $imagePath = 'uploads/employees/' . $fileName;
            }
            
            // Create employee
            $employee = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'role_id' => $request->input('role_id'),
                'branch_id' => $request->input('branch_id'),
                'password' => Hash::make($request->input('password')),
                'phone_number' => $request->input('phone_number'),
                'address' => $request->input('address'),
                'country_id' => $request->input('country_id'),
                'state_id' => $request->input('state_id'),
                'city_id' => $request->input('city_id'),
                'zip' => $request->input('zip'),
                'profile_image' => $imagePath,
                'status' => $request->input('status'),
            ]);

            return $this->sendResponse(
                $employee,
                'Employee created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->sendError('Failed to create employee', $e->getMessage(), null, 500);
        }
    }

    /**
     * Update Employee
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        try {
            $employeeId = $request->input('employee_id');
            $employee = User::find($employeeId);

            if (!$employee) {
                return $this->sendError('Employee not found', null, null, 404);
            }

            // Validate
            $rules = [
                'employee_id' => 'required|exists:users,id,deleted_at,NULL',
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $employeeId,
                'role_id' => 'required|exists:roles,id,deleted_at,NULL',
                'branch_id' => 'required|exists:branches,id,deleted_at,NULL',
                'phone_number' => 'required|numeric|digits:10',
                'address' => 'nullable|string',
                'country_id' => 'nullable|exists:countries,id,deleted_at,NULL',
                'state_id' => 'nullable|exists:states,id,deleted_at,NULL',
                'city_id' => 'nullable|exists:cities,id,deleted_at,NULL',
                'zip' => ['nullable', 'numeric', 'regex:/^\d{4,6}$/'],
                'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'status' => 'required|in:0,1',
            ];

            // Password is optional on update
            if ($request->filled('password')) {
                $rules['password'] = [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                    'regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
                ];
            }

            $validator = Validator::make($request->all(), $rules, [
                "password.regex" => "The password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.",
                'zip.regex' => 'ZIP must be 4 to 6 digits only.',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error', $validator->errors(), null, 422);
            }

            // Handle image upload
            if ($request->hasFile('profile_image')) {
                // Delete old image if exists
                if ($employee->profile_image && file_exists(public_path($employee->profile_image))) {
                    unlink(public_path($employee->profile_image));
                }

                $file = $request->file('profile_image');
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/employees'), $fileName);
                $employee->profile_image = 'uploads/employees/' . $fileName;
            }

            // Update employee
            $employee->name = $request->input('name');
            $employee->email = $request->input('email');
            $employee->role_id = $request->input('role_id');
            $employee->branch_id = $request->input('branch_id');
            $employee->phone_number = $request->input('phone_number');
            $employee->address = $request->input('address');
            $employee->country_id = $request->input('country_id');
            $employee->state_id = $request->input('state_id');
            $employee->city_id = $request->input('city_id');
            $employee->zip = $request->input('zip');
            $employee->status = $request->input('status');

            if ($request->filled('password')) {
                $employee->password = Hash::make($request->input('password'));
            }

            $employee->save();

            return $this->sendResponse(
                $employee,
                'Employee updated successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Failed to update employee', null, null, 500);
        }
    }

    /**
     * View Employee
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        try {
            $employeeId = $request->input('employee_id');
            if($employeeId == 1){
                return $this->sendError('Unauthorized', null, null, 403);
            }
            $employee = User::with(['role', 'branch', 'country', 'state', 'city'])
                ->find($employeeId);

            if (!$employee) {
                return $this->sendError('Employee not found', null, null, 404);
            }

            $data = [
                'id' => $employee->id,
                'role_id' => $employee->role_id,
                'branch_id' => $employee->branch_id,
                'name' => $employee->name,
                'email' => $employee->email,
                'phone_number' => $employee->phone_number,
                'address' => $employee->address,
                'city_id' => $employee->city_id,
                'state_id' => $employee->state_id,
                'country_id' => $employee->country_id,
                'zip' => $employee->zip,
                'profile_image' => $employee->profile_image,
                'status' => $employee->status,
                'created_at' => $employee->created_at,
                'updated_at' => $employee->updated_at,
                // Relations
                'role_name' => $employee->role?->name,
                'branch_name' => $employee->branch?->name,
                'country_name' => $employee->country?->name,
                'state_name' => $employee->state?->name,
                'city_name' => $employee->city?->name,
            ];

            return $this->sendResponse($data, 'Employee details fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch employee details', null, null, 500);
        }
    }

    /**
     * Update Employee Status
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update_status(Request $request)
    {
        try {
            $employeeId = $request->input('employee_id');
            if($employeeId == 1){
                return $this->sendError('Unauthorized', null, null, 403);
            }
            $status = $request->input('status');

            $employee = User::find($employeeId);

            if (!$employee) {
                return $this->sendError('Employee not found', null, null, 404);
            }

            $employee->status = $status;
            $employee->save();

            return $this->sendResponse(
                $employee,
                'Employee status updated successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Failed to update employee status', null, null, 500);
        }
    }

    /**
     * Delete Employee
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        try {
            $employeeId = $request->input('employee_id');
            if($employeeId == 1){
                return $this->sendError('Unauthorized', null, null, 403);
            }
            $employee = User::find($employeeId);

            if (!$employee) {
                return $this->sendError('Employee not found', null, null, 404);
            }

            // Soft delete
            $employee->delete();

            return $this->sendResponse(
                null,
                'Employee deleted successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError('Failed to delete employee', null, null, 500);
        }
    }
}
