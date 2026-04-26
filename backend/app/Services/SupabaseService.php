<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class SupabaseService
{
    protected $client;
    protected $baseUrl;
    protected $apiKey;
    protected $headers;

    public function __construct()
    {
        $this->baseUrl = config('services.supabase.url');
        // Use service role key for backend operations
        $this->apiKey = config('services.supabase.service_role_key');
        
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => 10,
        ]);

        $this->headers = [
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
            'apikey' => $this->apiKey,
        ];
    }

    /**
     * Test connection ke Supabase
     */
    public function testConnection()
    {
        try {
            $response = $this->client->get('/rest/v1/', [
                'headers' => $this->headers,
            ]);

            return [
                'success' => $response->getStatusCode() === 200,
                'message' => 'Connected to Supabase',
            ];
        } catch (RequestException $e) {
            Log::error('Supabase connection failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Query table via REST API
     */
    public function query($table, $select = '*', $where = [], $limit = 100)
    {
        try {
            $url = "/rest/v1/{$table}?select={$select}&limit={$limit}";
            
            // Build WHERE clause
            foreach ($where as $key => $value) {
                $url .= "&{$key}=eq.{$value}";
            }

            $response = $this->client->get($url, [
                'headers' => $this->headers,
            ]);

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error("Supabase query failed: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Insert data
     */
    public function insert($table, $data)
    {
        try {
            $response = $this->client->post("/rest/v1/{$table}", [
                'headers' => $this->headers,
                'json' => $data,
            ]);

            return [
                'success' => true,
                'data' => json_decode($response->getBody(), true),
            ];
        } catch (RequestException $e) {
            Log::error("Supabase insert failed: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get from Supabase Auth (untuk user info)
     */
    public function getAuthUser($userId)
    {
        try {
            $response = $this->client->get("/auth/v1/user", [
                'headers' => array_merge($this->headers, [
                    'Authorization' => 'Bearer ' . $userId,
                ]),
            ]);

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error("Supabase auth get failed: " . $e->getMessage());
            return null;
        }
    }
}
