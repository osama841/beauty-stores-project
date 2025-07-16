<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AddressController extends Controller
{
    /**
     * Display a listing of the addresses.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // عرض العناوين للمستخدم الحالي فقط (إذا كان مصادقًا)
        // أو جميع العناوين إذا كان مسؤولاً
        if (auth()->check()) {
            if (auth()->user()->is_admin) {
                $addresses = Address::all();
            } else {
                $addresses = Address::where('user_id', auth()->user()->user_id)->get();
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
            $request->validate([
                'user_id' => 'required|exists:users,user_id', // يمكن أن يكون هذا تلقائيًا للمستخدم المصادق
                'address_type' => 'required|string|in:shipping,billing',
                'address_line1' => 'required|string|max:255',
                'address_line2' => 'nullable|string|max:255',
                'city' => 'required|string|max:100',
                'state' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'required|string|max:100',
                'is_default' => 'boolean',
            ]);

            // التأكد من أن المستخدم المصادق هو من يضيف العنوان أو أن المسؤول يضيفه
            if (auth()->check() && (auth()->user()->user_id == $request->user_id || auth()->user()->is_admin)) {
                $address = Address::create($request->all());
                return response()->json([
                    'message' => 'Address created successfully',
                    'address' => $address,
                ], 201);
            }

            return response()->json(['message' => 'Unauthorized to create address for this user'], 403);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
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
        // التأكد من أن المستخدم المصادق يملك العنوان أو أنه مسؤول
        if (auth()->check() && (auth()->user()->user_id == $address->user_id || auth()->user()->is_admin)) {
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
        try {
            // التأكد من أن المستخدم المصادق يملك العنوان أو أنه مسؤول
            if (auth()->check() && (auth()->user()->user_id == $address->user_id || auth()->user()->is_admin)) {
                $request->validate([
                    'user_id' => 'sometimes|required|exists:users,user_id',
                    'address_type' => 'sometimes|required|string|in:shipping,billing',
                    'address_line1' => 'sometimes|required|string|max:255',
                    'address_line2' => 'nullable|string|max:255',
                    'city' => 'sometimes|required|string|max:100',
                    'state' => 'nullable|string|max:100',
                    'postal_code' => 'nullable|string|max:20',
                    'country' => 'sometimes|required|string|max:100',
                    'is_default' => 'boolean',
                ]);

                $address->update($request->all());

                return response()->json([
                    'message' => 'Address updated successfully',
                    'address' => $address,
                ]);
            }
            return response()->json(['message' => 'Unauthorized to update this address'], 403);
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
            // التأكد من أن المستخدم المصادق يملك العنوان أو أنه مسؤول
            if (auth()->check() && (auth()->user()->user_id == $address->user_id || auth()->user()->is_admin)) {
                $address->delete();
                return response()->json([
                    'message' => 'Address deleted successfully',
                ], 204);
            }
            return response()->json(['message' => 'Unauthorized to delete this address'], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the address.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}