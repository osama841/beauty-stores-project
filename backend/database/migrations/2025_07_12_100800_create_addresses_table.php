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
        Schema::create('addresses', function (Blueprint $table) {
            $table->id('address_id'); // يستخدم id() لإنشاء primary key تلقائياً
            $table->unsignedBigInteger('user_id');
            $table->string('address_type', 50)->default('shipping'); // نوع العنوان: 'shipping' أو 'billing'
            $table->string('address_line1', 255);
            $table->string('address_line2', 255)->nullable();
            $table->string('city', 100);
            $table->string('state', 100)->nullable();
            $table->string('postal_code', 20);
            $table->string('country', 100);
            $table->string('phone_number', 20)->nullable(); // ****** إضافة عمود رقم الهاتف ******
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade'); // تأكد أن المفتاح الأساسي لجدول users هو 'id'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
