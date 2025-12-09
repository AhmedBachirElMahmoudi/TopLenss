<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = [
        'product_reference',
        'image_name',
        'file_name',
        'image_type',
        'is_primary',
        'file_size'
    ];

    public function product()
    {
        return $this->belongsTo(GlassesProduct::class, 'product_reference', 'reference');
    }
}
