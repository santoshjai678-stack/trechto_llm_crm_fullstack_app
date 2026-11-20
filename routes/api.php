<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\UserController;
use App\Http\Controllers\Api\v1\CountryController;
use App\Http\Controllers\Api\v1\StateController;
use App\Http\Controllers\Api\v1\CityController;
use App\Http\Controllers\Api\v1\BranchController;
use App\Http\Controllers\Api\v1\SubscriptionController;
use App\Http\Controllers\Api\v1\EmployeeController;
use App\Http\Controllers\Api\v1\FormSectionController;
use App\Http\Controllers\Api\v1\CommentController;
use App\Http\Controllers\Api\v1\RoleController;
use App\Http\Controllers\Api\v1\LeadController;
use App\Http\Controllers\Api\v1\DynamicLeadFieldController;
use App\Http\Controllers\Api\v1\DynamicFieldOptionController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
Route::options('{any}', function () {
    return response()->json([], 200);
})->where('any', '.*');

Route::prefix('v1')->group(function () {
    // Route::middleware(['cors.custom'])->group(function () {
        // 🔐 AUTH
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password-by-token', [AuthController::class, 'resetPassword']);
    // });

    Route::group(['middleware' => ['assign.guard:api', 'jwt.auth']], function () {
        Route::get('/logout', [AuthController::class, 'logout']);
        Route::get('/refresh-token', [AuthController::class, 'refreshToken']);

        // 👤 USER
        Route::get('/profile', [UserController::class, 'profile']);
        Route::post('/update-profile', [UserController::class, 'updateProfile']);
        Route::post('/change-password', [UserController::class, 'changePassword']);
        
        // Role
        Route::get('/get_role', [RoleController::class, 'index']);
        Route::get('/get_role_list', [RoleController::class, 'get_role']);
        Route::post('/add_role', [RoleController::class, 'store']);
        Route::post('/show_role', [RoleController::class, 'show']);
        Route::post('/update_role', [RoleController::class, 'update']);
        Route::post('/update_role_status', [RoleController::class, 'update_status']);
        Route::post('/delete_role', [RoleController::class, 'destroy']);
        
        // Country
        Route::get('/get_country', [CountryController::class, 'index']);
        Route::get('/get_country_list', [CountryController::class, 'get_country']);
        Route::post('/add_country', [CountryController::class, 'store']);
        Route::post('/update_country', [CountryController::class, 'update']);
        Route::get('/get_country_by_id', [CountryController::class, 'show']);
        Route::post('/update_country_status', [CountryController::class, 'update_status']);
        Route::post('/delete_country', [CountryController::class, 'destroy']);
        
        // State
        Route::post('/get_state', [StateController::class, 'index']);
        Route::get('/get_state_list', [StateController::class, 'get_state']);
        Route::post('/add_state', [StateController::class, 'store']);
        Route::post('/update_state', [StateController::class, 'update']);
        Route::get('/get_state_by_id', [StateController::class, 'show']);
        Route::post('/update_state_status', [StateController::class, 'update_status']);
        Route::post('/delete_state', [StateController::class, 'destroy']);
        
        // City
        Route::post('/get_city', [CityController::class, 'index']);
        Route::get('/get_city_list', [CityController::class, 'get_city']);
        Route::post('/add_city', [CityController::class, 'store']);
        Route::post('/show_city', [CityController::class, 'show']);
        Route::post('/update_city', [CityController::class, 'update']);
        Route::post('/update_city_status', [CityController::class, 'update_status']);
        Route::post('/delete_city', [CityController::class, 'destroy']);

        // Branch
        Route::get('/get_branch', [BranchController::class, 'index']);
        Route::get('/get_branch_subbranch', [BranchController::class, 'get_branch_subbranch']);
        Route::get('/get_branch_list', [BranchController::class, 'get_branch']);
        Route::post('/add_branch', [BranchController::class, 'store']);
        Route::post('/show_branch', [BranchController::class, 'show']);
        Route::post('/update_branch', [BranchController::class, 'update']);
        Route::post('/update_branch_status', [BranchController::class, 'update_status']);
        Route::post('/delete_branch', [BranchController::class, 'destroy']);

        // Subscription
        Route::get('/get_subscription', [SubscriptionController::class, 'index']);
        Route::get('/get_subscription_list', [SubscriptionController::class, 'get_subscription']);
        Route::post('/add_subscription', [SubscriptionController::class, 'store']);
        Route::post('/show_subscription', [SubscriptionController::class, 'show']);
        Route::post('/update_subscription', [SubscriptionController::class, 'update']);
        Route::post('/update_subscription_status', [SubscriptionController::class, 'update_status']);
        Route::post('/delete_subscription', [SubscriptionController::class, 'destroy']);

        // Employee
        Route::get('/get_employee', [EmployeeController::class, 'index']);
        Route::get('/get_sales_executives', [EmployeeController::class, 'get_sales_executives']);
        Route::get('/get_employee_list', [EmployeeController::class, 'getEmployeeList']);
        Route::post('/add_employee', [EmployeeController::class, 'store']);
        Route::post('/view_employee', [EmployeeController::class, 'show']);
        Route::post('/update_employee', [EmployeeController::class, 'update']);
        Route::post('/update_employee_status', [EmployeeController::class, 'update_status']);
        Route::post('/delete_employee', [EmployeeController::class, 'destroy']);

        // Form Sections
        Route::get('/get_form_sections_dropdown', [FormSectionController::class, 'index']);
        Route::get('/get_form_sections_with_fields', [FormSectionController::class, 'get_form_section_with_fields']);
        Route::get('/get_form_sections', [FormSectionController::class, 'get_form_sections']);
        Route::post('/add_form_section', [FormSectionController::class, 'add_form_section']);
        Route::post('/update_form_section', [FormSectionController::class, 'update_form_section']);
        Route::get('/view_form_section/{id}', [FormSectionController::class, 'view_form_section']);
        Route::post('/update_form_section_status', [FormSectionController::class, 'update_form_section_status']);
        Route::delete('/delete_form_section/{id}', [FormSectionController::class, 'delete_form_section']);

        // Dynamic Lead Fields
        Route::get('/get_dynamic_lead_fields_dropdown', [DynamicLeadFieldController::class, 'index']);
        Route::get('/get_dynamic_lead_fields_for_filter', [DynamicLeadFieldController::class, 'dynamic_field_for_filter']);
        Route::get('/get_dynamic_lead_fields_for_datatable_list', [DynamicLeadFieldController::class, 'dynamic_field_for_datatable_list']);
        Route::get('/get_dynamic_lead_fields', [DynamicLeadFieldController::class, 'get_dynamic_lead_fields']);
        Route::post('/add_dynamic_lead_field', [DynamicLeadFieldController::class, 'store']);
        Route::post('/update_dynamic_lead_field', [DynamicLeadFieldController::class, 'update']);
        Route::get('/view_dynamic_lead_field/{id}', [DynamicLeadFieldController::class, 'show']);
        Route::post('/update_dynamic_lead_field_status', [DynamicLeadFieldController::class, 'update_dynamic_lead_field_status']);
        Route::delete('/delete_dynamic_lead_field/{id}', [DynamicLeadFieldController::class, 'destroy']);

        // Dynamic Field Options
        Route::get('/get_dynamic_field_options_dropdown', [DynamicFieldOptionController::class, 'index']);
        Route::get('/get_dynamic_field_options', [DynamicFieldOptionController::class, 'get_dynamic_field_options']);
        Route::post('/add_update_dynamic_field_option', [DynamicFieldOptionController::class, 'add_update_dynamic_field_option']);
        Route::get('/view_dynamic_field_option/{id}', [DynamicFieldOptionController::class, 'show']);
        Route::post('/update_dynamic_field_option_status', [DynamicFieldOptionController::class, 'update_dynamic_option_status']);
        Route::delete('/delete_dynamic_field_option/{id}', [DynamicFieldOptionController::class, 'destroy']);

        // Leads
        Route::get('/get_leads', [LeadController::class, 'index']);
        Route::get('/view_lead/{id}', [LeadController::class, 'show']);
        Route::post('/add_lead', [LeadController::class, 'store']);
        Route::post('/update_lead', [LeadController::class, 'update']);
        Route::post('/update_lead_status', [LeadController::class, 'update_lead_status']);
        Route::delete('/delete_lead/{id}', [LeadController::class, 'destroy']);

        // Comments
        Route::get('/get_comment_dropdown', [CommentController::class, 'index']);
        Route::get('/get_comments', [CommentController::class, 'get_comments']);
        Route::post('/add_comment', [CommentController::class, 'add_comment']);
        Route::post('/update_comment', [CommentController::class, 'update_comment']);
        Route::get('/view_comment/{id}', [CommentController::class, 'view_comment']);
        Route::post('/update_comment_status', [CommentController::class, 'update_comment_status']);
        Route::delete('/delete_comment/{id}', [CommentController::class, 'delete_comment']);

    });

});
