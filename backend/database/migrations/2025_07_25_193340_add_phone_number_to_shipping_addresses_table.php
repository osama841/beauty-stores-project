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
        Schema::table('shipping_addresses', function (Blueprint $table) {
            // إضافة عمود phone_number كـ string ويسمح بالقيم الفارغة
            $table->string('phone_number', 20)->nullable()->after('country'); // يمكنك تغيير after() لتحديد موقعه
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipping_addresses', function (Blueprint $table) {
            // حذف عمود phone_number عند التراجع عن الهجرة
            $table->dropColumn('phone_number');
        });
    }
};
