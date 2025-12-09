<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->string('ct_num')->primary(); // Primary Key
            $table->string('ct_intitule')->nullable();
            $table->string('ct_contact')->nullable();
            $table->string('ct_adresse')->nullable();
            $table->string('ct_complement')->nullable();
            $table->string('ct_ville')->nullable();
            $table->string('ct_email')->nullable();
            $table->string('ct_site')->nullable();
            $table->string('ct_telephone')->nullable();
            
            // Timestamps at the end
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
