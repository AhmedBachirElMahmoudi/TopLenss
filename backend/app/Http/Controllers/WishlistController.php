<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index($clientId)
    {
        $wishlist = \App\Models\Wishlist::where('client_id', $clientId)
            ->with(['product' => function($q) {
                // Eager load images to show at least cover
                $q->with('images'); 
            }])
            ->get();
            
        return response()->json($wishlist);
    }

    public function getReferences($clientId)
    {
        // Lightweight endpoint just for heart icons
        $refs = \App\Models\Wishlist::where('client_id', $clientId)
            ->pluck('product_reference');
        return response()->json($refs);
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required',
            'product_reference' => 'required'
        ]);

        $clientId = $validated['client_id'];
        $ref = $validated['product_reference'];

        $exists = \App\Models\Wishlist::where('client_id', $clientId)
            ->where('product_reference', $ref)
            ->first();

        if ($exists) {
            $exists->delete();
            return response()->json(['status' => 'removed']);
        } else {
            \App\Models\Wishlist::create([
                'client_id' => $clientId,
                'product_reference' => $ref
            ]);
            return response()->json(['status' => 'added']);
        }
    }
}
