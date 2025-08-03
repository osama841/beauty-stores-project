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
        public function __construct()
        {
            $this->authorizeResource(User::class, 'user');
        }

        public function index(Request $request)
        {
            $users = User::orderBy('created_at', 'desc')
                         ->paginate($request->get('per_page', 10));

            return response()->json($users);
        }

        public function store(Request $request)
        {
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

        public function show(User $user)
        {
            return response()->json($user);
        }

        public function update(Request $request, User $user)
        {
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

                if (auth()->check() && !auth()->user()->is_admin) {
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

        public function destroy(User $user)
        {
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
    