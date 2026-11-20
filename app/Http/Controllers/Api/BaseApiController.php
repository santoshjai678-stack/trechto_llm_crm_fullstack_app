<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class BaseApiController extends Controller
{
    protected function sendResponse($data = [], $message = 'Success', $statusCode = 200)
    {
        return response()->json([
            'status' => 'true',
            'status_code' => $statusCode,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    protected function sendError($message = 'Error', $errors = null, $data = null, $statusCode = 400)
    {
        $response = [
            'status' => 'false',
            'status_code' => $statusCode,
            'message' => $message,
        ];
        
        if (isset($errors)) {
            $response['errors'] = $errors;
        }

        if(isset($data)) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    protected function sendPaginatedResponse($items, $paginator, $message = 'Data fetched successfully')
    {
        return response()->json([
            'status' => 'true',
            'status_code' => 200,
            'message' => $message,
            'data' => $items,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ]
        ]);
    }
}