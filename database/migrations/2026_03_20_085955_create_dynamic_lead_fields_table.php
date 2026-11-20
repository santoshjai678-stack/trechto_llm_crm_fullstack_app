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
        Schema::create('dynamic_lead_fields', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id')->index();
            $table->unsignedBigInteger('section_id')->index();
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->unsignedBigInteger('updated_by')->nullable()->index();
            $table->string('name', 255);
            $table->string('slug',255);
            $table->integer('field_length')->default(255);
            $table->string('field_label', 255)->comment('Varchar, Integer, Boolean, Date, Datetime, Text');
            $table->string('input_type', 100)->comment('Text, Email, Number, Date, Dropdown, Checkbox, Radio');;
            $table->integer('max_length')->default(0);
            $table->integer('min_length')->default(0);
            $table->boolean('is_searchable')->index()->default(1)->comment('1=yes,0=no');
            $table->boolean('is_unique')->index()->default(1)->comment('1=yes,0=no');
            $table->boolean('show_on_lead_list')->index()->default(1)->comment('1=yes,0=no');
            $table->boolean('is_required')->index()->default(1)->comment('1=yes,0=no');
            $table->boolean('show_in_filter')->index()->default(1)->comment('1=yes,0=no');
            $table->boolean('is_birthday_field')->index()->default(1)->comment('1=yes,0=no');
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

            $table->foreign('section_id')
                ->references('id')
                ->on('form_sections')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dynamic_lead_fields');
    }
};
