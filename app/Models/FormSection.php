<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Branch;

class FormSection extends Model
{
    use SoftDeletes;

    protected $table = 'form_sections';

    protected $fillable = [
        'branch_id',
        'created_by',
        'updated_by',
        'name',
        'status',
    ];

    protected $casts = [
        'status' => 'integer',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function dynamicField()
    {
        return $this->hasMany(DynamicLeadField::class, 'section_id');
    }
}
