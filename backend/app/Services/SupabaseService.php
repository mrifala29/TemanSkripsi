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
     * Sign up a new user via Supabase Auth
     */
    public function signUp(string $email, string $password, array $metadata = [])
    {
        try {
            $response = $this->client->post("/auth/v1/signup", [
                'headers' => $this->headers,
                'json' => [
                    'email'    => $email,
                    'password' => $password,
                    'data'     => $metadata,
                ],
            ]);

            return ['success' => true, 'data' => json_decode($response->getBody(), true)];
        } catch (RequestException $e) {
            $body = json_decode($e->getResponse()?->getBody(), true) ?? [];
            return ['success' => false, 'error' => $body['msg'] ?? $e->getMessage()];
        }
    }

    /**
     * Sign in with email + password via Supabase Auth
     */
    public function signIn(string $email, string $password)
    {
        try {
            $response = $this->client->post("/auth/v1/token?grant_type=password", [
                'headers' => $this->headers,
                'json' => [
                    'email'    => $email,
                    'password' => $password,
                ],
            ]);

            return ['success' => true, 'data' => json_decode($response->getBody(), true)];
        } catch (RequestException $e) {
            $body = json_decode($e->getResponse()?->getBody(), true) ?? [];
            return ['success' => false, 'error' => $body['error_description'] ?? $body['msg'] ?? $e->getMessage()];
        }
    }

    /**
     * Get authenticated user info via Supabase Auth token
     */
    public function getAuthUser(string $accessToken)
    {
        try {
            $response = $this->client->get("/auth/v1/user", [
                'headers' => array_merge($this->headers, [
                    'Authorization' => 'Bearer ' . $accessToken,
                ]),
            ]);

            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error("Supabase getAuthUser failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete data from a table
     */
    public function delete(string $table, array $where)
    {
        try {
            $url = "/rest/v1/{$table}";
            $query = [];
            foreach ($where as $key => $value) {
                $query[] = "{$key}=eq.{$value}";
            }
            if (!empty($query)) {
                $url .= '?' . implode('&', $query);
            }

            $this->client->delete($url, ['headers' => $this->headers]);
            return ['success' => true];
        } catch (RequestException $e) {
            Log::error("Supabase delete failed: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Update rows in a table
     */
    public function update(string $table, array $data, array $where)
    {
        try {
            $url = "/rest/v1/{$table}";
            $query = [];
            foreach ($where as $key => $value) {
                $query[] = "{$key}=eq.{$value}";
            }
            if (!empty($query)) {
                $url .= '?' . implode('&', $query);
            }

            $headers = array_merge($this->headers, ['Prefer' => 'return=representation']);
            $response = $this->client->patch($url, ['headers' => $headers, 'json' => $data]);
            return ['success' => true, 'data' => json_decode($response->getBody(), true)];
        } catch (RequestException $e) {
            Log::error("Supabase update failed: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Upload a file to Supabase Storage
     */
    public function uploadFile(string $bucket, string $path, string $fileContents, string $mimeType)
    {
        try {
            $response = $this->client->post("/storage/v1/object/{$bucket}/{$path}", [
                'headers' => array_merge($this->headers, [
                    'Content-Type' => $mimeType,
                    'x-upsert'     => 'true',
                ]),
                'body' => $fileContents,
            ]);

            $body = json_decode($response->getBody(), true);
            return ['success' => true, 'key' => $body['Key'] ?? $path];
        } catch (RequestException $e) {
            Log::error("Supabase uploadFile failed: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Delete a file from Supabase Storage
     */
    public function deleteFile(string $bucket, string $path)
    {
        try {
            $this->client->delete("/storage/v1/object/{$bucket}", [
                'headers' => $this->headers,
                'json'    => ['prefixes' => [$path]],
            ]);
            return ['success' => true];
        } catch (RequestException $e) {
            Log::error("Supabase deleteFile failed: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Insert and return the created row
     */
    public function insertReturn(string $table, array $data)
    {
        try {
            $headers = array_merge($this->headers, ['Prefer' => 'return=representation']);
            $response = $this->client->post("/rest/v1/{$table}", [
                'headers' => $headers,
                'json'    => $data,
            ]);

            $rows = json_decode($response->getBody(), true);
            return ['success' => true, 'data' => $rows[0] ?? null];
        } catch (RequestException $e) {
            Log::error("Supabase insertReturn failed: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
