<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProductImageController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Admin routes
    Route::get('/admin/stats', [UserController::class, 'stats']);
    Route::apiResource('users', UserController::class);

    // Manager/Common routes
    Route::get('/clients', [ClientController::class, 'index']);

    // Sync routes
    Route::post('/sync/clients', [SyncController::class, 'syncClients']);
    Route::post('/sync/brands', [SyncController::class, 'syncBrands']);
    Route::post('/sync/catalogs', [SyncController::class, 'syncCatalogs']);
    Route::post('/sync/products', [SyncController::class, 'syncProducts']);
    
    // Product Images (Must be defined BEFORE /products/{reference} wildcard routes)
    Route::get('/products/{reference}/images', [ProductImageController::class, 'index']);
    Route::post('/products/{reference}/images', [ProductImageController::class, 'store']);
    Route::post('/products/images/batch-upload-folder', [ProductImageController::class, 'batchStore']);
    Route::put('/products/images/{id}', [ProductImageController::class, 'update']);
    Route::delete('/products/images/{id}', [ProductImageController::class, 'destroy']);

    // Products management
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{reference}', [ProductController::class, 'show'])->where('reference', '.*');
    Route::delete('/products/{reference}', [ProductController::class, 'destroy'])->where('reference', '.*');
    
    // Brands management
    Route::get('/brands', [\App\Http\Controllers\BrandController::class, 'index']);

    // Wishlist
    Route::get('/wishlist/{clientId}', [\App\Http\Controllers\WishlistController::class, 'index']);
    Route::get('/wishlist/{clientId}/refs', [\App\Http\Controllers\WishlistController::class, 'getReferences']);
    Route::post('/wishlist/toggle', [\App\Http\Controllers\WishlistController::class, 'toggle']);

    // Orders
    Route::get('/orders', [\App\Http\Controllers\OrderController::class, 'index']);
    Route::post('/orders', [\App\Http\Controllers\OrderController::class, 'store']);
    Route::get('/orders/{id}', [\App\Http\Controllers\OrderController::class, 'show']);
    Route::post('/orders/{id}/validate', [\App\Http\Controllers\OrderController::class, 'validate']);
    Route::post('/orders/{id}/insert-sql-server', [\App\Http\Controllers\OrderController::class, 'insertToSqlServer']);
    Route::delete('/orders/{id}', [\App\Http\Controllers\OrderController::class, 'destroy']);
});
