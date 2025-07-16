<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @mixin \Illuminate\Auth\AuthManager
 * @mixin \Illuminate\Contracts\Auth\Guard
 */
class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
