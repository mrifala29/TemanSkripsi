<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Generate a mock token without database access
     * TODO: Use proper Sanctum tokens after fixing DB connection
     */
    private function generateMockToken()
    {
        return Str::random(80);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        // TEMPORARY: Bypass DB for testing - create token without saving user
        // TODO: Implement proper User::create() after fixing DB connection
        $user = new User([
            'id'    => rand(1, 9999),
            'name'  => $request->name,
            'email' => $request->email,
        ]);

        $token = $this->generateMockToken();

        return response()->json([
            'success' => true,
            'data' => [
                'user'  => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // TEMPORARY: Bypass DB for testing - accept any credentials
        // TODO: Implement proper Eloquent-based auth after fixing DB connection
        $user = new User([
            'id'    => rand(1, 9999),
            'name'  => 'Test User',
            'email' => $request->email,
        ]);

        $token = $this->generateMockToken();

        return response()->json([
            'success' => true,
            'data' => [
                'user'  => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        // Mock logout - no DB access needed
        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id'    => $request->user()->id ?? 1,
                'name'  => $request->user()->name ?? 'Test User',
                'email' => $request->user()->email ?? 'test@test.com',
            ],
        ]);
    }
}

