<?php

$map = [
    'users' => '100000',
    'categories' => '100100',
    'brands' => '100200',
    'products' => '100300',
    'product_images' => '100400',
    'product_attributes' => '100500',
    'reviews' => '100600',
    'shopping_cart' => '100700',
    'addresses' => '100800',
    'orders' => '100900',
    'order_items' => '101000',
    'payments' => '101100',
    'discounts' => '101200',
];

$datePrefix = date('Y_m_d');

$files = glob(__DIR__ . '/*create_*.php');

foreach ($files as $file) {
    foreach ($map as $table => $suffix) {
        if (str_contains($file, "create_{$table}_table")) {
            $newName = __DIR__ . "/{$datePrefix}_{$suffix}_create_{$table}_table.php";
            rename($file, $newName);
            echo "✔ Renamed to: {$newName}\n";
            break;
        }
    }
}
