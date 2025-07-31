<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class PageController extends Controller
{
    public function index()
    {
        if (Auth::check() && Auth::user()->is_admin) {
            $pages = Page::orderBy('updated_at', 'desc')->get();
        } else {
            $pages = Page::where('status', 'published')->get();
        }

        return response()->json($pages);
    }

    public function store(Request $request)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized to create pages.'], 403);
        }

        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:pages,slug',
                'content' => 'required|string',
                'status' => 'string|in:published,draft',
            ]);

            $page = Page::create($request->all());
            return response()->json(['message' => 'Page created successfully', 'page' => $page], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        }
    }

    public function show(Page $page)
    {
        if ($page->status === 'draft' && (!Auth::check() || !Auth::user()->is_admin)) {
            return response()->json(['message' => 'Page not found.'], 404);
        }
        return response()->json($page);
    }

    public function update(Request $request, Page $page)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized to update pages.'], 403);
        }

        try {
            $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'slug' => 'sometimes|required|string|max:255|unique:pages,slug,' . $page->page_id . ',page_id',
                'content' => 'sometimes|required|string',
                'status' => 'sometimes|required|string|in:published,draft',
            ]);

            $page->update($request->all());
            return response()->json(['message' => 'Page updated successfully', 'page' => $page]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        }
    }

    public function destroy(Page $page)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized to delete pages.'], 403);
        }

        $page->delete();
        return response()->json(['message' => 'Page deleted successfully'], 204);
    }
}
