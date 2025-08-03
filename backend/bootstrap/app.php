<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors; // ****** أضف هذا السطر ******
use Illuminate\Auth\AuthenticationException; // هذا قد يكون موجودًا بالفعل أو ستحتاجه لاحقًا
use Illuminate\Http\Request; // هذا قد يكون موجودًا بالفعل أو ستحتاجه لاحقًا

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // هنا يتم تعريف Middleware المجموعات والـ Middleware الفردية
        $middleware->api(prepend: [
            HandleCors::class, // ****** أضف هذا السطر هنا ******
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // ****** هذا هو الجزء الجديد والمهم جداً لحل مشكلة CSRF ******
        $middleware->validateCsrfTokens(except: [
            'api/*', // استثني جميع مسارات الـ API من فحص CSRF
        ]);
        // ****** نهاية الجزء الجديد والمهم جداً ******

        // إضافة Rate Limiting Middlewares
        $middleware->alias([
            'rate.limit' => \App\Http\Middleware\RateLimitMiddleware::class,
            'auth.rate.limit' => \App\Http\Middleware\AuthRateLimitMiddleware::class,
            'api.rate.limit' => \App\Http\Middleware\ApiRateLimitMiddleware::class,
        ]);

        // يمكنك إضافة Middleware أخرى هنا (كما كانت تعليقاتك الأصلية)
        // $middleware->append(
        //     \App\Http\Middleware\YourCustomMiddleware::class,
        // );

        // يمكنك تعريف مجموعات Middleware مخصصة (كما كانت تعليقاتك الأصلية)
        // $middleware->alias([
        //     'is_admin' => \App\Http\Middleware\IsAdmin::class,
        // ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // هذا الجزء موجود بالفعل في الكود الذي قدمته، وهو جيد
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });
    })
    // تأكد أن هذا الجزء موجود إذا كنت تستخدم Sanctum
    ->withProviders([
        Laravel\Sanctum\SanctumServiceProvider::class,
    ])
    ->create();