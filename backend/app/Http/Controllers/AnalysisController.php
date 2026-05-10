<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AnalysisController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'data' => [],
            'message' => 'Analyses retrieved successfully'
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Trigger document analysis.
     */
    public function analyze(Request $request, string $id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Analisa sedang diproses.',
            'data'    => ['id' => $id, 'status' => 'processing'],
        ], 202);
    }

    /**
     * List similarity checks for the authenticated user.
     */
    public function similarityIndex(Request $request)
    {
        return response()->json(['success' => true, 'data' => []], 200);
    }

    /**
     * Trigger similarity check for a document.
     */
    public function similarityCheck(Request $request, string $id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Pengecekan kemiripan sedang diproses.',
            'data'    => ['document_id' => $id, 'status' => 'processing'],
        ], 202);
    }
}
