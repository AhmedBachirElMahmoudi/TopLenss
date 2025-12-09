<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\ProductImage;
use App\Models\GlassesProduct;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageController extends Controller
{
    public function index($reference)
    {
        $decodedReference = urldecode($reference);
        $images = ProductImage::where('product_reference', $decodedReference)
            ->orderBy('is_primary', 'desc') // Cover/Primary first
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($images);
    }

    public function store(Request $request, $reference)
    {
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max
            'image_type' => 'required|string',
            'is_primary' => 'boolean'
        ]);

        $decodedReference = urldecode($reference);
        $uploadedImages = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                // Determine file name
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $uniqueName = pathinfo($originalName, PATHINFO_FILENAME) . '_' . time() . '.' . $extension;
                
                // Store file in public/products/{reference}
                // Use 'public' disk which should map to storage/app/public
                // We want: storage/products/{reference}/filename
                $path = "products/{$decodedReference}";
                $file->storeAs($path, $uniqueName, 'public');

                // If is_primary requested, unset other primaries for this product
                if ($request->boolean('is_primary')) {
                    ProductImage::where('product_reference', $decodedReference)
                        ->update(['is_primary' => false]);
                    
                    // Update main product cover
                    GlassesProduct::where('reference', $decodedReference)
                        ->update(['cover' => $uniqueName]);
                }

                // Create DB record
                $image = ProductImage::create([
                    'product_reference' => $decodedReference,
                    'image_name' => $uniqueName,
                    'file_name' => $originalName,
                    'image_type' => $request->input('image_type', 'other'),
                    'is_primary' => $request->boolean('is_primary', false),
                    'file_size' => $file->getSize()
                ]);

                $uploadedImages[] = $image;
            }
        }

        return response()->json([
            'message' => 'Images uploaded successfully',
            'images' => $uploadedImages
        ]);
    }

    /**
     * Batch upload for folder of images
     * Pattern matching logic involved
     */
    public function batchStore(Request $request)
    {
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp',
            // 'reference_pattern' is passed but we might handle variable patterns
        ]);

        $results = [];
        $successCount = 0;
        $errorCount = 0;
        $files = $request->file('images');
        
        if (!$files) {
            return response()->json(['message' => 'No files provided'], 400);
        }

        foreach ($files as $file) {
            try {
                $originalName = $file->getClientOriginalName();
                
                // Parse filename to get reference and type
                // Expected format examples:
                // 889652002606-cat-m.jpg (Ref: 889652002606, Type: cat/cover)
                // 889652002606-front-m.jpg (Ref: 889652002606, Type: front)
                
                // Simple regex to split by hyphens or underscores
                // Assuming it starts with reference
                $fileNameNoExt = pathinfo($originalName, PATHINFO_FILENAME);
                
                if (str_starts_with($fileNameNoExt, '.') || empty($fileNameNoExt)) {
                    continue; // Skip hidden/empty files
                }

                // Normalize separators to -
                $normalized = str_replace(['_', ' '], '-', $fileNameNoExt);
                $parts = explode('-', $normalized);
                
                // If only one part (e.g. "889652002606.jpg"), use it as identifier
                if (count($parts) < 1) {
                     throw new \Exception("Filename format empty: $originalName");
                }
                
                // Assuming first part is the identifier (reference OR code_bar)
                $identifier = $parts[0];
                
                // Find the product by reference OR code_bar
                $product = GlassesProduct::where('reference', $identifier)
                    ->orWhere('code_bar', $identifier)
                    ->first();
                    
                if (!$product) {
                    throw new \Exception("Product not found for identifier: $identifier");
                }
                
                $reference = $product->reference;
                
                // Determine Type
                $type = 'other';
                $isPrimary = false;
                
                // Check if 'cat' exists in parts -> cover
                if (in_array('cat', $parts) || Str::contains($fileNameNoExt, 'cat')) {
                    $type = 'cover';
                    $isPrimary = true;
                } elseif (in_array('front', $parts) || Str::contains($fileNameNoExt, 'front')) {
                    $type = 'front';
                } elseif (in_array('side', $parts) || Str::contains($fileNameNoExt, 'side')) {
                    $type = 'side';
                } elseif (in_array('detail', $parts) || Str::contains($fileNameNoExt, 'detail')) {
                    $type = 'detail';
                }
                
                // Check if this specific image already exists for this product
                // Match by file_name (original name) to detect "Update" scenario
                $existingImage = ProductImage::where('product_reference', $reference)
                    ->where('file_name', $originalName)
                    ->first();

                // Define storage path
                $path = "products/{$reference}";
                $uniqueName = $existingImage ? $existingImage->image_name : ($fileNameNoExt . '_' . time() . '.' . $file->getClientOriginalExtension());
                
                // Store/Overwrite File
                $file->storeAs($path, $uniqueName, 'public');
                
                // Handle Primary status locally
                if ($isPrimary) {
                     // Unset other primaries
                     ProductImage::where('product_reference', $reference)
                        ->where('id', '!=', $existingImage ? $existingImage->id : 0)
                        ->update(['is_primary' => false]);
                        
                     // Update main product cover
                     GlassesProduct::where('reference', $reference)
                        ->update(['cover' => $uniqueName]);
                }
                
                if ($existingImage) {
                    // Update existing record
                    $existingImage->update([
                        'image_type' => $type,
                        'is_primary' => $isPrimary,
                        'file_size' => $file->getSize(),
                        // 'image_name' stays the same to avoid breaking links if possible, or we could update it too if we wanted to refresh timestamp
                    ]);
                    $message = "Updated existing image";
                } else {
                    // Create new record
                    ProductImage::create([
                        'product_reference' => $reference,
                        'image_name' => $uniqueName,
                        'file_name' => $originalName,
                        'image_type' => $type,
                        'is_primary' => $isPrimary,
                        'file_size' => $file->getSize()
                    ]);
                    $message = "Created new image";
                }
                
                $successCount++;
                $results[] = [
                    'file' => $originalName,
                    'status' => 'success',
                    'action' => $existingImage ? 'updated' : 'created',
                    'reference' => $reference,
                    'type' => $type
                ];
                
            } catch (\Exception $e) {
                $errorCount++;
                $results[] = [
                    'file' => $originalName ?? 'Unknown',
                    'status' => 'error',
                    'message' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'results' => $results
        ]);
    }

    public function update(Request $request, $id)
    {
        $image = ProductImage::findOrFail($id);
        
        if ($request->has('image_type')) {
            $image->image_type = $request->image_type;
        }
        
        if ($request->has('is_primary') && $request->boolean('is_primary')) {
            // Unset other primaries for this product
            ProductImage::where('product_reference', $image->product_reference)
                ->update(['is_primary' => false]);
            
            // Update main product cover
            GlassesProduct::where('reference', $image->product_reference)
                ->update(['cover' => $image->image_name]);
                
            $image->is_primary = true;
        }
        
        $image->save();
        
        return response()->json($image);
    }

    public function destroy($id)
    {
        $image = ProductImage::findOrFail($id);
        $reference = $image->product_reference;
        $isPrimary = $image->is_primary;
        
        // Delete file from storage
        $path = "products/{$reference}/{$image->image_name}";
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
        
        $image->delete();
        
        // If we deleted the primary image, update the product cover to default or next available
        if ($isPrimary) {
            $nextImage = ProductImage::where('product_reference', $reference)
                ->first();
                
            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
                GlassesProduct::where('reference', $reference)
                    ->update(['cover' => $nextImage->image_name]);
            } else {
                GlassesProduct::where('reference', $reference)
                    ->update(['cover' => 'defaultcover']);
            }
        }
        
        return response()->json(['message' => 'Image deleted successfully']);
    }
}
