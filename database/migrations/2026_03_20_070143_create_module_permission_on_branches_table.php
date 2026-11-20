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
        Schema::create('module_permission_on_branches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id')->index();
            $table->unsignedBigInteger('module_id')->index();
            $table->boolean('is_permitted')->index('is_permitted')->default(1)->comment('1=permitted,0=not_permitted');
            $table->boolean('status')->index()->default(1)->comment('1=active,0=inactive');
            $table->softDeletes();
            // created_at with default current timestamp 
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            // updated_at with default current timestamp and auto-update 
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'))->useCurrentOnUpdate();

            $table->foreign('branch_id')
                ->references('id')
                ->on('branches')
                ->onDelete('cascade');

            $table->foreign('module_id')
                ->references('id')
                ->on('modules')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_permission_on_branches');
    }
};
