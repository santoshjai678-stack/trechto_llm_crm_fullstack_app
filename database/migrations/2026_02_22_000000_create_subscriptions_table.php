<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('type', 15)->comment('branch, sub-branch');
            $table->string('name', 255);
            $table->string('code', 100)->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->unsignedInteger('duration')->index();
            $table->string('duration_type', 15)->index()->comment('day, month, year');
            
            $table->boolean('is_trial')->index()->default(0)->comment('1=trial,0=normal');
            $table->boolean('status')->index()->default(1)->comment('1=active,0=inactive');
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
        Schema::dropIfExists('subscriptions');
    }
};

