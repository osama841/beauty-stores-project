<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // عرض جميع المستخدمين، مع إمكانية التصفية أو البحث لاحقًا
        $users = User::all();
        return response()->json($users);
    }

    /**
     * Store a newly created user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string|max:50|unique:users,username',
                'email' => 'required|string|email|max:100|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
                'first_name' => 'nullable|string|max:50',
                'last_name' => 'nullable|string|max:50',
                'phone_number' => 'nullable|string|max:20',
                'profile_picture_url' => 'nullable|url|max:255',
                'is_admin' => 'boolean',
                'status' => 'string|in:active,inactive,suspended',
            ]);

            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password), // تشفير كلمة المرور
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'phone_number' => $request->phone_number,
                'profile_picture_url' => $request->profile_picture_url,
                'is_admin' => $request->is_admin ?? false, // القيمة الافتراضية false
                'status' => $request->status ?? 'active', // القيمة الافتراضية active
            ]);

            // يمكنك إنشاء رمز API للمستخدم هنا إذا كنت تستخدم Sanctum للمصادقة القائمة على الرمز
            // $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'User created successfully',
                'user' => $user,
                // 'token' => $token, // أرسل الرمز إذا كنت تستخدمه
            ], 201); // 201 Created
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422); // 422 Unprocessable Entity
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while creating the user.',
                'error' => $e->getMessage(),
            ], 500); // 500 Internal Server Error
        }
    }

    /**
     * Display the specified user.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(User $user)
    {
        // يتم حقن نموذج المستخدم تلقائيًا (Route Model Binding)
        return response()->json($user);
    }

    /**
     * Update the specified user in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, User $user)
    {
        try {
            $request->validate([
                'username' => 'sometimes|required|string|max:50|unique:users,username,' . $user->user_id . ',user_id',
                'email' => 'sometimes|required|string|email|max:100|unique:users,email,' . $user->user_id . ',user_id',
                'password' => 'nullable|string|min:8|confirmed', // يمكن أن يكون فارغًا للتحديث
                'first_name' => 'nullable|string|max:50',
                'last_name' => 'nullable|string|max:50',
                'phone_number' => 'nullable|string|max:20',
                'profile_picture_url' => 'nullable|url|max:255',
                'is_admin' => 'boolean',
                'status' => 'string|in:active,inactive,suspended',
            ]);

            $userData = $request->except('password', 'password_confirmation'); // استبعاد كلمة المرور إذا لم يتم تحديثها

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified user from storage.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(User $user)
    {
        try {
            $user->delete(); // يقوم بالحذف الناعم بسبب SoftDeletes trait في النموذج

            return response()->json([
                'message' => 'User deleted successfully (soft deleted)',
            ], 204); // 204 No Content
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}