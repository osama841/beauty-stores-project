<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for rate limiting in the application.
    | You can customize the limits for different types of requests.
    |
    */

    'auth' => [
        'login' => [
            'max_attempts' => env('LOGIN_MAX_ATTEMPTS', 5),
            'decay_minutes' => env('LOGIN_DECAY_MINUTES', 15),
        ],
        'register' => [
            'max_attempts' => env('REGISTER_MAX_ATTEMPTS', 3),
            'decay_minutes' => env('REGISTER_DECAY_MINUTES', 30),
        ],
    ],

    'api' => [
        'general' => [
            'max_attempts' => env('API_GENERAL_MAX_ATTEMPTS', 60),
            'decay_minutes' => env('API_GENERAL_DECAY_MINUTES', 1),
        ],
        'products' => [
            'max_attempts' => env('API_PRODUCTS_MAX_ATTEMPTS', 100),
            'decay_minutes' => env('API_PRODUCTS_DECAY_MINUTES', 1),
        ],
        'reviews' => [
            'max_attempts' => env('API_REVIEWS_MAX_ATTEMPTS', 50),
            'decay_minutes' => env('API_REVIEWS_DECAY_MINUTES', 1),
        ],
        'pages' => [
            'max_attempts' => env('API_PAGES_MAX_ATTEMPTS', 30),
            'decay_minutes' => env('API_PAGES_DECAY_MINUTES', 1),
        ],
    ],

    'protected' => [
        'max_attempts' => env('PROTECTED_MAX_ATTEMPTS', 60),
        'decay_minutes' => env('PROTECTED_DECAY_MINUTES', 1),
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Headers
    |--------------------------------------------------------------------------
    |
    | Headers that will be added to responses when rate limiting is active.
    |
    */
    'headers' => [
        'limit' => 'X-RateLimit-Limit',
        'remaining' => 'X-RateLimit-Remaining',
        'reset' => 'X-RateLimit-Reset',
        'retry_after' => 'Retry-After',
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Messages
    |--------------------------------------------------------------------------
    |
    | Custom messages for different rate limiting scenarios.
    |
    */
    'messages' => [
        'auth_exceeded' => 'Too many failed login attempts. Please try again later.',
        'api_exceeded' => 'API rate limit exceeded. Please try again later.',
        'general_exceeded' => 'Too many requests. Please try again later.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Logging
    |--------------------------------------------------------------------------
    |
    | Enable or disable logging for rate limiting events.
    |
    */
    'logging' => [
        'enabled' => env('RATE_LIMIT_LOGGING', true),
        'failed_attempts' => env('LOG_FAILED_ATTEMPTS', true),
        'exceeded_limits' => env('LOG_EXCEEDED_LIMITS', true),
    ],
]; 