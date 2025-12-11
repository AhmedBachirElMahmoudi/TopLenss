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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_order');
            $table->string('reference_gl'); // Product reference
            $table->string('product_title');
            $table->integer('qte'); // Quantity
            $table->decimal('price_unit', 10, 2); // Unit price
            $table->decimal('price_total', 10, 2); // Total for this item
            $table->timestamps();
            
            $table->foreign('id_order')->references('id_order')->on('orders')->onDelete('cascade');
            $table->index('reference_gl');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
