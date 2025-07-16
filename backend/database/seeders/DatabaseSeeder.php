<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User; // تأكد من استيراد نموذج المستخدم
use Illuminate\Support\Facades\Hash; // تأكد من استيراد Hash

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ****** الكود لإنشاء حساب المشرف ******
        // التحقق مما إذا كان المستخدم المشرف موجودًا بالفعل لتجنب التكرار
        if (User::where('email', 'albdany054@gmail.com')->exists()) {
            $this->command->info('المستخدم المشرف موجود بالفعل: aalbdany054@gmail.com');
        } else {
            User::create([
                'first_name' => 'Osama', // هذا هو الاسم الأول
                'last_name' => 'Mohammad', // هذا هو اسم العائلة
                'username' => 'admin', // اسم المستخدم
                'email' => 'albdany054@gmail.com', // ****** هذا هو البريد الإلكتروني ******
                'password' => Hash::make('12345678'), // كلمة المرور: 12345678
                'phone_number' => '00967716013841',
                'is_admin' => true, // جعله مسؤولاً
                'status' => 'active',
            ]);
            $this->command->info('تم إنشاء حساب المشرف بنجاح: albdany054@gmail.com');
        }
        // ****** نهاية الكود ******
    }
}
