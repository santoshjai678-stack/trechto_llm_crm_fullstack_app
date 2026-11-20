<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class JwtMiddleware
{
    // /**
    //  * Handle an incoming request.
    //  *
    //  * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
    //  */
    // public function handle(Request $request, Closure $next): Response
    // {
    //     try {
    //         $token = $request->bearerToken(); // read Authorization: Bearer <token>
    //         if (!$token) {
    //             return response()->json(['error' => 'Token not provided'], 401);
    //         }

    //         // decode token (adjust secret and algo to your setup)
    //         $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));

    //         // you can attach decoded payload to request if needed
    //         $request->attributes->add(['jwt_payload' => (array) $decoded]);

    //     } catch (Exception $e) {
    //         return response()->json(['error' => 'Invalid token: '.$e->getMessage()], 401);
    //     }

    //     return $next($request);
    // }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, $guard = null)
    {
        // dd($guard);
        if($guard != null){
            auth()->shouldUse($guard);
            if(auth()->guard($guard)->check() == false)
            {
                return response(['status' => false, 'message' => 'Unauthenticated.'], 401);
            }
        }
        return $next($request);
    }
}

