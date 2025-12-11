<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_order',
        'reference_gl',
        'product_title',
        'qte',
        'price_unit',
        'price_total'
    ];

    protected $casts = [
        'price_unit' => 'decimal:2',
        'price_total' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'id_order', 'id_order');
    }

    public function product()
    {
        return $this->belongsTo(GlassesProduct::class, 'reference_gl', 'reference');
    }
}
