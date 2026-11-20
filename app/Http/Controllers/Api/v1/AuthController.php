<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class AuthController extends BaseApiController
{
    // 🔐 LOGIN
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);
        // $password = Hash::make($request->password);
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }
            
        if (!$token = auth()->attempt($request->only('email', 'password'))) {
            return $this->sendError('Invalid credentials', null, null, 422);
        }else{
            return $this->sendResponse(['token' => $token], 'Login successful');
        }
    }

    // 🔁 REFRESH TOKEN
    public function refreshToken()
    {
        try{
            return $this->sendResponse(['token' => auth()->refresh()], 'Session refreshed successfully');
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return $this->sendError('Token expired', null, null, 401);
        } catch (\Exception $e) {
            return $this->sendError('Invalid token', null, null, 401);
        }
    }

    // 🚪 LOGOUT
    public function logout()
    {
        auth()->logout();
        return $this->sendResponse(null, 'Logged out successfully');
    }

    // 📧 FORGOT PASSWORD
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $status = Password::sendResetLink($request->only('email'));
        
        if ($status === Password::RESET_LINK_SENT) {
            return $this->sendResponse(null, 'Password reset link sent to your email');
        }

        return $this->sendError('Unable to send reset link', null, null, 400);
    }

    // 🔑 RESET PASSWORD
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
            ]
        ],[
            "password.regex" => "The password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character."
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );
        
        if ($status === Password::PASSWORD_RESET) {
            return $this->sendResponse(null, 'Password reset successfully');
        }

        return $this->sendError('Invalid token', null, null, 400);
    }

    // 🔐 TOKEN RESPONSE
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth()->factory()->getTTL() * 60,
            'user'         => auth()->user()
        ]);
    }

}
