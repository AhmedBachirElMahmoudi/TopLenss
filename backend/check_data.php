<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING DATA FOR CLIENT 1 ===\n\n";

// Orders
$orders = \App\Models\Order::where('ct_num', '1')->get();
echo "Orders for client 1: " . $orders->count() . "\n";
foreach ($orders as $order) {
    echo "  - Order #{$order->order_number}: {$order->price_total} MAD (Status: {$order->order_status})\n";
}

echo "\n";

// Wishlist (for current user)
$wishlist = \App\Models\Wishlist::all();
echo "Total Wishlist items: " . $wishlist->count() . "\n";

echo "\n";

// Products
$products = \App\Models\GlassesProduct::count();
echo "Total Products: " . $products . "\n";

echo "\n=== END ===\n";
