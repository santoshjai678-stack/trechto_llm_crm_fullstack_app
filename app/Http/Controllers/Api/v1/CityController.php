<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\City;

class CityController extends BaseApiController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'country_id' => 'required',
            'state_id' => 'required',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }
        $city = City::where("status", 1)
            ->where("country_id", $request->country_id)
            ->where("state_id", $request->state_id)        
            ->get();

        if($city->isNotEmpty()){
            return $this->sendResponse($city, 'City fetched successfully');
        }else{
            return $this->sendResponse($city, 'City data not found');
        }
    }

    public function get_city(Request $request)
    {
        $query = City::query()
            ->leftJoin('states', 'cities.state_id', '=', 'states.id')
            ->leftJoin('countries', 'cities.country_id', '=', 'countries.id')
            ->select(
                'cities.*',
                'states.name as state_name',
                'countries.name as country_name'
            );

        /*
        |--------------------------------------------------------------------------
        | Searching
        |--------------------------------------------------------------------------
        */
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('cities.name', 'LIKE', "%{$search}%")
                ->orWhere('states.name', 'LIKE', "%{$search}%")
                ->orWhere('countries.name', 'LIKE', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */
        $sortBy = $request->get('sort_by', 'cities.id');
        $sortOrder = $request->get('sort_order', 'desc');

        $sortMap = [
            'id' => 'cities.id',
            'name' => 'cities.name',
            'created_at' => 'cities.created_at',
            'state_name' => 'states.name',
            'country_name' => 'countries.name',
        ];

        $sortBy = $sortMap[$sortBy] ?? 'cities.id';

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

        $cities = $query->paginate($perPage);

        return $this->sendPaginatedResponse($cities->items(), $cities, 'City fetched successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'country_id' => 'required|numeric|exists:countries,id,deleted_at,NULL',
            'state_id' => 'required|numeric|exists:states,id,deleted_at,NULL',
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z\s]+$/',
                'unique:cities,name,NULL,id,state_id,' . $request->state_id,
            ],
            'status' => 'required|boolean|in:0,1',
        ], [
            'name.regex' => 'City name may only contain letters and spaces.',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $city = new City();
        $city->country_id = $request->country_id;
        $city->state_id = $request->state_id;
        $city->name = $request->name;
        $city->status = $request->status;
        $city->save();

        return $this->sendResponse($city, 'City created successfully');
    }

    public function show(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city_id' => 'required|numeric|exists:cities,id,deleted_at,NULL',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $city = City::find($request->city_id);

        return $this->sendResponse($city, 'City fetched successfully');
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city_id' => 'required|numeric|exists:cities,id,deleted_at,NULL',
            'country_id' => 'required|numeric|exists:countries,id,deleted_at,NULL',
            'state_id' => 'required|numeric|exists:states,id,deleted_at,NULL',
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z\s]+$/',
                'unique:cities,name,' . $request->city_id . ',id,state_id,' . $request->state_id,
            ],
            'status' => 'required|boolean|in:0,1',
        ], [
            'name.regex' => 'City name may only contain letters and spaces.',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $city = City::find($request->city_id);
        $city->country_id = $request->country_id;
        $city->state_id = $request->state_id;
        $city->name = $request->name;
        $city->status = $request->status;
        $city->update();

        return $this->sendResponse($city, 'City updated successfully');
    }

    public function update_status(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city_id' => 'required|numeric|exists:cities,id,deleted_at,NULL',
            'status' => 'required|boolean|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $city = City::find($request->city_id);
        $city->status = $request->status;
        $city->update();

        return $this->sendResponse($city, 'City status updated successfully');
    }

    public function destroy(Request $request)
    {
        $city = City::find($request->city_id);

        if (!$city) {
            return $this->sendError('City not found', null, null, 404);
        }

        $city->delete();

        return $this->sendResponse(null, 'City deleted successfully');
    }

}
