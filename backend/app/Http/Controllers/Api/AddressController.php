<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AddressController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Address::class, 'address');
    }

    public function index()
    {
        $addresses = Address::where('user_id', auth()->id())->get();
        return response()->json($addresses);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'address_type' => 'required|string|in:shipping,billing',
                'address_line1' => 'required|string|max:255',
                'address_line2' => 'nullable|string|max:255',
                'city' => 'required|string|max:100',
                'state' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'required|string|max:100',
                'is_default' => 'boolean',
            ]);

            $address = auth()->user()->addresses()->create($request->all());

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
            return response()->json([
                'message' => 'An error occurred while creating the address.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Address $address)
    {
        return response()->json($address);
    }

    public function update(Request $request, Address $address)
    {
        try {
            $request->validate([
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

    public function destroy(Address $address)
    {
        try {
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