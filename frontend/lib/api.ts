const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}

export const api = {
  // Documents
  getDocuments: () => fetchAPI('/documents'),
  uploadDocument: (formData: FormData) =>
    fetchAPI('/documents', { method: 'POST', body: formData, headers: {} }),
  deleteDocument: (id: string) =>
    fetchAPI(`/documents/${id}`, { method: 'DELETE' }),

  // Sessions
  getSessions: () => fetchAPI('/sessions'),
  createSession: (data: { document_id: string }) =>
    fetchAPI('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  getSession: (id: string) => fetchAPI(`/sessions/${id}`),

  // Messages
  getMessages: (sessionId: string) =>
    fetchAPI(`/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: string, content: string) =>
    fetchAPI(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Analysis
  getAnalyses: () => fetchAPI('/analyses'),
  analyzeDocument: (documentId: string) =>
    fetchAPI(`/documents/${documentId}/analyze`, { method: 'POST' }),

  // Health
  health: () => fetchAPI('/health'),
  testSupabase: () => fetchAPI('/test/supabase'),
}
