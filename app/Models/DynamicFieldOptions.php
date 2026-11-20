<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DynamicFieldOptions extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'branch_id', 
        'field_id', 
        'created_by', 
        'updated_by',
        'name',
        'value',
        'status'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function dynamicField()
    {
        return $this->belongsTo(DynamicLeadField::class, 'field_id');
    }
    
    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
