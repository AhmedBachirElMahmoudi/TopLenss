<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Client;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin Config
        User::firstOrCreate(
            ['email' => 'admin@toplenss.com'],
            [
                'name' => 'Global Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // Test Manager (password does not need to be changed)
        User::firstOrCreate(
            ['email' => 'manager@toplenss.com'],
            [
                'name' => 'Test Manager',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'must_change_password' => false, // Set to false for easy testing
            ]
        );

        // Dummy Clients
        $clients = [
            [
                'ct_num' => 'CT001',
                'ct_intitule' => 'Optique 2000',
                'ct_contact' => 'Jean Dupont',
                'ct_email' => 'contact@optique2000.fr',
                'ct_telephone' => '01 23 45 67 89',
                'ct_adresse' => '12 Rue de la Paix',
                'ct_ville' => 'Paris',
            ],
            [
                'ct_num' => 'CT002',
                'ct_intitule' => 'Krys Vision',
                'ct_contact' => 'Marie Martin',
                'ct_email' => 'contact@krys.fr',
                'ct_telephone' => '04 56 78 90 12',
                'ct_adresse' => '45 Avenue Jean Jaurès',
                'ct_ville' => 'Lyon',
            ],
            [
                'ct_num' => 'CT003',
                'ct_intitule' => 'Grand Optical',
                'ct_contact' => 'Pierre Durand',
                'ct_email' => 'contact@grandoptical.fr',
                'ct_telephone' => '05 67 89 01 23',
                'ct_adresse' => 'Centro Commercial',
                'ct_ville' => 'Marseille',
            ],
        ];

        foreach ($clients as $client) {
            Client::firstOrCreate(['ct_num' => $client['ct_num']], $client);
        }
    }
}
