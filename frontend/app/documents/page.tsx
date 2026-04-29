'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { getUser } from '@/lib/auth'

type Document = {
  id: string
  file_name: string
  file_type: string
  parse_status: 'pending' | 'processing' | 'done' | 'failed'
  title: string | null
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Menunggu',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  processing: { label: 'Diproses', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  done:       { label: 'Siap',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed:     { label: 'Gagal',    cls: 'bg-red-50 text-red-700 border-red-200' },
}

function fileTypeIcon(type: string) {
  if (type?.includes('pdf')) return '📄'
  if (type?.includes('ppt')) return '📊'
  return '📁'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  const days = Math.floor(hrs / 24)
  return `${days} hari lalu`
}

export default function DocumentsPage() {
  const user = getUser()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadDocuments() }, [])

  async function loadDocuments() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getDocuments()
      setDocuments(res.data || [])
    } catch {
      setError('Gagal memuat dokumen. Periksa koneksi.')
    } finally {
      setLoading(false)
    }
  }

  async function uploadFile(file: File) {
    const allowed = ['application/pdf', 'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation']
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|ppt|pptx)$/i)) {
      setError('Format tidak didukung. Gunakan PDF, PPT, atau PPTX.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Ukuran file maksimal 20MB.')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    setError(null)
    setUploadSuccess(false)
    try {
      await api.uploadDocument(formData)
      setUploadSuccess(true)
      await loadDocuments()
      if (fileRef.current) fileRef.current.value = ''
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (e: any) {
      setError(e.message || 'Upload gagal. Coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Halo, {user?.name?.split(' ')[0] ?? 'Mahasiswa'} 👋
          </h1>
          <p className="text-gray-500 mt-1">Upload skripsimu dan mulai latihan sidang dengan AI.</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Dokumen', value: documents.length, icon: '📄' },
            { label: 'Siap dipakai', value: documents.filter(d => d.parse_status === 'done').length, icon: '✅' },
            { label: 'Diproses', value: documents.filter(d => ['processing', 'pending'].includes(d.parse_status)).length, icon: '⏳' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.icon} {s.label}</p>
            </div>
          ))}
        </div>

        {/* Upload area */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Upload Dokumen Baru</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-all ${
              dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <input ref={fileRef} type="file" accept=".pdf,.ppt,.pptx" onChange={handleFileChange} className="hidden" />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-indigo-600 font-medium">Mengupload...</p>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3">📤</div>
                <p className="text-gray-700 font-medium">Drag & drop atau klik untuk pilih file</p>
                <p className="text-xs text-gray-400 mt-1">PDF, PPT, PPTX — maks. 20MB</p>
              </>
            )}
          </div>
          <AnimatePresence>
            {uploadSuccess && (
              <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3 text-sm text-emerald-600 font-medium">
                ✅ Dokumen berhasil diupload!
              </motion.p>
            )}
            {error && (
              <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Documents list */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Dokumen Saya</h2>
            <button onClick={loadDocuments} disabled={loading}
              className="text-xs text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50">
              {loading ? '⏳ Memuat...' : '↻ Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Memuat dokumen...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">📂</div>
              <p className="text-gray-500 font-medium">Belum ada dokumen</p>
              <p className="text-sm text-gray-400 mt-1">Upload dokumen skripsimu untuk memulai</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map((doc, i) => {
                const cfg = STATUS_CONFIG[doc.parse_status] ?? STATUS_CONFIG.pending
                const canUse = doc.parse_status === 'done'
                return (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl flex-shrink-0 mt-0.5">{fileTypeIcon(doc.file_type)}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{doc.file_name}</p>
                          {doc.title && <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.title}</p>}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
                            <span className="text-xs text-gray-400">{timeAgo(doc.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={canUse ? `/sessions?doc=${doc.id}` : '#'}
                          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                            canUse ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' : 'bg-gray-50 text-gray-400 border-gray-200 pointer-events-none'
                          }`}>
                          🎤 Simulasi
                        </Link>
                        <Link href={canUse ? `/analysis?doc=${doc.id}` : '#'}
                          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                            canUse ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-200 pointer-events-none'
                          }`}>
                          📊 Analisa
                        </Link>
                        <Link href={canUse ? `/similarity?doc=${doc.id}` : '#'}
                          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                            canUse ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-gray-50 text-gray-400 border-gray-200 pointer-events-none'
                          }`}>
                          🔍 Plagiasi
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* History placeholder */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Riwayat Aktivitas</h2>
            <p className="text-xs text-gray-400 mt-0.5">Sesi simulasi, analisa, dan cek plagiasi terakhir</p>
          </div>
          <div className="px-6 py-8 text-center text-gray-400">
            <p className="text-sm">Riwayat akan muncul setelah kamu menggunakan fitur simulasi atau analisa.</p>
            <div className="flex justify-center gap-4 mt-4">
              {documents.some(d => d.parse_status === 'done') ? (
                <>
                  <Link href="/sessions" className="text-xs text-indigo-600 hover:underline font-medium">Mulai Simulasi →</Link>
                  <Link href="/analysis" className="text-xs text-emerald-600 hover:underline font-medium">Mulai Analisa →</Link>
                </>
              ) : (
                <p className="text-xs text-gray-400">Upload & proses dokumenmu dulu.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
