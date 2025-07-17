<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Brand; // استيراد نموذج العلامة التجارية

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            ['name' => 'L\'Oréal', 'slug' => 'loreal', 'description' => 'علامة تجارية عالمية لمستحضرات التجميل.', 'logo_url' => 'https://placehold.co/100x100/ADD8E6/000000?text=Loreal', 'status' => 'active'],
            ['name' => 'Maybelline', 'slug' => 'maybelline', 'description' => 'علامة تجارية أمريكية لمستحضرات التجميل.', 'logo_url' => 'https://placehold.co/100x100/ADD8E6/000000?text=Maybelline', 'status' => 'active'],
            ['name' => 'NIVEA', 'slug' => 'nivea', 'description' => 'علامة تجارية ألمانية للعناية بالبشرة.', 'logo_url' => 'https://placehold.co/100x100/ADD8E6/000000?text=Nivea', 'status' => 'active'],
            ['name' => 'MAC Cosmetics', 'slug' => 'mac-cosmetics', 'description' => 'شركة مستحضرات تجميل كندية.', 'logo_url' => 'https://placehold.co/100x100/ADD8E6/000000?text=MAC', 'status' => 'active'],
        ];

        foreach ($brands as $brandData) {
            // تحقق مما إذا كانت العلامة التجارية موجودة بالفعل لتجنب التكرار
            if (!Brand::where('slug', $brandData['slug'])->exists()) {
                Brand::create($brandData);
            }
        }
        $this->command->info('تم إضافة العلامات التجارية الأولية.');
    }
}
