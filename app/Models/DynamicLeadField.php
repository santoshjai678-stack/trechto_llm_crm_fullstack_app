<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DynamicLeadField extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'branch_id', 
        'section_id', 
        'created_by', 
        'updated_by',
        'name',
        'slug',
        'field_length',
        'field_label',
        'input_type',
        'max_length',
        'min_length',
        'is_unique',
        'show_on_lead_list',
        'is_required',
        'show_in_filter',
        'is_birthday_field',
        'status'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function section()
    {
        return $this->belongsTo(FormSection::class, 'section_id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function dynamicFieldOption()
    {
        return $this->hasMany(DynamicFieldOptions::class, 'field_id');
    }
}