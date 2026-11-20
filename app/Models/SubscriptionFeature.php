<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionFeature extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'subscription_id',
        'lms_crm_access',
        'max_users',
        'max_users_status',
        'max_users_is_unlimited',
        'max_branches',
        'max_branches_status',
        'max_branches_is_unlimited',
        'max_leads',
        'max_leads_status',
        'max_leads_is_unlimited',
        'max_comment',
        'max_comment_status',
        'max_comment_is_unlimited',
        'max_compaigns',
        'max_compaigns_status',
        'max_compaigns_is_unlimited',
        'status',
    ];

    protected $casts = [
        'lms_crm_access' => 'integer',
        'max_users' => 'integer',
        'max_users_status' => 'integer',
        'max_users_is_unlimited' => 'integer',
        'max_branches' => 'integer',
        'max_branches_status' => 'integer',
        'max_branches_is_unlimited' => 'integer',
        'max_leads' => 'integer',
        'max_leads_status' => 'integer',
        'max_leads_is_unlimited' => 'integer',
        'max_comment' => 'integer',
        'max_comment_status' => 'integer',
        'max_comment_is_unlimited' => 'integer',
        'max_compaigns' => 'integer',
        'max_compaigns_status' => 'integer',
        'max_compaigns_is_unlimited' => 'integer',
        'status' => 'integer',
    ];

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
}
