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
        Schema::create('branches_subscribed_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('subscription_id')->index();
            $table->unsignedBigInteger('subscriber_id')->index();
            
            $table->unsignedInteger('lms_crm_access')->nullable()->index();
            
            $table->unsignedInteger('max_users')->nullable()->index();
            $table->boolean('max_users_status')->default(1)->comment('1=active,0=inactive');
            $table->boolean('max_users_is_unlimited')->default(1)->comment('1=active,0=inactive');
            
            $table->unsignedInteger('max_branches')->nullable()->index();
            $table->boolean('max_branches_status')->default(1)->comment('1=active,0=inactive');
            $table->boolean('max_branches_is_unlimited')->default(1)->comment('1=active,0=inactive');
            
            $table->unsignedInteger('max_leads')->nullable()->index();
            $table->boolean('max_leads_status')->default(1)->comment('1=active,0=inactive');
            $table->boolean('max_leads_is_unlimited')->default(1)->comment('1=active,0=inactive');
            
            $table->unsignedInteger('max_comment')->nullable()->index();
            $table->boolean('max_comment_status')->default(1)->comment('1=active,0=inactive');
            $table->boolean('max_comment_is_unlimited')->default(1)->comment('1=active,0=inactive');
            
            $table->unsignedInteger('max_compaigns')->nullable()->index();
            $table->boolean('max_compaigns_status')->default(1)->comment('1=active,0=inactive');
            $table->boolean('max_compaigns_is_unlimited')->default(1)->comment('1=active,0=inactive');
            
            $table->boolean('status')->default(1)->comment('1=active,0=inactive');
            $table->softDeletes();
            // created_at with default current timestamp 
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            // updated_at with default current timestamp and auto-update 
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'))->useCurrentOnUpdate();
            
            $table->foreign('subscription_id')
                ->references('id')
                ->on('subscriptions')
                ->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_subscribed_details');
    }
};
