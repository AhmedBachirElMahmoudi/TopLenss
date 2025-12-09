<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'manager');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate(10);
    }

    public function stats()
    {
        return \Illuminate\Support\Facades\Cache::remember('admin_stats', 600, function () {
            return response()->json([
                'total_users' => User::count(),
                'total_managers' => User::where('role', 'manager')->count(),
                'total_clients' => \App\Models\Client::count(),
            ]);
        });
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'nullable|string',
        ]);

        $password = Str::password(10);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($password),
            'role' => $validated['role'] ?? 'manager',
            'must_change_password' => true,
        ]);

        // Send email with password
        try {
            Mail::raw("Welcome to TopLenss!\n\nYour login credentials are:\nEmail: {$user->email}\nPassword: $password\n\nPlease log in and change your password immediately.", function ($message) use ($user) {
                $message->to($user->email)->subject('Welcome to TopLenss - Account Created');
            });
        } catch (\Exception $e) {
            // Log error but don't fail the request
            logger()->error('Failed to send welcome email', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
            'password_preview' => $password // For dev purposes since email might not be configured
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return User::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|min:8'
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return $user;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
