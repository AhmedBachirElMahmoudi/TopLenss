<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    protected $fillable = ['client_id', 'product_reference'];

    public function product()
    {
        return $this->belongsTo(GlassesProduct::class, 'product_reference', 'reference');
    }
}
