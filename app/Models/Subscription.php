<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'type',
        'name',
        'code',
        'description',
        'price',
        'duration',
        'duration_type',
        'is_trial',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration' => 'integer',
        'is_trial' => 'integer',
        'status' => 'integer',
    ];

    public function feature()
    {
        return $this->hasOne(SubscriptionFeature::class);
    }
}

