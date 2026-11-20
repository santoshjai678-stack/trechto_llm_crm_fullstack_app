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
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id')->nullable()->index('branch_id');
            $table->unsignedBigInteger('owner_id')->nullable()->index('owner_id');
            $table->unsignedBigInteger('created_by_id')->nullable()->index('created_by_id');
            $table->string('name', 255);
            $table->string('name_slug', 255);
            $table->string('email', 255)->nullable();
            $table->string('mobile_no', 15)->nullable();
            $table->string('owner_name')->nullable();
            $table->string('owner_email')->nullable();
            $table->string('address')->nullable();
            $table->unsignedBigInteger('country_id')->nullable()->index('country_id');
            $table->unsignedBigInteger('state_id')->nullable()->index('state_id');
            $table->unsignedBigInteger('city_id')->nullable()->index('city_id');
            $table->string('zip')->nullable();
            $table->string('logo', 555)->nullable();
            
            $table->boolean('is_this_main_branch')->index()->default(1);
            $table->boolean('is_crm_db_created')->index()->default(0);
            $table->string('crm_db_name', 255)->index();
            $table->string('crm_comment_db_name', 255)->index();

            $table->unsignedBigInteger('branch_subscribed_id')->index()->nullable()->index('branch_subscribed_id');
            $table->boolean('is_free_trail_done')->default(1)->comment('1=done,0=not done');;
            $table->boolean('subscribed_status')->default(1)->comment('1=active,0=inactive');;
            
            $table->boolean('status')->index()->default(1)->comment('1=active,0=inactive');;
            $table->softDeletes();
            // created_at with default current timestamp 
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP')); 
            // updated_at with default current timestamp and auto-update 
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'))->useCurrentOnUpdate();

            // foreign key
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('set null');
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('country_id')->references('id')->on('countries')->onDelete('set null');
            $table->foreign('state_id')->references('id')->on('states')->onDelete('set null');
            $table->foreign('city_id')->references('id')->on('cities')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
