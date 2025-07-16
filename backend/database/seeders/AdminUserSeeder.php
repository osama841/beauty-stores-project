 <?php
   namespace Database\Seeders;

    use Illuminate\Database\Console\Seeds\WithoutModelEvents;
    use Illuminate\Database\Seeder;
    use App\Models\User; // تأكد من استيراد نموذج المستخدم
    use Illuminate\Support\Facades\Hash; // تأكد من استيراد Hash

    class AdminUserSeeder extends Seeder
    {
        /**
         * Run the database seeds.
         */
        public function run(): void
        {
            // تحقق مما إذا كان المستخدم موجودًا بالفعل لتجنب التكرار
            if (User::where('email', 'aalbdany054@gmail.com')->exists()) {
                $this->command->info('المستخدم المشرف موجود بالفعل: aalbdany054@gmail.com');
                return;
            }

            // إنشاء حساب المشرف
            User::create([
                'first_name' => 'Admin',
                'last_name' => 'User',
                'username' => 'admin_aalbdany',
                'email' => 'aalbdany054@gmail.com',
                'password' => Hash::make('12345678'), // كلمة المرور: 12345678
                'phone_number' => '00967716013841',
                'is_admin' => true, // جعله مسؤولاً
                'status' => 'active',
            ]);

            $this->command->info('تم إنشاء حساب المشرف بنجاح: aalbdany054@gmail.com');
        }
    }
    