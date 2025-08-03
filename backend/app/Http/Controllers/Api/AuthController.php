<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User; // تأكد من استيراد نموذج المستخدم
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth; // لضمان وجوده، حتى لو لم يستخدم مباشرة في register
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        try {
            // قواعد التحقق لجميع الحقول التي يتم إرسالها من الواجهة الأمامية
            $request->validate([
                'first_name' => 'required|string|max:50',
                'last_name' => 'required|string|max:50',
                'username' => 'required|string|max:50|unique:users,username',
                'email' => 'required|string|email|max:100|unique:users,email',
                'password' => 'required|string|min:8|confirmed', // 'confirmed' يتطلب حقل password_confirmation
                'phone_number' => 'nullable|string|max:20', // 'nullable' يعني اختياري، يمكنك تغييره إلى 'required' إذا أردت جعله إجباريًا
            ]);

            // إنشاء المستخدم في قاعدة البيانات بجميع الحقول
            $user = User::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password), // تشفير كلمة المرور
                'phone_number' => $request->phone_number,
                'status' => 'active', // تعيين الحالة الافتراضية للمستخدم الجديد
                'is_admin' => false, // تعيين قيمة افتراضية لـ is_admin (المستخدم الجديد ليس مسؤولاً)
            ]);

            // إنشاء رمز API للمستخدم الجديد باستخدام Laravel Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // تسجيل التسجيل الناجح
            Log::info('User registered successfully', [
                'user_id' => $user->user_id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            // إرجاع استجابة JSON بنجاح التسجيل وبيانات المستخدم والرمز المميز
            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201); // 201 Created
        } catch (ValidationException $e) {
            // التقاط أخطاء التحقق وإرجاعها في استجابة JSON
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(), // يحتوي هذا على تفاصيل الأخطاء لكل حقل
            ], 422); // 422 Unprocessable Content
        } catch (\Exception $e) {
            // التقاط أي أخطاء أخرى غير متوقعة
            Log::error('Error during registration: ' . $e->getMessage()); // تسجيل الخطأ في سجلات Laravel
            return response()->json([
                'message' => 'An error occurred during registration.',
                'error' => $e->getMessage(),
            ], 500); // 500 Internal Server Error
        }
    }

    /**
     * Authenticate user and return a token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            Log::info('🚀 بدأ login', $request->all());

            // قواعد التحقق لحقلي البريد الإلكتروني وكلمة المرور
            $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            // البحث عن المستخدم باستخدام البريد الإلكتروني
            $user = User::where('email', $request->email)->first();

            // التحقق من وجود المستخدم وصحة كلمة المرور
            if (!$user || !Hash::check($request->password, $user->password)) {
                // تسجيل المحاولة الفاشلة
                Log::warning('Failed login attempt', [
                    'email' => $request->email,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);

                return response()->json([
                    'message' => 'Invalid credentials',
                ], 401); // 401 Unauthorized
            }

            Log::info('✅ بيانات صحيحة للمستخدم: ' . $user->user_id);

            // حذف جميع الرموز المميزة السابقة للمستخدم لضمان صلاحية واحدة لكل جلسة
            $user->tokens()->delete();

            // إنشاء رمز API جديد للمستخدم
            $token = $user->createToken('auth_token')->plainTextToken;

            // إرجاع استجابة JSON بنجاح تسجيل الدخول وبيانات المستخدم والرمز المميز
            return response()->json([
                'message' => 'Logged in successfully',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (ValidationException $e) {
            // التقاط أخطاء التحقق وإرجاعها في استجابة JSON
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422); // 422 Unprocessable Content
        } catch (\Exception $e) {
            // التقاط أي أخطاء أخرى غير متوقعة
            Log::error('🔥 خطأ في login: ' . $e->getMessage()); // تسجيل الخطأ في سجلات Laravel
            return response()->json([
                'message' => 'An error occurred during login.',
                'error' => $e->getMessage(),
            ], 500); // 500 Internal Server Error
        }
    }

    /**
     * Get the authenticated user details.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        // إرجاع بيانات المستخدم المصادق عليه حاليًا
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Log out the authenticated user (revoke token).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // حذف الرمز المميز الحالي المستخدم للمصادقة (تسجيل الخروج)
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
