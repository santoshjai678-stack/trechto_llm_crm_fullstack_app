<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Country;
use App\Models\State;

class CountryController extends BaseApiController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $country = Country::where("status", 1)->get();
        if($country->isNotEmpty()){
            return $this->sendResponse($country, 'Country fetched successfully');
        }else{
            return $this->sendResponse([], 'Country data not found');
        }
    }
    /**
     * Display a listing of the resource.
     */
    public function get_country(Request $request)
    {
        $query = Country::query();
        /*
        |--------------------------------------------------------------------------
        | Searching
        |--------------------------------------------------------------------------
        */
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereAny(
                ['name', 'iso_code', 'country_code'],
                'LIKE',
                "%{$search}%"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */
        $sortBy = $request->get('sort_by', 'id'); // default column
        $sortOrder = $request->get('sort_order', 'desc'); // asc or desc

        $allowedSortColumns = ['id', 'name', 'iso_code', 'country_code', 'created_at'];

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

        $countries = $query->paginate($perPage);

        return $this->sendPaginatedResponse($countries->items(), $countries, 'Country fetched successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z\s]+$/',
                'unique:countries,name,,NULL',
            ],
            'iso_code' => [
                'required',
                'string',
                'max:5',
                'regex:/^[A-Za-z\s]+$/',
                'unique:countries,iso_code,NULL',
            ],
            'country_code' => [
                'required',
                'min:2',
                'regex:/^\+?[0-9]+$/',
            ],
            'status' => 'required|boolean|in:0,1',
        ], [
            'name.regex' => 'Country name may only contain letters and spaces.',
            'iso_code.regex' => 'Country code may only contain letters and spaces.',
            'country_code.regex' => 'Country code may contain only + and numbers.',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $country = new Country();
        $country->name = $request->name;
        $country->iso_code = $request->iso_code;
        $country->country_code = $request->country_code;
        $country->status = $request->status;
        $country->save();

        return $this->sendResponse($country, 'Country created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request)
    {
        $id = $request->country_id;
        $validator = Validator::make($request->all(), [
            'country_id' => 'required|numeric|exists:countries,id,deleted_at,NULL',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }
        $country = Country::find($id);

        if (!$country) {
            return $this->sendError('Country not found', null, null, 404);
        }

        return $this->sendResponse($country, 'Country fetched successfully');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Country $country)
    {
        $validator = Validator::make($request->all(), [
            'country_id' => 'required|numeric|exists:countries,id,deleted_at,NULL',
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z\s]+$/',
                'unique:countries,name,' . $request->country_id,
            ],
            'iso_code' => [
                'required',
                'string',
                'max:5',
                'regex:/^[A-Za-z\s]+$/',
                'unique:countries,iso_code,' . $request->country_id,
            ],
            'country_code' => [
                'required',
                'min:2',
                'regex:/^\+?[0-9]+$/',
            ],
            'status' => 'required|boolean|in:0,1',
        ], [
            'name.regex' => 'Country name may only contain letters and spaces.',
            'iso_code.regex' => 'Country code may only contain letters and spaces.',
            'country_code.regex' => 'Country code may contain only + and numbers.',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $country = Country::find($request->country_id);
        $country->name = $request->name;
        $country->iso_code = $request->iso_code;
        $country->country_code = $request->country_code;
        $country->status = $request->status;
        $country->update();

        return $this->sendResponse($country, 'Country updated successfully');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update_status(Request $request, Country $country)
    {
        $validator = Validator::make($request->all(), [
            'country_id' => 'required|numeric|exists:countries,id,deleted_at,NULL',
            'status' => 'required|boolean|in:0,1',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $country = Country::find($request->country_id);
        $country->status = $request->status;
        $country->update();

        return $this->sendResponse($country, 'Country updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $country = Country::find($request->country_id);

        if (!$country) {
            return $this->sendError('Country not found', null, null, 404);
        }
        
        $state = State::where('country_id', $request->country_id)->first();

        if ($state) {
            return $this->sendError('Country has states associated with it and cannot be deleted', null, null, 400);
        }

        $country->delete();

        return $this->sendResponse(null, 'Country deleted successfully');
    }
}
