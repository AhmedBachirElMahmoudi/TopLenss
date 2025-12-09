<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GlassesProduct extends Model
{
    protected $table = 'glasses_products';
    protected $primaryKey = 'reference';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];
    
    // Relationship with Brand
    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id', 'brand_id');
    }

    // Relationship with ProductImage
    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_reference', 'reference');
    }
}
