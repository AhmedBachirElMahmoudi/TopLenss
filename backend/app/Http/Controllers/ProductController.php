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
        // Décoder la référence si elle est encodée dans l'URL
        $decodedReference = urldecode($reference);
        
        // Chercher par la colonne 'reference' au lieu de 'id'
        $product = GlassesProduct::with(['brand', 'images' => function($query) {
            $query->orderBy('is_primary', 'desc')->orderBy('created_at', 'desc');
        }])
        ->where('reference', $decodedReference)
        ->first();

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json($product);
    }
    public function destroy($reference)
    {
        $decodedReference = urldecode($reference);
        $product = GlassesProduct::with('images')->where('reference', $decodedReference)->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // 1. Delete all associated images from Storage
        foreach ($product->images as $image) {
            // Path: products/{reference}/{filename}
            // Logic mirrored from ProductImageController specific path construction
            $path = "products/{$product->reference}/{$image->file_name}";
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
            }
        }
        
        // 2. Delete image records (Database)
        // If cascading delete is set on DB, this happens automatically, but let's be safe or if not set.
        $product->images()->delete();

        // 3. Delete product
        $product->delete();

        return response()->json(['message' => 'Product and associated images deleted successfully']);
    }
}
