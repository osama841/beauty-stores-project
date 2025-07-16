<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->unsignedBigInteger('user_id');
            $table->dateTime('order_date');
            $table->decimal('total_amount', 10, 2);
            $table->string('status', 50)->default('pending');
            $table->unsignedBigInteger('shipping_address_id');
            $table->unsignedBigInteger('billing_address_id');
            $table->string('payment_method', 50);
            $table->string('payment_status', 50)->default('unpaid');
            $table->string('shipping_method', 50)->nullable();
            $table->string('tracking_number', 100)->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('shipping_address_id')->references('address_id')->on('addresses')->onDelete('cascade');
            $table->foreign('billing_address_id')->references('address_id')->on('addresses')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
};