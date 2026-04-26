'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'

type Document = {
  id: string
  file_name: string
  file_type: string
  parse_status: string
  title: string | null
  created_at: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadDocuments() {
    setLoading(true)
    try {
      const res = await api.getDocuments()
      setDocuments(res.data || [])
    } catch (e) {
      setError('Gagal memuat dokumen')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setError(null)
    try {
      await api.uploadDocument(formData)
      await loadDocuments()
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setError('Gagal upload dokumen. Pastikan format PDF/PPT dan max 20MB.')
    } finally {
      setUploading(false)
    }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-900 text-yellow-300',
      processing: 'bg-blue-900 text-blue-300',
      done: 'bg-green-900 text-green-300',
      failed: 'bg-red-900 text-red-300',
    }
    return colors[status] || 'bg-gray-800 text-gray-400'
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📄 Dokumen</h1>
          <p className="text-gray-500 mt-1">Upload dan kelola dokumen skripsimu</p>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Dokumen Baru</h2>
        <div className="flex gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.ppt,.pptx"
            required
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 file:bg-indigo-600 file:text-white file:border-0 file:px-3 file:py-1 file:rounded file:mr-3 file:cursor-pointer"
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {uploading ? 'Mengupload...' : 'Upload'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Format: PDF, PPT, PPTX. Max 20MB.</p>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Daftar Dokumen</h2>
          <button onClick={loadDocuments} className="text-sm text-gray-400 hover:text-indigo-600">
            {loading ? 'Loading...' : '↻ Refresh'}
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📂</div>
            <p>Belum ada dokumen. Upload dokumen pertamamu!</p>
            <button onClick={loadDocuments} className="mt-3 text-sm text-indigo-600 hover:underline">
              Load dokumen
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div key={doc.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-gray-900 font-medium">{doc.file_name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {doc.title || 'Judul belum tersedia'} •{' '}
                    {new Date(doc.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(doc.parse_status)}`}>
                    {doc.parse_status}
                  </span>
                  <Link
                    href={`/sessions/new?doc=${doc.id}`}
                    className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Simulasi
                  </Link>
                  <Link
                    href={`/analysis/new?doc=${doc.id}`}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Analisa
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
