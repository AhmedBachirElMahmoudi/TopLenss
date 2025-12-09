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
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->string('product_reference', 255);
            $table->string('image_name');
            $table->string('file_name'); // Original file name
            $table->string('image_type')->default('other'); // cover, front, side, etc.
            $table->boolean('is_primary')->default(false);
            $table->integer('file_size')->nullable();
            $table->timestamps();

            $table->foreign('product_reference')
                  ->references('reference')
                  ->on('glasses_products')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
