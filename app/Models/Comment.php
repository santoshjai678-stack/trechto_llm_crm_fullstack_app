<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Branch;

class Comment extends Model
{
    use SoftDeletes;

    protected $table = 'comments';

    protected $fillable = [
        'branch_id',
        'created_by',
        'updated_by',
        'comment',
        'is_comment_for_crm',
        'status',
    ];

    protected $casts = [
        'status' => 'integer',
        'is_comment_for_crm' => 'integer',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}
