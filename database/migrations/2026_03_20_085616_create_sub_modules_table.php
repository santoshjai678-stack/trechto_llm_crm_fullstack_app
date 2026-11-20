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
        Schema::create('sub_modules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('module_id')->index();
            $table->string('name', 255);
            $table->string('slug', 255)->index()->unique();
            $table->boolean('status')->index()->default(1)->comment('1=active,0=inactive');
            $table->softDeletes();
            // created_at with default current timestamp 
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            // updated_at with default current timestamp and auto-update 
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'))->useCurrentOnUpdate();

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
        Schema::dropIfExists('sub_modules');
    }
};
