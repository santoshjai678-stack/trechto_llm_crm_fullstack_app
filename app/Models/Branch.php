<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use SoftDeletes;

    protected $table = 'branches';

    protected $fillable = [
        'branch_id',
        'owner_id',
        'created_by_id',
        'name',
        'name_slug',
        'email',
        'mobile_no',
        'owner_name',
        'owner_email',
        'address',
        'country_id',
        'state_id',
        'city_id',
        'zip',
        'logo',
        'is_this_main_branch',
        'is_crm_db_created',
        'crm_db_name',
        'crm_comment_db_name',
        'user_subscribed_id',
        'is_free_trail_done',
        'subscribed_status',
        'status',
    ];

    protected $casts = [
        'is_this_main_branch' => 'integer',
        'status' => 'integer',
    ];
}
