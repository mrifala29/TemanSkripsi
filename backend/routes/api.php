<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AnalysisController;
use App\Services\SupabaseService;

// ====================================
// Health Check
// ====================================
Route::get('/health', function () {
    return response()->json([
        'status'    => 'ok',
        'app'       => 'TemanSkripsi API',
        'timestamp' => now(),
    ]);
});

Route::get('/test/supabase', function () {
    $supabase = app(SupabaseService::class);
    $result = $supabase->testConnection();
    return response()->json([
        'supabase_connected' => $result['success'],
        'message'            => $result['message'],
    ]);
});

// ====================================
// Auth (public)
// ====================================
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// ====================================
// Authenticated Routes
// ====================================
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Documents
    Route::resource('documents', DocumentController::class);
    Route::post('documents/{id}/parse', [DocumentController::class, 'parse']);

    // Sessions (Simulasi)
    Route::resource('sessions', SessionController::class);

    // Messages (Chat)
    Route::resource('sessions.messages', MessageController::class)->shallow();

    // Analyses
    Route::resource('analyses', AnalysisController::class);
    Route::post('documents/{id}/analyze', [AnalysisController::class, 'analyze']);
});
