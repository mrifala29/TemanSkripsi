import { getToken } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  }

  // Remove Content-Type for FormData (let browser set multipart boundary)
  if (options?.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error || body?.message || `API error: ${res.status}`)
  }

  return res.json()
}

export const auth = {
  register: (name: string, email: string, password: string) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    fetchAPI('/auth/logout', { method: 'POST' }),

  me: () => fetchAPI('/auth/me'),
}

export const api = {
  // Documents
  getDocuments: () => fetchAPI('/documents'),
  uploadDocument: (formData: FormData) =>
    fetchAPI('/documents', { method: 'POST', body: formData }),
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

