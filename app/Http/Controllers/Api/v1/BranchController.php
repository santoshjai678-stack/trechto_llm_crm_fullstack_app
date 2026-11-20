<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\BranchOwnerCredentialsMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Intervention\Image\Laravel\Facades\Image;
use App\Models\Branch;
use App\Models\User;
use DB;

class BranchController extends BaseApiController
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $branch = Branch::select("id", "name", "email", "mobile_no", "owner_name", "owner_email", "status")->where("status", 1);
        if($user->role_id != 1){
            if($user->role_id == 2){
                $branch = $branch->where("owner_id", $user->id);
            }else{
                $branch = $branch->where("branch_id", $user->branch_id);
            }
        }
        if ($request->has('branch_id') && $request->branch_id) {
            $branch = $branch->where("branch_id", $request->branch_id);
        }
        if ($request->has('owner_id') && $request->owner_id) {
            $branch = $branch->where("owner_id", $request->owner_id);
        } 
        if ($request->has('is_this_main_branch') && $request->is_this_main_branch) {
            $branch = $branch->where("is_this_main_branch", $request->is_this_main_branch);
        } 

        $branch = $branch->get();

        if($branch->isNotEmpty()){
            return $this->sendResponse($branch, 'Branch fetched successfully');
        }else{
            return $this->sendResponse($branch, 'Branch data not found');
        }
    }

    public function get_branch_subbranch(Request $request)
    {
        $user = auth()->user();
        $branch = Branch::select("id", "name", "email", "mobile_no", "owner_name", "owner_email", "status")->where("status", 1);
        if($user->role_id != 1){
            if($user->role_id == 2){
                $branch = $branch->where("owner_id", $user->id);
            }else{
                $branch = $branch->where("branch_id", $user->branch_id);
            }
        }
        if ($request->has('branch_id') && $request->branch_id) {
            $branch = $branch->where("branch_id", $request->branch_id);
        }
        if ($request->has('owner_id') && $request->owner_id) {
            $branch = $branch->where("owner_id", $request->owner_id);
        }

        $branch = $branch->get();

        if($branch->isNotEmpty()){
            return $this->sendResponse($branch, 'Branch fetched successfully');
        }else{
            return $this->sendResponse($branch, 'Branch data not found');
        }
    }

    /**
     * List branches with search, sort, pagination (like get_city).
     */
    public function get_branch(Request $request)
    {
        $user = auth()->user();
        $query = Branch::query()
            ->leftJoin('branches AS main_branches', 'branches.branch_id', '=', 'main_branches.id')
            ->leftJoin('countries', 'branches.country_id', '=', 'countries.id')
            ->leftJoin('states', 'branches.state_id', '=', 'states.id')
            ->leftJoin('cities', 'branches.city_id', '=', 'cities.id')
            ->select(
                'branches.*',
                'countries.name as country_name',
                'states.name as state_name',
                'cities.name as city_name',
                'main_branches.name as main_branch_name'
            );

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('branches.name', 'LIKE', "%{$search}%")
                    ->orWhere('branches.email', 'LIKE', "%{$search}%")
                    ->orWhere('branches.mobile_no', 'LIKE', "%{$search}%")
                    ->orWhere('branches.owner_name', 'LIKE', "%{$search}%")
                    ->orWhere('countries.name', 'LIKE', "%{$search}%")
                    ->orWhere('states.name', 'LIKE', "%{$search}%")
                    ->orWhere('cities.name', 'LIKE', "%{$search}%");
            });
        }
        if($user->role_id != 1){
            if($user->role_id == 2){
                $query->where("branches.owner_id", $user->id);
            }else{
                $query->where("branches.id", $user->branch_id);
            }
        }
        if ($request->filled('is_this_main_branch')) {
            $query->where('branches.is_this_main_branch', $request->is_this_main_branch);
        }

        $sortBy = $request->get('sort_by', 'branches.id');
        $sortOrder = $request->get('sort_order', 'desc');

        $sortMap = [
            'id' => 'branches.id',
            'name' => 'branches.name',
            'created_at' => 'branches.created_at',
            'country_name' => 'countries.name',
            'state_name' => 'states.name',
            'city_name' => 'cities.name',
            'status' => 'branches.status',
        ];

        $sortBy = $sortMap[$sortBy] ?? 'branches.id';

        if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 10);

        if (!in_array((int) $perPage, [1, 10, 25, 50, 100])) {
            $perPage = 10;
        }

        $branches = $query->paginate($perPage);

        return $this->sendPaginatedResponse($branches->items(), $branches, 'Branch fetched successfully');
    }

    /**
     * Store a newly created branch (add_branch).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'mobile_no' => 'required|numeric|digits:10',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|max:255|unique:users,email',
            'address' => 'required|string',
            'country_id' => 'required|numeric|exists:countries,id,deleted_at,NULL',
            'state_id' => 'required|numeric|exists:states,id,deleted_at,NULL',
            'city_id' => 'required|numeric|exists:cities,id,deleted_at,NULL',
            'zip' => 'required|string|max:6',
            'logo_image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'is_this_main_branch' => 'required|boolean|in:0,1',
            'status' => 'required|boolean|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            DB::beginTransaction();

            $user = auth()->user();
            
            $data = $request->only([
                'name', 'email', 'mobile_no', 'owner_name', 'owner_email',
                'address', 'country_id', 'state_id', 'city_id', 'zip',
                'is_this_main_branch', 'status',
            ]);
            
            $name = preg_replace("/'s\b/i", '', $request->name);
            $remove_sc_name = Str::slug($name);
            $db_name = Str::slug($name, '_');
            $db_fillable_name = strtolower($db_name);

            $data['name_slug'] = $remove_sc_name;
            $data['crm_db_name'] = 'crm_lead_'. $db_fillable_name;
            $data['crm_comment_db_name'] = 'crm_lead_comment_'. $db_fillable_name;

            if ($request->has('branch_id') && $request->branch_id) {
                $data['branch_id'] = $request->branch_id;
            }
            if ($request->has('owner_id') && $request->owner_id) {
                $data['owner_id'] = $request->owner_id;
            }
            
            $data['created_by_id'] = $user->id;
            
            if ($request->hasFile('logo_image')) {
                $upload = $request->file('logo_image');

                // 📁 Directory path inside public
                $directory = public_path('uploads/logo_image');

                // 🛠 Create directory if it doesn't exist
                if (!File::exists($directory)) {
                    File::makeDirectory($directory, 0755, true);
                }

                // 🏷 Generate unique file name
                $filename = time() . '_' . uniqid() . '.' . $upload->getClientOriginalExtension();

                // 🖼 Resize & save
                Image::read($upload)
                    ->resize(305, 305)
                    ->save($directory . '/' . $filename);
                $data['logo'] = isset($filename) ? 'uploads/logo_image/'.$filename : NULL;
            }
            $data['is_free_trail_done'] = 0;
            $data['subscribed_status'] = 0;
            $data['is_crm_db_created'] = 0;

            $branch = Branch::create($data);
            
            $prefix = strtoupper(substr($request->owner_name, 0, 4));
            $password = $prefix .'@'. rand(1111, 9999);
            if($request->is_this_main_branch == 1){
                $user = new User();
                $user->branch_id = $branch->id;
                $user->name = $request->owner_name;
                $user->email = $request->owner_email;
                $user->phone_number = $request->mobile_no;
                $user->password = Hash::make($password);
                $user->role_id = 2;
                $user->save();
                
                $branch = Branch::find($branch->id);
                $branch->owner_id = $user->id;
                $branch->save();
    
                DB::commit();
    
                if ($user) {
                    try {
                        //code...
                        $token = Password::createToken($user);
                    
                        $frontendUrl = env('REACT_APP_URL', 'http://localhost:3000');
                        $resetUrl = "{$frontendUrl}/reset-password?token={$token}&email={$user->email}";
                    
                        Mail::to($user->email)
                            ->send(new BranchOwnerCredentialsMail($user, $password, $resetUrl));
                    } catch (\Exception $e) {
                        // Log the error or handle it as needed
                        \Log::error('Failed to send branch owner credentials email: ' . $e->getMessage());
                    }
                }
            }else{
                DB::commit();

                $main_branch = Branch::find($request->branch_id);
                $branch = Branch::find($branch->id);
                $branch->owner_id = $main_branch->owner_id;
                $branch->save();
            }

            return $this->sendResponse($branch, 'Branch created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendError('Unable to create the branch. Please try again after sometime.', ['error_message' => $e->getMessage()], null, 410);
        }
    }

    /**
     * Show a single branch by branch_id (view).
     */
    public function show(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|numeric|exists:branches,id,deleted_at,NULL',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $branch = Branch::withTrashed()->find($request->branch_id);

        return $this->sendResponse($branch, 'Branch fetched successfully');
    }

    /**
     * Update an existing branch.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|numeric|exists:branches,id,deleted_at,NULL',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile_no' => 'nullable|string|max:15',
            'owner_name' => 'nullable|string|max:255',
            'owner_email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'country_id' => 'nullable|numeric|exists:countries,id,deleted_at,NULL',
            'state_id' => 'nullable|numeric|exists:states,id,deleted_at,NULL',
            'city_id' => 'nullable|numeric|exists:cities,id,deleted_at,NULL',
            'zip' => 'nullable|string|max:20',
            'logo' => 'nullable|string|max:555',
            'is_this_main_branch' => 'nullable|boolean|in:0,1',
            'status' => 'required|boolean|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $branch = Branch::find($request->branch_id);

        if (!$branch) {
            return $this->sendError('Branch not found', null, null, 404);
        }

        $data = $request->only([
            'name', 'email', 'mobile_no', 'owner_name', 'owner_email',
            'address', 'country_id', 'state_id', 'city_id', 'zip', 'logo',
            'is_this_main_branch', 'status',
        ]);

        if($branch->is_crm_db_created == 0){
            $name = preg_replace("/'s\b/i", '', $request->name);
            $remove_sc_name = Str::slug($name);
            $db_name = Str::slug($name, '_');
            $db_fillable_name = strtolower($db_name);

            $data['name_slug'] = $remove_sc_name;
            $data['crm_db_name'] = 'crm_lead_'. $db_fillable_name;
            $data['crm_comment_db_name'] = 'crm_lead_comment_'. $db_fillable_name;
        }

        if ($request->hasFile('logo_image')) {
            if (!empty($branch->logo)) {
                $oldImagePath = public_path($branch->logo_image);

                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                }
            }
            $upload = $request->file('logo_image');

            // 📁 Directory path inside public
            $directory = public_path('uploads/logo_image');

            // 🛠 Create directory if it doesn't exist
            if (!File::exists($directory)) {
                File::makeDirectory($directory, 0755, true);
            }

            // 🏷 Generate unique file name
            $filename = time() . '_' . uniqid() . '.' . $upload->getClientOriginalExtension();

            // 🖼 Resize & save
            Image::read($upload)
                ->resize(305, 305)
                ->save($directory . '/' . $filename);
            $data['logo'] = isset($filename) ? 'uploads/logo_image/'.$filename : NULL;
        }

        $branch->update($data);
        
        if($request->is_this_main_branch == 1){
            $user = User::where('branch_id', $branch->id)->where('role_id', 2)->first();
            if ($user) {
                $user->name = $request->owner_name;
                $user->save();
            }
            
            if($user && $branch->owner_id == null){
                $branch = Branch::find($branch->id);
                $branch->owner_id = $user->id;
                $branch->save();
            }
        }

        return $this->sendResponse($branch->fresh(), 'Branch updated successfully');
    }

    /**
     * Update branch status only.
     */
    public function update_status(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|numeric|exists:branches,id,deleted_at,NULL',
            'status' => 'required|boolean|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $branch = Branch::find($request->branch_id);

        if (!$branch) {
            return $this->sendError('Branch not found', null, null, 404);
        }

        
        $branch->status = $request->status;
        $branch->save();

        $user = User::where('branch_id', $branch->id)->get();
        if($user->isNotEmpty()){
            foreach($user as $u){
                $u->status = $request->status;
                $u->save();
            }
        }

        return $this->sendResponse($branch, 'Branch status updated successfully');
    }

    /**
     * Soft delete a branch.
     */
    public function destroy(Request $request)
    {
        $branch = Branch::find($request->branch_id);

        if (!$branch) {
            return $this->sendError('Branch not found', null, null, 404);
        }

        $branch->delete();
        
        $user = User::where('branch_id', $branch->id)->get();
        if($user->isNotEmpty()){
            foreach($user as $u){
                $u->delete();
            }
        }

        return $this->sendResponse(null, 'Branch deleted successfully');
    }
}
