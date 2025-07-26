<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address; // نموذج العنوان (الذي يمثل جدول 'addresses')
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth; // استخدام Auth facade

class AddressController extends Controller
{
    /**
     * Display a listing of the addresses.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->is_admin) {
                $addresses = Address::all();
            } else {
                $addresses = Address::where('user_id', $user->user_id)->get();
            }
            return response()->json($addresses);
        }
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    /**
     * Store a newly created address in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $request->validate([
                // 'user_id' => 'required|exists:users,user_id', // user_id سيتم أخذه من المستخدم المصادق
                'address_type' => 'required|string|in:shipping,billing',
                'address_line1' => 'required|string|max:255',
                'address_line2' => 'nullable|string|max:255',
                'city' => 'required|string|max:100',
                'state' => 'nullable|string|max:100',
                'postal_code' => 'required|string|max:20', // ****** جعلها required لتطابق الواجهة الأمامية ******
                'country' => 'required|string|max:100',
                'phone_number' => 'nullable|string|max:20', // ****** إضافة phone_number إلى قواعد التحقق ******
                'is_default' => 'boolean',
            ]);

            // التأكد من أن المستخدم المصادق هو من يضيف العنوان أو أن المسؤول يضيفه
            // (في سياق Checkout، المستخدم المصادق هو من يضيف لنفسه)
            // إذا كان المسؤول يضيف لمستخدم آخر، يجب التحقق من صلاحياته
            $address = Address::create([
                'user_id' => $user->user_id, // ربط العنوان بالمستخدم المصادق
                'address_type' => $request->address_type,
                'address_line1' => $request->address_line1,
                'address_line2' => $request->address_line2,
                'city' => $request->city,
                'state' => $request->state,
                'postal_code' => $request->postal_code,
                'country' => $request->country,
                'phone_number' => $request->phone_number,
                'is_default' => $request->is_default ?? false, // افتراضي false
            ]);

            return response()->json([
                'message' => 'Address created successfully',
                'address' => $address,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating address: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while creating the address.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified address.
     *
     * @param  \App\Models\Address  $address
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Address $address)
    {
        if (Auth::check() && (Auth::user()->user_id == $address->user_id || Auth::user()->is_admin)) {
            return response()->json($address);
        }
        return response()->json(['message' => 'Unauthorized to view this address'], 403);
    }

    /**
     * Update the specified address in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Address  $address
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Address $address)
    {
        // التأكد من أن المستخدم المصادق يملك العنوان أو أنه مسؤول
        if (!Auth::check() || (Auth::user()->user_id != $address->user_id && !Auth::user()->is_admin)) {
            return response()->json(['message' => 'Unauthorized to update this address'], 403);
        }

        try {
            $request->validate([
                // 'user_id' => 'sometimes|required|exists:users,user_id', // user_id سيتم أخذه من المستخدم المصادق
                'address_type' => 'sometimes|required|string|in:shipping,billing',
                'address_line1' => 'sometimes|required|string|max:255',
                'address_line2' => 'nullable|string|max:255',
                'city' => 'sometimes|required|string|max:100',
                'state' => 'nullable|string|max:100',
                'postal_code' => 'sometimes|required|string|max:20', // ****** جعلها sometimes|required لتطابق الواجهة الأمامية ******
                'country' => 'sometimes|required|string|max:100',
                'phone_number' => 'nullable|string|max:20', // ****** إضافة phone_number إلى قواعد التحقق ******
                'is_default' => 'boolean',
            ]);

            $address->update($request->all());

            return response()->json([
                'message' => 'Address updated successfully',
                'address' => $address,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the address.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified address from storage.
     *
     * @param  \App\Models\Address  $address
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Address $address)
    {
        try {
            if (!Auth::check() || (Auth::user()->user_id != $address->user_id && !Auth::user()->is_admin)) {
                return response()->json(['message' => 'Unauthorized to delete this address'], 403);
            }

            $address->delete();
            return response()->json([
                'message' => 'Address deleted successfully',
            ], 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the address.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
