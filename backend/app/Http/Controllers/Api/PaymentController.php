<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth; // تم إضافة هذا السطر

class PaymentController extends Controller
{
    /**
     * Display a listing of the payments.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // استخدام Auth::check() و Auth::user() بدلاً من auth()->check() و auth()->user()
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->is_admin) {
                $payments = Payment::with(['user', 'order'])->get();
            } else {
                $payments = Payment::where('user_id', $user->user_id)
                                       ->with(['user', 'order'])
                                       ->get();
            }
            return response()->json($payments);
        }
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    /**
     * Store a newly created payment in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'order_id' => 'required|exists:orders,order_id',
                'payment_method' => 'required|string|max:50',
                'amount' => 'required|numeric|min:0.01',
                'currency' => 'required|string|max:10',
                'transaction_id' => 'nullable|string|max:255|unique:payments,transaction_id',
                'payment_status' => 'required|string|in:completed,pending,failed,refunded',
                'gateway_response' => 'nullable|json',
            ]);

            $user = Auth::user(); // استخدام Auth::user()
            if (!$user) {
                DB::rollBack();
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $order = Order::find($validated['order_id']);
            if (!$order) {
                DB::rollBack();
                return response()->json(['message' => 'Order not found'], 404);
            }

            if ($user->user_id != $order->user_id && !$user->is_admin) {
                DB::rollBack();
                return response()->json(['message' => 'Unauthorized to create payment for this order'], 403);
            }

            $payment = Payment::create([
                'order_id' => $validated['order_id'],
                'user_id' => $user->user_id,
                'payment_method' => $validated['payment_method'],
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
                'transaction_id' => $validated['transaction_id'] ?? null, // استخدام null coalescing operator
                'payment_status' => $validated['payment_status'],
                'payment_date' => now(),
                'gateway_response' => $validated['gateway_response'] ?? null, // استخدام null coalescing operator
            ]);

            if ($validated['payment_status'] === 'completed') {
                $order->update(['payment_status' => 'paid']);
            } elseif ($validated['payment_status'] === 'refunded') {
                $order->update(['payment_status' => 'refunded']);
            } else {
                $order->update(['payment_status' => 'partially_paid']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Payment recorded successfully',
                'payment' => $payment,
            ], 201);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'An error occurred while recording the payment.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified payment.
     *
     * @param  \App\Models\Payment  $payment
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Payment $payment)
    {
        $user = Auth::user(); // استخدام Auth::user()
        if ($user && ($user->user_id == $payment->user_id || $user->is_admin)) {
            $payment->load('user', 'order');
            return response()->json($payment);
        }
        return response()->json(['message' => 'Unauthorized to view this payment'], 403);
    }

    /**
     * Update the specified payment in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Payment  $payment
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Payment $payment)
    {
        $user = Auth::user(); // استخدام Auth::user()
        if (!$user || !$user->is_admin) {
            return response()->json(['message' => 'Unauthorized to update payments'], 403);
        }

        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'order_id' => 'sometimes|required|exists:orders,order_id',
                'user_id' => 'sometimes|required|exists:users,user_id',
                'payment_method' => 'sometimes|required|string|max:50',
                'amount' => 'sometimes|required|numeric|min:0.01',
                'currency' => 'sometimes|required|string|max:10',
                'transaction_id' => 'nullable|string|max:255|unique:payments,transaction_id,' . $payment->payment_id . ',payment_id',
                'payment_status' => 'sometimes|required|string|in:completed,pending,failed,refunded',
                'gateway_response' => 'nullable|json',
            ]);

            $payment->update($validated);

            $order = $payment->order;
            if ($order && isset($validated['payment_status'])) {
                if ($validated['payment_status'] === 'completed') {
                    $order->update(['payment_status' => 'paid']);
                } elseif ($validated['payment_status'] === 'refunded') {
                    $order->update(['payment_status' => 'refunded']);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Payment updated successfully',
                'payment' => $payment,
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'An error occurred while updating the payment.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified payment from storage.
     *
     * @param  \App\Models\Payment  $payment
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Payment $payment)
    {
        $user = Auth::user(); // استخدام Auth::user()
        if (!$user || !$user->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::beginTransaction();
        try {
            $payment->delete();
            DB::commit();
            return response()->json([
                'message' => 'Payment deleted successfully',
            ], 204); // تم التعديل إلى 204 No Content كأفضل ممارسة لـ DELETE
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'An error occurred while deleting the payment.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
