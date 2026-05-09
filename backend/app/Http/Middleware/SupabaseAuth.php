<?php

namespace App\Http\Middleware;

use App\Services\SupabaseService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class SupabaseAuth
{
    public function __construct(protected SupabaseService $supabase) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Cache user info for 5 minutes to avoid hitting Supabase on every request
        $cacheKey = 'supabase_user_' . hash('sha256', $token);

        $userData = Cache::remember($cacheKey, 300, function () use ($token) {
            return $this->supabase->getAuthUser($token);
        });

        if (!$userData || empty($userData['id'])) {
            Cache::forget($cacheKey);
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Attach user data to request so controllers can access it
        $request->merge(['_supabase_user' => $userData]);
        $request->setUserResolver(fn() => (object) [
            'id'    => $userData['id'],
            'name'  => $userData['user_metadata']['full_name'] ?? $userData['email'],
            'email' => $userData['email'],
        ]);

        return $next($request);
    }
}
