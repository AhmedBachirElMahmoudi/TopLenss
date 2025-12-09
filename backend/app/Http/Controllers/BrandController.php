<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Brand;

class BrandController extends Controller
{
    /**
     * Display a list of all brands
     */
    public function index()
    {
        $brands = Brand::orderBy('name', 'asc')->get();
        return response()->json($brands);
    }
}
