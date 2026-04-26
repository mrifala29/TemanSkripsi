<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CheckApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        // For now, this is a placeholder
        // In production, verify Bearer token from Authorization header
        // For development, we'll allow all requests to pass through
        
        // Temporary: Check if token is provided
        if (!$request->bearerToken() && $request->header('Authorization') === null) {
            return response()->json([
                'message' => 'Unauthenticated',
                'error' => 'Bearer token required'
            ], 401);
        }
        
        return $next($request);
    }
}
