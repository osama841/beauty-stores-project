<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $maxAttempts = 5, $decayMinutes = 15): Response
    {
        $key = $this->resolveRequestSignature($request);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = RateLimiter::availableIn($key);
            
            return response()->json([
                'message' => 'Too many attempts. Please try again later.',
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
     * Resolve request signature.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    protected function resolveRequestSignature(Request $request): string
    {
        $identifier = $this->getRequestIdentifier($request);
        $route = $request->route();
        $routeName = $route ? $route->getName() : $request->path();
        
        return sha1($identifier . '|' . $routeName);
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
        
        // إذا كان هناك email في الطلب (للتسجيل/تسجيل الدخول)
        if ($request->has('email')) {
            return $ip . '|' . $request->input('email');
        }
        
        return $ip;
    }
}
