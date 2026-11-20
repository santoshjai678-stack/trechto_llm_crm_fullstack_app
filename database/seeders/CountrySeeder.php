<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Country;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $countries = [
            [
                'name' => 'India', 
                'iso_code' => 'IN', 
                'country_code' => '+91'
            ]
        ];

        foreach ($countries as $country) {
            Country::firstOrCreate(['iso_code' => $country['iso_code']], $country);
        }
    }
}
