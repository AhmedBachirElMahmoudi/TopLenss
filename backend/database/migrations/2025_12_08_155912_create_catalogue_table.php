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
        Schema::create('catalogue', function (Blueprint $table) {
            $table->integer('CL_No')->primary();
            $table->string('CL_intitule', 255);
            $table->integer('CL_NoParent');
            $table->integer('CL_Niveau');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalogue');
    }
};
