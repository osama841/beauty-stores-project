<?php

    namespace App\Http\Controllers\Api;

    use App\Http\Controllers\Controller;
    use App\Models\User;
    use Illuminate\Http\Request;
    use Illuminate\Validation\ValidationException;
    use Illuminate\Support\Facades\Hash;
    use Illuminate\Support\Facades\Log;

    class UserController extends Controller
    {
        /**
         * Display a listing of the users.
         * (Accessible by authenticated admins only)
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\JsonResponse
         */
        public function index(Request $request)
        {
            if (!auth()->check() || !auth()->user()->is_admin) {
                return response()->json(['message' => 'Unauthorized to view users.'], 403);
            }

            $users = User::orderBy('created_at', 'desc')
                         ->paginate($request->get('per_page', 10));

            return response()->json($users);
        }

        /**
         * Store a newly created user in storage.
         * (Primarily for admin to create users, or internal use)
         *
         * @param  \Illuminate\Http\Request  $request
         * @return \Illuminate\Http\JsonResponse
         */
        public function store(Request $request)
        {
            if (!auth()->check() || !auth()->user()->is_admin) {
                return response()->json(['message' => 'Unauthorized to create users.'], 403);
            }

            try {
                $request->validate([
                    'first_name' => 'required|string|max:50',
                    'last_name' => 'required|string|max:50',
                    'username' => 'required|string|max:50|unique:users,username',
                    'email' => 'required|string|email|max:100|unique:users,email',
                    'password' => 'required|string|min:8',
                    'phone_number' => 'nullable|string|max:20',
                    'is_admin' => 'boolean',
                    'status' => 'string|in:active,inactive,suspended',
                ]);

                $user = User::create([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'username' => $request->username,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'phone_number' => $request->phone_number,
                    'is_admin' => $request->is_admin ?? false,
                    'status' => $request->status ?? 'active',
                ]);

                return response()->json([
                    'message' => 'User created successfully',
                    'user' => $user,
                ], 201);
            } catch (ValidationException $e) {
                return response()->json([
                    'message' => 'Validation Error',
                    'errors' => $e->errors(),
                ], 422);
            } catch (\Exception $e) {
                Log::error('Error creating user: ' . $e->getMessage());
                return response()->json([
                    'message' => 'An error occurred while creating the user.',
                    'error' => $e->getMessage(),
                ], 500);
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
            if (!auth()->check() || (!auth()->user()->is_admin && auth()->user()->user_id != $user->user_id)) {
                return response()->json(['message' => 'Unauthorized to view this user.'], 403);
            }
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
            if (!auth()->check() || (!auth()->user()->is_admin && auth()->user()->user_id != $user->user_id)) {
                return response()->json(['message' => 'Unauthorized to update this user.'], 403);
            }

            try {
                $request->validate([
                    'first_name' => 'sometimes|required|string|max:50',
                    'last_name' => 'sometimes|required|string|max:50',
                    'username' => 'sometimes|required|string|max:50|unique:users,username,' . $user->user_id . ',user_id',
                    'email' => 'sometimes|required|string|email|max:100|unique:users,email,' . $user->user_id . ',user_id',
                    'password' => 'nullable|string|min:8',
                    'phone_number' => 'nullable|string|max:20',
                    'is_admin' => 'boolean',
                    'status' => 'string|in:active,inactive,suspended',
                ]);

                $updateData = $request->all();

                if (!auth()->user()->is_admin) {
                    unset($updateData['is_admin']);
                    unset($updateData['status']);
                }

                if (isset($updateData['password']) && !empty($updateData['password'])) {
                    $updateData['password'] = Hash::make($updateData['password']);
                } else {
                    unset($updateData['password']);
                }

                $user->update($updateData);

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
                Log::error('Error updating user: ' . $e->getMessage());
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
            if (!auth()->check() || !auth()->user()->is_admin || auth()->user()->user_id == $user->user_id) {
                return response()->json(['message' => 'Unauthorized to delete this user or cannot delete self.'], 403);
            }

            try {
                $user->delete();
                return response()->json([
                    'message' => 'User deleted successfully',
                ], 204);
            } catch (\Exception $e) {
                Log::error('Error deleting user: ' . $e->getMessage());
                return response()->json([
                    'message' => 'An error occurred while deleting the user.',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
    }
    