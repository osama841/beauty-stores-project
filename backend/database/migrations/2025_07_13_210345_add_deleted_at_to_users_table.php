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
        Schema::table('users', function (Blueprint $table) {
            // إضافة عمود 'deleted_at' لتمكين Soft Deletes
            // هذا العمود سيحتوي على الطابع الزمني (timestamp) عندما يتم حذف السجل "ناعماً"
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // عند التراجع عن الهجرة (rollback)، قم بإزالة عمود 'deleted_at'
            $table->dropSoftDeletes();
        });
    }
};
