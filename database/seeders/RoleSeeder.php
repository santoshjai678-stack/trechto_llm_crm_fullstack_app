<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super_admin',
                'description' => 'Full system access'
            ],
            [
                'name' => 'Branch Owner',
                'slug' => 'branch_owner',
                'description' => 'Owns and manages a branch'
            ],
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Administrative access'
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Manages teams and operations'
            ],
            [
                'name' => 'Team Leader',
                'slug' => 'team_leader',
                'description' => 'Leads a sales/support team'
            ],
            [
                'name' => 'Sales',
                'slug' => 'sales',
                'description' => 'Sales person'
            ],
            [
                'name' => 'Trainer',
                'slug' => 'trainer',
                'description' => 'Provides guidance and training to students'
            ],
            [
                'name' => 'Support',
                'slug' => 'support',
                'description' => 'Customer support staff'
            ],
            [
                'name' => 'Student',
                'slug' => 'student',
                'description' => 'Student role with limited access like viewing courses'
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
