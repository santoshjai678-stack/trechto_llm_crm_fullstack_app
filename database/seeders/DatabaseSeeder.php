<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->call([
            CountrySeeder::class,
            StateSeeder::class,
            CitySeeder::class,
        ]);
        // User::factory(10)->create();
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'super_admin@crm.com',
            'password' => bcrypt('root'),
            'role_id' => 1,
        ]);

    }
}
