<?php

namespace App\Http\Controllers;

use App\Services\SupabaseService;
use GuzzleHttp\Client as HttpClient;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function __construct(protected SupabaseService $supabase) {}

    /**
     * List all documents for the authenticated user.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $documents = $this->supabase->query(
            'documents',
            '*',
            ['user_id' => $userId],
            100
        );

        return response()->json([
            'success' => true,
            'data'    => $documents,
        ]);
    }

    /**
     * Upload a new document.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file'  => 'required|file|mimes:pdf,ppt,pptx|max:20480', // 20 MB
            'title' => 'nullable|string|max:255',
        ]);

        $user  = $request->user();
        $file  = $request->file('file');
        $docId = (string) Str::uuid();

        $originalName = $file->getClientOriginalName();
        $extension    = strtolower($file->getClientOriginalExtension());
        $mimeType     = $file->getMimeType();
        $fileSize     = $file->getSize();
        $storagePath  = "{$user->id}/{$docId}.{$extension}";

        // Upload to Supabase Storage
        $uploadResult = $this->supabase->uploadFile(
            'documents',
            $storagePath,
            file_get_contents($file->getRealPath()),
            $mimeType
        );

        if (!$uploadResult['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah file: ' . ($uploadResult['error'] ?? 'Unknown error'),
            ], 500);
        }

        // Insert document record
        $result = $this->supabase->insertReturn('documents', [
            'id'              => $docId,
            'user_id'         => $user->id,
            'file_name'       => $originalName,
            'file_path'       => $storagePath,
            'file_type'       => $extension,
            'file_size_bytes' => $fileSize,
            'title'           => $request->input('title') ?? pathinfo($originalName, PATHINFO_FILENAME),
            'doc_type'        => 'laporan_akhir',
            'parse_status'    => 'pending',
        ]);

        if (!$result['success']) {
            // Cleanup uploaded file
            $this->supabase->deleteFile('documents', $storagePath);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data dokumen.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data'    => $result['data'],
        ], 201);
    }

    /**
     * Get a single document (must belong to user).
     */
    public function show(Request $request, string $id)
    {
        $userId = $request->user()->id;

        $rows = $this->supabase->query('documents', '*', [
            'id'      => $id,
            'user_id' => $userId,
        ]);

        if (empty($rows)) {
            return response()->json(['success' => false, 'message' => 'Dokumen tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => $rows[0]]);
    }

    /**
     * Delete a document and its file.
     */
    public function destroy(Request $request, string $id)
    {
        $userId = $request->user()->id;

        $rows = $this->supabase->query('documents', 'id,file_path,user_id', [
            'id'      => $id,
            'user_id' => $userId,
        ]);

        if (empty($rows)) {
            return response()->json(['success' => false, 'message' => 'Dokumen tidak ditemukan.'], 404);
        }

        $doc = $rows[0];

        // Delete from storage
        if (!empty($doc['file_path'])) {
            $this->supabase->deleteFile('documents', $doc['file_path']);
        }

        // Delete from DB
        $this->supabase->delete('documents', ['id' => $id, 'user_id' => $userId]);

        return response()->json(['success' => true, 'message' => 'Dokumen berhasil dihapus.']);
    }

    /**
     * Trigger document parsing (async via AI service).
     */
    public function parse(Request $request, string $id)
    {
        $userId = $request->user()->id;

        $rows = $this->supabase->query('documents', '*', [
            'id'      => $id,
            'user_id' => $userId,
        ]);

        if (empty($rows)) {
            return response()->json(['success' => false, 'message' => 'Dokumen tidak ditemukan.'], 404);
        }

        $doc = $rows[0];

        if ($doc['parse_status'] === 'processing') {
            return response()->json(['success' => false, 'message' => 'Dokumen sedang diproses.'], 422);
        }

        if ($doc['parse_status'] === 'done') {
            return response()->json(['success' => false, 'message' => 'Dokumen sudah diproses.'], 422);
        }

        // Mark as processing
        $this->supabase->update('documents', ['parse_status' => 'processing'], ['id' => $id]);

        // Call AI service asynchronously
        try {
            $aiUrl = rtrim(env('AI_SERVICE_URL', 'http://localhost:8001'), '/');
            $http = new HttpClient(['timeout' => 5]);
            $http->post("{$aiUrl}/documents/parse", [
                'json' => [
                    'document_id' => $id,
                    'file_path'   => $doc['file_path'],
                    'file_type'   => $doc['file_type'],
                ],
            ]);
        } catch (\Exception $e) {
            // AI service unreachable — status stays as 'processing', will be retried
            \Illuminate\Support\Facades\Log::warning("AI service call failed for doc {$id}: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Dokumen sedang diproses.',
            'data'    => array_merge($doc, ['parse_status' => 'processing']),
        ], 202);
    }

    /**
     * Not used (API-only, no HTML forms).
     */
    public function create() {}
    public function edit(string $id) {}
    public function update(Request $request, string $id) {}
}

