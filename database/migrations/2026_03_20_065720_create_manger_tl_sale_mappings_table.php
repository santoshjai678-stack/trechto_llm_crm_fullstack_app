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
        Schema::create('manger_tl_sale_mappings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('manager_id')->index();
            $table->unsignedBigInteger('tl_id')->index();
            $table->unsignedBigInteger('sale_id')->index();
            $table->boolean('status')->index()->default(1)->comment('1=active,0=inactive');
            $table->softDeletes();
            // created_at with default current timestamp 
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            // updated_at with default current timestamp and auto-update 
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'))->useCurrentOnUpdate();

            $table->foreign('manager_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
            $table->foreign('tl_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
            $table->foreign('sale_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manger_tl_sale_mappings');
    }
};
