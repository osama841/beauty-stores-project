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
    Schema::create('brands', function (Blueprint $table) {
        $table->id('brand_id');
        $table->string('name');
        $table->string('slug');
        $table->text('description')->nullable();
        $table->string('logo_url')->nullable();
        $table->string('status')->default('active');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brands');
    }
};
