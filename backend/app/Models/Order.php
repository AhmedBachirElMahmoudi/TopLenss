<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_order';

    protected $fillable = [
        'order_number',
        'ct_num',
        'price_total',
        'remise_global',
        'order_status',
        'insert_status',
        'created_by',
        'validated_at'
    ];

    protected $casts = [
        'price_total' => 'decimal:2',
        'remise_global' => 'decimal:2',
        'validated_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'id_order', 'id_order');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Generate unique order number
    public static function generateOrderNumber()
    {
        $date = now()->format('Ymd');
        $lastOrder = self::whereDate('created_at', today())
            ->orderBy('id_order', 'desc')
            ->first();
        
        $sequence = $lastOrder ? (int)substr($lastOrder->order_number, -4) + 1 : 1;
        
        return 'ORD-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
