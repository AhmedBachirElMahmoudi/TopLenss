<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GlassesProduct;

class ProductController extends Controller
{
    /**
     * Display a paginated list of products with optional search
     */
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $brandId = $request->query('brand_id', null);
        $perPage = $request->query('per_page', 20);

        $query = GlassesProduct::with('brand');

        // Apply brand filter if provided
        if ($brandId) {
            $query->where('brand_id', $brandId);
        }

        // Apply search filter if provided
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('code_bar', 'like', "%{$search}%")
                  ->orWhereHas('brand', function($brandQuery) use ($search) {
                      $brandQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Get paginated results
        $products = $query->orderBy('reference', 'asc')
                         ->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Display a single product by reference
     */
    public function show($reference)
    {
        $product = GlassesProduct::with('brand')->find($reference);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json($product);
    }
}
