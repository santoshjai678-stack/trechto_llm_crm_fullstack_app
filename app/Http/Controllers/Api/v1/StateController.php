<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\State;
use App\Models\City;

class StateController extends BaseApiController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {        
        $validator = Validator::make($request->all(), [
            'country_id' => 'required',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $state = State::where("status", 1)
            ->where("country_id", $request->country_id)
            ->get();

        if($state->isNotEmpty()){
            return $this->sendResponse($state, 'State fetched successfully');
        }else{
            return $this->sendResponse($state, 'State data not found');
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function get_state(Request $request)
    {
        $query = State::query()
            ->leftJoin('countries', 'states.country_id', '=', 'countries.id')
            ->select(
                'states.*',
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
                $q->where('states.name', 'LIKE', "%{$search}%")
                  ->orWhere('countries.name', 'LIKE', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */
        $sortBy = $request->get('sort_by', 'states.id'); // default column
        $sortOrder = $request->get('sort_order', 'desc'); // asc or desc

        $allowedSortColumns = [
            'states.id',
            'states.name',
            'states.created_at',
            'country_name'
        ];
        
        // Map frontend sort keys to DB columns
        $sortMap = [
            'id' => 'states.id',
            'name' => 'states.name',
            'created_at' => 'states.created_at',
            'country_name' => 'countries.name',
        ];

        if (isset($sortMap[$sortBy])) {
            $sortBy = $sortMap[$sortBy];
        } else {
            $sortBy = 'states.id';
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

        $states = $query->paginate($perPage);

        return $this->sendPaginatedResponse($states->items(), $states, 'State fetched successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'country_id' => 'required|numeric|exists:countries,id,deleted_at,NULL',
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z\s]+$/',
                'unique:states,name,NULL,id,country_id,' . $request->country_id,
            ],
            'status' => 'required|boolean|in:0,1',
        ], [
            'name.regex' => 'State name may only contain letters and spaces.',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $state = new state();
        $state->country_id = $request->country_id;
        $state->name = $request->name;
        $state->status = $request->status;
        $state->save();

        return $this->sendResponse($state, 'State created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request)
    {
        $id = $request->state_id;
        $validator = Validator::make($request->all(), [
            'state_id' => 'required|numeric|exists:states,id,deleted_at,NULL',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }
        $state = State::find($id);

        if (!$state) {
            return $this->sendError('State not found', null, null, 404);
        }

        return $this->sendResponse($state, 'State fetched successfully');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, state $state)
    {
        $validator = Validator::make($request->all(), [
            'state_id' => 'required|numeric|exists:states,id,deleted_at,NULL',
            'country_id' => 'required|numeric|exists:countries,id,deleted_at,NULL',
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[A-Za-z\s]+$/',
                'unique:states,name,' . $request->state_id . ',id,country_id,' . $request->country_id,
            ],
            'status' => 'required|boolean|in:0,1',
        ], [
            'name.regex' => 'State name may only contain letters and spaces.',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $state = State::find($request->state_id);
        $state->country_id = $request->country_id;
        $state->name = $request->name;
        $state->status = $request->status;
        $state->update();

        return $this->sendResponse($state, 'State updated successfully');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update_status(Request $request, State $state)
    {
        $validator = Validator::make($request->all(), [
            'state_id' => 'required|numeric|exists:states,id,deleted_at,NULL',
            'status' => 'required|boolean|in:0,1',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        $state = State::find($request->state_id);
        $state->status = $request->status;
        $state->update();

        return $this->sendResponse($state, 'State updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $state = State::find($request->state_id);

        if (!$state) {
            return $this->sendError('State not found', null, null, 404);
        }
        
        $city = City::where('state_id', $request->state_id)->first();

        if ($city) {
            return $this->sendError('State has cities associated with it and cannot be deleted', null, null, 400);
        }

        $state->delete();

        return $this->sendResponse(null, 'State deleted successfully');
    }
}
