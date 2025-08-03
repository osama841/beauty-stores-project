<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuthRateLimitMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->resolveAuthSignature($request);
        $maxAttempts = $this->getMaxAttempts($request);
        $decayMinutes = $this->getDecayMinutes($request);

        // تسجيل محاولة تسجيل الدخول الفاشلة
        if ($this->isFailedLoginAttempt($request)) {
            RateLimiter::hit($key, $decayMinutes * 60);
            
            // تسجيل المحاولة الفاشلة
            Log::warning('Failed login attempt', [
                'ip' => $request->ip(),
                'email' => $request->input('email'),
                'user_agent' => $request->userAgent(),
                'attempts' => RateLimiter::attempts($key)
            ]);
        }

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = RateLimiter::availableIn($key);
            
            // تسجيل محاولة تجاوز الحد
            Log::alert('Rate limit exceeded for authentication', [
                'ip' => $request->ip(),
                'email' => $request->input('email'),
                'attempts' => RateLimiter::attempts($key),
                'retry_after' => $retryAfter
            ]);
            
            return response()->json([
                'message' => 'Too many failed login attempts. Please try again later.',
                'retry_after' => $retryAfter,
                'max_attempts' => $maxAttempts,
                'remaining_time' => $retryAfter
            ], 429)->withHeaders([
                'Retry-After' => $retryAfter,
                'X-RateLimit-Limit' => $maxAttempts,
                'X-RateLimit-Remaining' => 0,
                'X-RateLimit-Reset' => time() + $retryAfter
            ]);
        }

        $response = $next($request);

        // إذا نجح تسجيل الدخول، امسح المحاولات السابقة
        if ($this->isSuccessfulLogin($request, $response)) {
            RateLimiter::clear($key);
            
            Log::info('Successful login after rate limiting', [
                'ip' => $request->ip(),
                'email' => $request->input('email')
            ]);
        }

        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => RateLimiter::remaining($key, $maxAttempts),
            'X-RateLimit-Reset' => time() + ($decayMinutes * 60)
        ]);

        return $response;
    }

    /**
     * Resolve authentication signature.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    protected function resolveAuthSignature(Request $request): string
    {
        $ip = $request->ip();
        $email = $request->input('email', 'unknown');
        
        return 'auth:' . sha1($ip . '|' . $email);
    }

    /**
     * Get max attempts based on request type.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return int
     */
    protected function getMaxAttempts(Request $request): int
    {
        if ($request->is('api/login')) {
            return 5; // 5 محاولات لتسجيل الدخول
        }
        
        if ($request->is('api/register')) {
            return 3; // 3 محاولات للتسجيل
        }
        
        return 10; // افتراضي
    }

    /**
     * Get decay minutes based on request type.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return int
     */
    protected function getDecayMinutes(Request $request): int
    {
        if ($request->is('api/login')) {
            return 15; // 15 دقيقة لتسجيل الدخول
        }
        
        if ($request->is('api/register')) {
            return 30; // 30 دقيقة للتسجيل
        }
        
        return 15; // افتراضي
    }

    /**
     * Check if this is a failed login attempt.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function isFailedLoginAttempt(Request $request): bool
    {
        // سيتم تحديد هذا في AuthController
        return $request->has('failed_login') && $request->input('failed_login') === true;
    }

    /**
     * Check if this is a successful login.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Symfony\Component\HttpFoundation\Response  $response
     * @return bool
     */
    protected function isSuccessfulLogin(Request $request, Response $response): bool
    {
        return $request->is('api/login') && $response->getStatusCode() === 200;
    }
}
