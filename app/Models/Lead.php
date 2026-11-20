<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    // use SoftDeletes;

    protected $table;

    protected $casts = [
        'status' => 'integer',
    ];

    public function __construct(array $attributes = [], $branchId = null)
    {
        parent::__construct($attributes);

        if ($branchId) {
            $branch = \App\Models\Branch::find($branchId);

            if ($branch) {
                $this->setTable($branch->crm_db_name);
            }
        }
    }

    public function branch()
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }
}