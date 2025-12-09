<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BrandController;

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
    
    // Products management
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{reference}', [ProductController::class, 'show']);
    
    // Brands management
    Route::get('/brands', [BrandController::class, 'index']);
});
