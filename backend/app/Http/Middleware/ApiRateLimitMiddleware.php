<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiRateLimitMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->resolveApiSignature($request);
        $maxAttempts = $this->getMaxAttempts($request);
        $decayMinutes = $this->getDecayMinutes($request);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = RateLimiter::availableIn($key);
            
            // تسجيل تجاوز الحد
            Log::warning('API rate limit exceeded', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'path' => $request->path(),
                'attempts' => RateLimiter::attempts($key),
                'retry_after' => $retryAfter
            ]);
            
            return response()->json([
                'message' => 'API rate limit exceeded. Please try again later.',
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

        RateLimiter::hit($key, $decayMinutes * 60);

        $response = $next($request);

        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => RateLimiter::remaining($key, $maxAttempts),
            'X-RateLimit-Reset' => time() + ($decayMinutes * 60)
        ]);

        return $response;
    }

    /**
     * Resolve API signature.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    protected function resolveApiSignature(Request $request): string
    {
        $identifier = $this->getRequestIdentifier($request);
        $route = $request->route();
        $routeName = $route ? $route->getName() : $request->path();
        
        return 'api:' . sha1($identifier . '|' . $routeName);
    }

    /**
     * Get request identifier.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    protected function getRequestIdentifier(Request $request): string
    {
        // استخدام IP address للمستخدم
        $ip = $request->ip();
        
        // إذا كان المستخدم مصادق، استخدم user_id أيضاً
        if ($request->user()) {
            return $ip . '|' . $request->user()->user_id;
        }
        
        return $ip;
    }

    /**
     * Get max attempts based on request type.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return int
     */
    protected function getMaxAttempts(Request $request): int
    {
        // مسارات المنتجات والفئات
        if ($request->is('api/products*') || $request->is('api/categories*') || $request->is('api/brands*')) {
            return 100; // 100 طلب في الدقيقة
        }
        
        // مسارات المراجعات
        if ($request->is('api/products/*/reviews*')) {
            return 50; // 50 طلب في الدقيقة
        }
        
        // مسارات الصفحات
        if ($request->is('api/pages*')) {
            return 30; // 30 طلب في الدقيقة
        }
        
        // افتراضي
        return 60; // 60 طلب في الدقيقة
    }

    /**
     * Get decay minutes based on request type.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return int
     */
    protected function getDecayMinutes(Request $request): int
    {
        // مسارات المنتجات والفئات
        if ($request->is('api/products*') || $request->is('api/categories*') || $request->is('api/brands*')) {
            return 1; // دقيقة واحدة
        }
        
        // مسارات المراجعات
        if ($request->is('api/products/*/reviews*')) {
            return 1; // دقيقة واحدة
        }
        
        // مسارات الصفحات
        if ($request->is('api/pages*')) {
            return 1; // دقيقة واحدة
        }
        
        // افتراضي
        return 1; // دقيقة واحدة
    }
}
