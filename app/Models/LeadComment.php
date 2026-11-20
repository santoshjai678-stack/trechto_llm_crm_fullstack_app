<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\SoftDeletes;

class LeadComment extends Model
{
    // use SoftDeletes;

    protected $table;

    protected $appends = ['comment_name'];
    protected $casts = [
        'status' => 'integer',
    ];

    public function __construct(array $attributes = [], $branchId = null)
    {
        parent::__construct($attributes);

        if ($branchId) {
            $branch = \App\Models\Branch::find($branchId);

            if ($branch) {
                $this->setTable($branch->crm_comment_db_name);
            }
        }
    }

    public function comment()
    {
        return $this->belongsTo(\App\Models\Comment::class, 'comment_id');
    }

    public function getCommentNameAttribute()
    {
        return $this->comment ? $this->comment->comment : null;
    }
}