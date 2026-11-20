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
        Schema::create('branch_role_module_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id')->index();
            $table->unsignedBigInteger('role_id')->index();
            $table->unsignedBigInteger('module_id')->index();
            $table->unsignedBigInteger('sub_module_id')->index();

            $table->boolean('can_view_access')->index()->default(1)->comment('1=yes,0=no');
            $table->boolean('can_add_access')->index()->default(1)->comment('1=yes,0=no');
            $table->boolean('can_edit_access')->index()->default(1)->comment('1=yes,0=no');
            $table->boolean('can_delete_access')->index()->default(1)->comment('1=yes,0=no');
            $table->boolean('can_change_status_access')->index()->default(1)->comment('1=yes,0=no');

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

            $table->foreign('role_id')
                ->references('id')
                ->on('roles')
                ->onDelete('cascade');

            $table->foreign('module_id')
                ->references('id')
                ->on('modules')
                ->onDelete('cascade');

            $table->foreign('sub_module_id')
                ->references('id')
                ->on('sub_modules')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_role_module_permissions');
    }
};
