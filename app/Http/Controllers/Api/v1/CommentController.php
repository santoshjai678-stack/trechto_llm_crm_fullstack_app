<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Comment;

class CommentController extends BaseApiController
{
    /**
     * Display a listing of active roles for dropdown.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        try {
            $comment = Comment::where('status', 1)
                ->select('id', 'comment');
            if($user->role_id != 1){
                $comment = $comment->where('branch_id', $user->branch_id);
            }

            if ($request->filled('branch_id')) {
                $comment = $comment->where('branch_id', $request->branch_id);
            }

            $comment = $comment->get();
            
            if ($comment->isNotEmpty()) {
                return $this->sendResponse($comment, 'Comments fetched successfully');
            } else {
                return $this->sendResponse([], 'No comments found');
            }
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch comments', $e->getMessage(), null, 500);
        }
    }

    public function get_comments(Request $request)
    {
        try {
            $user = auth()->user();
            $query = Comment::select('comments.*', 'branch.name as branch_name')
                    ->leftJoin('branches AS branch', 'comments.branch_id', '=', 'branch.id');

            if($user->role_id != 1){
                $query->where("comments.branch_id", $user->branch_id);
            }
            
            if ($request->filled('search')) {
                $query->where('comments.comment', 'LIKE', "%{$request->search}%");
            }

            if ($request->filled('branch_id')) {
                $query->where('comments.branch_id', $request->branch_id);
            }

            if ($request->filled('is_comment_for_crm')) {
                $query->where('comments.is_comment_for_crm', $request->is_comment_for_crm);
            }

            $sortBy = $request->get('sort_by', 'id');
            $sortOrder = $request->get('sort_order', 'desc');

            $allowedSort = ['id', 'comment', 'branch_id', 'is_comment_for_crm', 'status', 'created_at', 'updated_at'];
            if (!in_array($sortBy, $allowedSort)) {
                $sortBy = 'id';
            }
            if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
                $sortOrder = 'desc';
            }

            $query->orderBy($sortBy, $sortOrder);

            $perPage = (int) $request->get('per_page', 10);
            if (!in_array($perPage, [1, 10, 25, 50, 100])) {
                $perPage = 10;
            }

            $comments = $query->paginate($perPage);

            return $this->sendPaginatedResponse($comments->items(), $comments, 'Comments fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch comments', $e->getMessage(), null, 500);
        }
    }

    public function add_comment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|numeric|exists:branches,id,deleted_at,NULL',
            'comment' => 'required|string',
            'is_comment_for_crm' => 'required|in:0,1',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            $comment = Comment::create([
                'branch_id' => $request->branch_id,
                'comment' => $request->comment,
                'is_comment_for_crm' => $request->is_comment_for_crm,
                'status' => $request->status,
                'created_by' => auth()->id(),
            ]);

            return $this->sendResponse($comment, 'Comment created successfully', 201);
        } catch (\Exception $e) {
            return $this->sendError('Failed to create comment', $e->getMessage(), null, 500);
        }
    }

    public function update_comment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'comment_id' => 'required|numeric|exists:comments,id,deleted_at,NULL',
            'branch_id' => 'required|numeric|exists:branches,id,deleted_at,NULL',
            'comment' => 'required|string',
            'is_comment_for_crm' => 'required|in:0,1',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            $comment = Comment::find($request->comment_id);
            if (!$comment) {
                return $this->sendError('Comment not found', null, null, 404);
            }

            $comment->branch_id = $request->branch_id;
            $comment->comment = $request->comment;
            $comment->is_comment_for_crm = $request->is_comment_for_crm;
            $comment->status = $request->status;
            $comment->updated_by = auth()->id();
            $comment->save();

            return $this->sendResponse($comment, 'Comment updated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to update comment', $e->getMessage(), null, 500);
        }
    }

    public function view_comment($id)
    {
        try {
            $comment = Comment::with('branch')->find($id);

            if (!$comment) {
                return $this->sendError('Comment not found', null, null, 404);
            }

            return $this->sendResponse($comment, 'Comment fetched successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to fetch comment', $e->getMessage(), null, 500);
        }
    }

    public function update_comment_status(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'comment_id' => 'required|numeric|exists:comments,id,deleted_at,NULL',
            'status' => 'required|in:0,1',
        ]);
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), null, 422);
        }

        try {
            $comment = Comment::find($request->comment_id);
            if (!$comment) {
                return $this->sendError('Comment not found', null, null, 404);
            }

            $comment->status = $request->status;
            $comment->updated_by = auth()->id();
            $comment->save();

            return $this->sendResponse($comment, 'Comment status updated successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to update comment status', $e->getMessage(), null, 500);
        }
    }

    public function delete_comment($id)
    {
        try {
            $comment = Comment::find($id);

            if (!$comment) {
                return $this->sendError('Comment not found', null, null, 404);
            }

            $comment->delete();

            return $this->sendResponse(null, 'Comment deleted successfully');
        } catch (\Exception $e) {
            return $this->sendError('Failed to delete comment', $e->getMessage(), null, 500);
        }
    }
}
