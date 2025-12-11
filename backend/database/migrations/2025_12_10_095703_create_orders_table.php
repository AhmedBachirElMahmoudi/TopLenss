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
        Schema::create('orders', function (Blueprint $table) {
            $table->id('id_order');
            $table->string('order_number')->unique(); // e.g., ORD-20241210-0001
            $table->string('ct_num'); // Client number from selectedClient
            $table->decimal('price_total', 10, 2);
            $table->decimal('remise_global', 5, 2)->default(0); // Global discount percentage
            $table->tinyInteger('order_status')->default(0); // 0=pending, 1=validated
            $table->tinyInteger('insert_status')->default(0); // 0=not inserted to SQL Server, 1=inserted
            $table->integer('created_by'); // User ID who created the order
            $table->timestamps();
            $table->timestamp('validated_at')->nullable();
            
            $table->index('order_status');
            $table->index('insert_status');
            $table->index('ct_num');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
