<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AnalysisController;
use App\Services\SupabaseService;

// ====================================
// Health Check (tidak perlu auth)
// ====================================
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => 'TemanSkripsi API',
        'timestamp' => now(),
    ]);
});

// Test Supabase connection
Route::get('/test/supabase', function () {
    $supabase = app(SupabaseService::class);
    $result = $supabase->testConnection();
    
    return response()->json([
        'supabase_connected' => $result['success'],
        'message' => $result['message'],
    ]);
});

// ====================================
// Authenticated Routes (TEMPORARY: No auth for testing)
// ====================================
Route::group([], function () {
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