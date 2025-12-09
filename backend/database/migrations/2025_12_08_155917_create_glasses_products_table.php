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
        Schema::create('glasses_products', function (Blueprint $table) {
            $table->string('reference', 255)->primary();
            $table->string('code_bar', 255)->unique()->nullable();
            $table->string('title', 255)->nullable();
            $table->string('description', 255)->nullable();
            $table->float('price')->nullable();
            $table->integer('qte_stock')->nullable();
            $table->string('FA_CodeFamille', 255)->nullable();
            $table->integer('CL_No1');
            $table->integer('CL_No2');
            $table->integer('CL_No3')->nullable();
            $table->integer('CL_No4')->nullable();
            $table->string('cover', 255)->default('defaultcover');
            $table->string('brand', 255)->nullable();
            $table->integer('brand_id');
            $table->integer('Ventes')->default(0);
            
            // Foreign key
            $table->foreign('brand_id')->references('brand_id')->on('brands');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('glasses_products');
    }
};
