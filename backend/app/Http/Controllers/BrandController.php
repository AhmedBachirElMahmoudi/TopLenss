<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Brand;

class BrandController extends Controller
{
    /**
     * Display a paginated list of brands
     */
    public function index(Request $request)
    {
        // Récupérer les paramètres de pagination
        $perPage = $request->input('per_page', 12); // 12 par défaut
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        
        // Construction de la requête
        $query = Brand::orderBy('name', 'asc');
        
        // Filtre de recherche
        if (!empty($search)) {
            $query->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
        }
        
        // Pagination
        $brands = $query->paginate($perPage, ['*'], 'page', $page);
        
        return response()->json([
            'data' => $brands->items(),
            'current_page' => $brands->currentPage(),
            'last_page' => $brands->lastPage(),
            'per_page' => $brands->perPage(),
            'total' => $brands->total(),
            'from' => $brands->firstItem(),
            'to' => $brands->lastItem(),
        ]);
    }
}