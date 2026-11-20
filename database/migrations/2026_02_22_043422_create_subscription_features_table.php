<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscription_features', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('lms_crm_access')->index()->nullable();
            
            $table->unsignedInteger('max_users')->index()->nullable();
            $table->boolean('max_users_status')->default(1)->comment('1=active,0=inactive');
            $table->boolean('max_users_is_unlimited')->default(1)->comment('1=active,0=inactive');
            
            $table->unsignedInteger('max_branches')->index()->nullable();
            $table->boolean('max_branches_status')->default(1)->comment('1=active,0=inactive');
            $table->boolean('max_branches_is_unlimited')->default(1)->comment('1=active,0=inactive');
            
            $table->unsignedInteger('max_leads')->index()->nullable();
            $table->boolean('max_leads_status')->default(1)->comment('1=active,0=inactive');
            $table->boolean('max_leads_is_unlimited')->default(1)->comment('1=active,0=inactive');
            
            $table->unsignedInteger('max_comment')->index()->nullable();
            $table->boolean('max_comment_status')->default(1)->comment('1=active,0=inactive');
            $table->boolean('max_comment_is_unlimited')->default(1)->comment('1=active,0=inactive');
            
            $table->unsignedInteger('max_compaigns')->index()->nullable();
            $table->boolean('max_compaigns_status')->default(1)->comment('1=active,0=inactive');
            $table->boolean('max_compaigns_is_unlimited')->default(1)->comment('1=active,0=inactive');
            
            $table->boolean('status')->default(1)->comment('1=active,0=inactive');
            $table->softDeletes();
            // created_at with default current timestamp 
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            // updated_at with default current timestamp and auto-update 
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'))->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_features');
    }
};
