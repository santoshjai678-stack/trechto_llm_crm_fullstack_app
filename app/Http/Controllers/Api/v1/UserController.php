<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class UserController extends BaseApiController
{
    // 👤 USER PROFILE
    public function profile()
    {
        $loginedUser = auth()->user();
        $user = User::find($loginedUser->id);
        return $this->sendResponse($user, 'User profile fetched successfully');
    }

    // 👤 UPDATE PROFILE
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|email|unique:users,email,' . auth()->user()->id,
            'phone_number' => 'required|numeric|digits:10',
            'address' => 'required|string|max:255',
            'city_id' => 'required',
            'state_id' => 'required',
            'zip' => 'required|numeric|digits:6',
            'country_id' => 'required',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $user = auth()->user();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone_number = $request->phone_number;
        $user->address = $request->address;
        $user->city_id = $request->city_id;
        $user->state_id = $request->state_id;
        $user->zip = $request->zip;
        $user->country_id = $request->country_id;
        if ($request->hasFile('profile_image')) {
            if (!empty($user->profile_image)) {
                $oldImagePath = public_path($user->profile_image);

                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                }
            }
            $upload = $request->file('profile_image');

            // 📁 Directory path inside public
            $directory = public_path('uploads/profile_images');

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
            $user->profile_image = isset($filename) ? 'uploads/profile_images/'.$filename : NULL;
        }
        $user->save();

        return $this->sendResponse($user, 'User profile updated successfully');
    }

    // 🔐 CHANGE PASSWORD
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|current_password',
            'new_password' => [
                'required',
                'confirmed',
                'different:current_password',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            'new_password_confirmation' => 'required|min:8|same:new_password',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $user = auth()->user();

        // if (!Hash::check($request->current_password, $user->password)) {
        //     $response["status"] = "false";
        //     $response["status_code"] = 422;
        //     $response["message"] = "Current password is incorrect";
        //     return response()->json($response, 422);
        // }

        $user->password = Hash::make($request->new_password);
        $user->save();
        return $this->sendResponse($user->refresh(), 'Password changed successfully');
    }

}
