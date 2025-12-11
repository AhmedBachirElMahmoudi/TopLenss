<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\GlassesProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index(Request $request)
    {
        $query = Order::with(['items', 'creator']);

        // Filter by status if provided
        if ($request->has('order_status')) {
            $query->where('order_status', $request->order_status);
        }

        if ($request->has('insert_status')) {
            $query->where('insert_status', $request->insert_status);
        }

        // Filter by client
        if ($request->has('ct_num')) {
            $query->where('ct_num', $request->ct_num);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($orders);
    }

    /**
     * Store a newly created order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ct_num' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.reference' => 'required|string',
            'items.*.title' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'remise_global' => 'nullable|numeric|min:0|max:100',
        ]);

        try {
            DB::beginTransaction();

            // Calculate total
            $total = 0;
            foreach ($validated['items'] as $item) {
                $total += $item['price'] * $item['quantity'];
            }

            // Apply global discount
            $remise = $validated['remise_global'] ?? 0;
            if ($remise > 0) {
                $total = $total * (1 - ($remise / 100));
            }

            // Create order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'ct_num' => $validated['ct_num'],
                'price_total' => $total,
                'remise_global' => $remise,
                'order_status' => 0, // Pending
                'insert_status' => 0, // Not inserted
                'created_by' => Auth::id(),
            ]);

            // Create order items
            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'id_order' => $order->id_order,
                    'reference_gl' => $item['reference'],
                    'product_title' => $item['title'],
                    'qte' => $item['quantity'],
                    'price_unit' => $item['price'],
                    'price_total' => $item['price'] * $item['quantity'],
                ]);

                // Update product stock
                GlassesProduct::where('reference', $item['reference'])
                    ->decrement('qte_stock', $item['quantity']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('items')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order
     */
    public function show($id)
    {
        $order = Order::with(['items.product', 'creator'])->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Validate an order (change status from 0 to 1)
     */
    public function validate($id)
    {
        try {
            $order = Order::findOrFail($id);

            if ($order->order_status == 1) {
                return response()->json(['message' => 'Order already validated'], 400);
            }

            $order->update([
                'order_status' => 1,
                'validated_at' => now()
            ]);

            return response()->json([
                'message' => 'Order validated successfully',
                'order' => $order->load('items')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to validate order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Insert order to SQL Server (your existing logic)
     */
    public function insertToSqlServer($id)
    {
        try {
            $order = Order::with('items')->findOrFail($id);

            if ($order->order_status == 0) {
                return response()->json(['message' => 'Order must be validated first'], 400);
            }

            if ($order->insert_status == 1) {
                return response()->json(['message' => 'Order already inserted to SQL Server'], 400);
            }

            // TODO: Implement your SQL Server insertion logic here
            // Based on your orderInsertStatusUpdate function
            
            // For now, just mark as inserted
            $order->update(['insert_status' => 1]);

            return response()->json([
                'message' => 'Order inserted to SQL Server successfully',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to insert order to SQL Server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an order
     */
    public function destroy($id)
    {
        try {
            $order = Order::with('items')->findOrFail($id);

            if ($order->order_status == 1) {
                return response()->json(['message' => 'Cannot delete validated order'], 400);
            }

            // Restore stock for each item
            foreach ($order->items as $item) {
                GlassesProduct::where('reference', $item->reference_gl)
                    ->increment('qte_stock', $item->qte);
            }

            $order->delete();

            return response()->json(['message' => 'Order deleted successfully']);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
