<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::create('categories', function (Blueprint $table) {
        $table->id('category_id');
        $table->string('name'); // الطول الافتراضي 255
        $table->string('slug');
        $table->text('description')->nullable();
        $table->unsignedBigInteger('parent_id')->nullable();
        $table->string('image_url')->nullable();
        $table->string('status')->default('active');
        $table->timestamps();

        $table->foreign('parent_id')->references('category_id')->on('categories')->onDelete('cascade');
    });
}



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
