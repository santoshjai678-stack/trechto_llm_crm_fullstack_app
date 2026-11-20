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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone_number')->nullable()->after('password');
            $table->string('address')->nullable()->after('phone_number');
            $table->foreignId('city_id')->index()
                ->nullable()
                ->after('address')
                ->constrained('cities')
                ->nullOnDelete();

            $table->foreignId('state_id')->index()
                ->nullable()
                ->after('city_id')
                ->constrained('states')
                ->nullOnDelete();

            $table->string('zip')->nullable()->after('state_id');
                
            $table->foreignId('country_id')->index()
                ->nullable()
                ->after('zip')
                ->constrained('countries')
                ->nullOnDelete();

            $table->string('profile_image')->nullable()->after('country_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('profile_image');
            $table->dropColumn('phone_number');
            $table->dropColumn('address');
            $table->dropColumn('city_id');
            $table->dropColumn('state_id');
            $table->dropColumn('zip');
            $table->dropColumn('country_id');
        });
    }
};
