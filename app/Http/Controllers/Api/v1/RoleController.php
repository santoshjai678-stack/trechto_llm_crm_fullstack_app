<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Role;
use App\Models\User;

class RoleController extends BaseApiController
{
    /**
     * Display a listing of active roles for dropdown.
     */
    public function index()
    {
        $user = auth()->user();
        if($user->role_id == 1){
            $roleIds = [1, 2, 9];
        }elseif($user->role_id == 2){
            $roleIds = [1, 2, 9];
        }elseif($user->role_id == 3){
            $roleIds = [1, 2, 3, 9];
        }else{
            $roleIds = [1, 2, 3, 9, $user->role_id];
        }
        try {
            $roles = Role::where('status', 1)->whereNotIn("id", $roleIds)
                ->select('id', 'name', 'slug', 'description')
                ->get();
            
            if ($roles->isNotEmpty()) {
                return $this->sendResponse($roles, 'Roles fetched successfully');
            } else {
                return $this->sendResponse([], 'No roles found');
            }
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch roles', $e->getMessage(), null, 500);
        }
    }

    /**
     * Display a paginated listing of roles.
     */
    public function get_role(Request $request)
    {
        try {
            $query = Role::query();

            /*
            |--------------------------------------------------------------------------
            | Searching
            |--------------------------------------------------------------------------
            */
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereAny(
                    ['name', 'slug', 'description'],
                    'LIKE',
                    "%{$search}%"
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Sorting
            |--------------------------------------------------------------------------
            */
            $sortBy = $request->get('sort_by', 'id');
            $sortOrder = $request->get('sort_order', 'desc');

            $allowedSortColumns = ['id', 'name', 'slug', 'created_at', 'updated_at'];

            if (!in_array($sortBy, $allowedSortColumns)) {
                $sortBy = 'id';
            }

            if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
                $sortOrder = 'desc';
            }

            $query->orderBy($sortBy, $sortOrder);

            /*
            |--------------------------------------------------------------------------
            | Pagination
            |--------------------------------------------------------------------------
            */
            $perPage = $request->get('per_page', 10);

            if (!in_array($perPage, [1, 10, 25, 50, 100])) {
                $perPage = 10;
            }

            $roles = $query->paginate($perPage);

            return $this->sendPaginatedResponse($roles->items(), $roles, 'Roles fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch roles', null, null, 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255', 'unique:roles,name', 'regex:/^[A-Za-z0-9 ]+$/'],
                // 'slug' => 'required|string|max:255|unique:roles,slug',
                'description' => 'nullable|string',
                'status' => 'required|in:0,1',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error', $validator->errors(), null, 422);
            }
            
            $slug = strtolower(str_replace(' ', '_', $request->input('name')));
            $role = Role::create([
                'name' => $request->input('name'),
                'slug' => $slug,
                'description' => $request->input('description'),
                'status' => $request->input('status'),
            ]);

            return $this->sendResponse($role, 'Role created successfully', 201);
        } catch (\Exception $e) {
            return $this->sendError('Failed to create role', null, null, 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request)
    {
        try {
            $roleId = $request->input('role_id');
            $role = Role::find($roleId);

            if (!$role) {
                return $this->sendError('Role not found', null, null, 404);
            }

            return $this->sendResponse($role, 'Role details fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch role', null, null, 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        try {
            $roleId = $request->input('role_id');
            $validator = Validator::make($request->all(), [
                'role_id' => 'required|exists:roles,id,deleted_at,NULL',
                'name' => ['required', 'string', 'max:255', 'unique:roles,name,' . $roleId, 'regex:/^[A-Za-z0-9 ]+$/'],
                // 'slug' => 'required|string|max:255|unique:roles,slug,' . $roleId,
                'description' => 'nullable|string',
                'status' => 'required|in:0,1',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error', $validator->errors(), null, 422);
            }
            
            $role = Role::find($roleId);

            if (!$role) {
                return $this->sendError('Role not found', null, null, 404);
            }

            $slug = strtolower(str_replace(' ', '_', $request->input('name')));
            $role->update([
                'name' => $request->input('name'),
                'slug' => $slug,
                'description' => $request->input('description'),
                'status' => $request->input('status'),
            ]);

            return $this->sendResponse($role, 'Role updated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to update role', null, null, 500);
        }
    }

    /**
     * Update the status of the specified resource.
     */
    public function update_status(Request $request)
    {
        try {
            $roleId = $request->input('role_id');
            $status = $request->input('status');

            $role = Role::find($roleId);

            if (!$role) {
                return $this->sendError('Role not found', null, null, 404);
            }

            $role->status = $status;
            $role->save();

            return $this->sendResponse($role, 'Role status updated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to update role status', null, null, 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        try {
            $roleId = $request->input('role_id');
            $role = Role::find($roleId);

            if (!$role) {
                return $this->sendError('Role not found', null, null, 404);
            }

            $role->delete();

            return $this->sendResponse(null, 'Role deleted successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to delete role', null, null, 500);
        }
    }
}
