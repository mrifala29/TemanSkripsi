<?php

namespace App\Http\Controllers;

use App\Services\SupabaseService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(protected SupabaseService $supabase) {}

    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        $result = $this->supabase->signUp(
            $request->email,
            $request->password,
            ['full_name' => $request->name]
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Registrasi gagal.',
            ], 422);
        }

        $data = $result['data'];

        // Supabase may require email confirmation — check if session exists
        if (empty($data['access_token'])) {
            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil. Silakan cek email untuk konfirmasi.',
                'data'    => null,
            ], 201);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user'  => [
                    'id'    => $data['user']['id'],
                    'name'  => $data['user']['user_metadata']['full_name'] ?? $request->name,
                    'email' => $data['user']['email'],
                ],
                'token' => $data['access_token'],
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $result = $this->supabase->signIn($request->email, $request->password);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Email atau password salah.',
            ], 401);
        }

        $data = $result['data'];

        return response()->json([
            'success' => true,
            'data' => [
                'user'  => [
                    'id'    => $data['user']['id'],
                    'name'  => $data['user']['user_metadata']['full_name'] ?? $data['user']['email'],
                    'email' => $data['user']['email'],
                ],
                'token' => $data['access_token'],
            ],
        ]);
    }

    public function logout(Request $request)
    {
        // Supabase JWT is stateless — client clears the token
        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}

