<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/*', // هذا السطر هو الأهم: يستثني جميع المسارات التي تبدأ بـ /api/
        // يمكنك إضافة مسارات أخرى إذا كان لديك API لا يبدأ بـ /api/
    ];
}