<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                'name' => 'Employee',
                'slug' => 'employee',
                'status' => 1,
                'is_module_for_crm' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Role And Permission',
                'slug' => 'role_and_permission',
                'status' => 1,
                'is_module_for_crm' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dynamic Section And Field',
                'slug' => 'dynamic_section_and_field',
                'status' => 1,
                'is_module_for_crm' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Leads',
                'slug' => 'leads',
                'status' => 1,
                'is_module_for_crm' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($modules as $module) {
            Module::firstOrCreate(['slug' => $module['slug']], $module);
        }
    }
}
