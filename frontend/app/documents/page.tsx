'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { getUser } from '@/lib/auth'

type DocCategory = 'draft_proposal' | 'laporan_skripsi' | 'ppt_proposal' | 'ppt_sidang' | 'other'

type Document = {
  id: string
  file_name: string
  file_type: string
  parse_status: 'pending' | 'processing' | 'done' | 'failed'
  title: string | null
  doc_type: DocCategory | null
  created_at: string
  file_size_bytes?: number | null
}

const CATEGORIES: Record<DocCategory, { label: string; color: string }> = {
  draft_proposal:  { label: 'Draft Proposal',   color: 'text-purple-700 bg-purple-50 border-purple-200' },
  laporan_skripsi: { label: 'Laporan Skripsi',  color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  ppt_proposal:    { label: 'PPT Proposal',      color: 'text-sky-700 bg-sky-50 border-sky-200' },
  ppt_sidang:      { label: 'PPT Sidang Akhir', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  other:           { label: 'Lainnya',           color: 'text-gray-600 bg-gray-50 border-gray-200' },
}

const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  pending:    { label: 'Menunggu',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  processing: { label: 'Diproses', cls: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-400 animate-pulse' },
  done:       { label: 'Siap',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  failed:     { label: 'Gagal',    cls: 'bg-red-50 text-red-700 border-red-200',            dot: 'bg-red-400' },
}

function fileIcon(type: string) {
  if (type?.includes('pdf')) return '📄'
  if (type?.includes('ppt')) return '📊'
  return '📁'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtSize(b: number | null | undefined) {
  if (!b) return ''
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const user = getUser()
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [parsing, setParsing] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  useEffect(() => {
    const hasActive = docs.some(d => d.parse_status === 'pending' || d.parse_status === 'processing')
    if (!hasActive) return
    const t = setInterval(() => load(true), 5000)
    return () => clearInterval(t)
  }, [docs])

  useEffect(() => {
    if (renamingId) renameRef.current?.focus()
  }, [renamingId])

  async function load(silent = false) {
    if (!silent) setLoading(true)
    try {
      const res = await api.getDocuments()
      setDocs(res.data || [])
    } catch {
      if (!silent) setError('Gagal memuat dokumen.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function upload(file: File) {
    if (!file.name.match(/\.(pdf|ppt|pptx)$/i)) {
      setError('Format tidak didukung. Gunakan PDF, PPT, atau PPTX.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File terlalu besar (maks 20MB).')
      return
    }
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    setError(null)
    try {
      await api.uploadDocument(fd)
      setSuccess('Dokumen berhasil diupload!')
      setShowUpload(false)
      await load()
      setTimeout(() => setSuccess(null), 4000)
    } catch (e: any) {
      setError(e.message || 'Upload gagal.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(doc: Document) {
    if (!confirm('Hapus "' + (doc.title || doc.file_name) + '"? Tidak bisa dibatalkan.')) return
    setDeletingId(doc.id)
    try {
      await api.deleteDocument(doc.id)
      setDocs(prev => prev.filter(d => d.id !== doc.id))
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus.')
    } finally {
      setDeletingId(null)
    }
  }

  function startRename(doc: Document) {
    setRenamingId(doc.id)
    setRenameValue(doc.title || doc.file_name)
  }

  async function commitRename(doc: Document) {
    const newName = renameValue.trim()
    if (!newName || newName === (doc.title || doc.file_name)) {
      setRenamingId(null)
      return
    }
    setUpdatingId(doc.id)
    try {
      await api.updateDocument(doc.id, { title: newName })
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, title: newName } : d))
    } catch (e: any) {
      setError(e.message || 'Gagal mengubah nama.')
    } finally {
      setRenamingId(null)
      setUpdatingId(null)
    }
  }

  async function handleCategoryChange(doc: Document, cat: DocCategory) {
    setUpdatingId(doc.id)
    try {
      await api.updateDocument(doc.id, { doc_type: cat })
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, doc_type: cat } : d))
    } catch (e: any) {
      setError(e.message || 'Gagal mengubah kategori.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleParse(doc: Document) {
    setParsing(doc.id)
    try {
      await api.parseDocument(doc.id)
      await load(true)
    } catch (e: any) {
      setError(e.message || 'Gagal memproses dokumen.')
    } finally {
      setParsing(null)
    }
  }

  const readyCount = docs.filter(d => d.parse_status === 'done').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dokumen Saya</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {user?.name ? user.name.split(' ')[0] + ' · ' : ''}
              {docs.length} dokumen{readyCount > 0 && <span className="text-emerald-600"> · {readyCount} siap digunakan</span>}
            </p>
          </div>
          <button
            onClick={() => { setShowUpload(v => !v); setError(null) }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Dokumen
          </button>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mb-4 px-4 py-3 rounded-lg text-sm border flex items-center justify-between ${
                error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <span>{error || success}</span>
              <button onClick={() => { setError(null); setSuccess(null) }} className="ml-3 opacity-50 hover:opacity-100">x</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload panel */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f) }}
                onClick={() => !uploading && fileRef.current?.click()}
                className={'bg-white border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-all ' + (dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300')}
              >
                <input
                  ref={fileRef} type="file" accept=".pdf,.ppt,.pptx" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-indigo-600 font-medium">Mengupload...</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-2">📤</div>
                    <p className="text-sm text-gray-700 font-medium">Drag and drop atau klik untuk pilih file</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, PPT, PPTX — maks. 20MB</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Table header */}
          {docs.length > 0 && !loading && (
            <div className="hidden md:grid grid-cols-[2fr_160px_130px_110px_160px] items-center px-5 py-3 border-b border-gray-100 bg-gray-50 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Dokumen</span>
              <span>Kategori</span>
              <span>Tanggal Upload</span>
              <span>Status</span>
              <span className="text-right">Aksi</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Memuat dokumen...</p>
            </div>
          ) : docs.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-gray-600 font-medium">Belum ada dokumen</p>
              <p className="text-sm text-gray-400 mt-1 mb-5">Upload dokumen skripsimu untuk mulai menggunakan fitur AI.</p>
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + Upload Pertama
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {docs.map((doc, i) => {
                const st = STATUS[doc.parse_status] ?? STATUS.pending
                const canUse = doc.parse_status === 'done'
                const catKey = (doc.doc_type || 'other') as DocCategory
                const cat = CATEGORIES[catKey] || CATEGORIES.other
                const isRenaming = renamingId === doc.id
                const isUpdating = updatingId === doc.id

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className={'px-5 py-4 hover:bg-gray-50/80 transition-colors ' + (isUpdating ? 'opacity-60' : '')}
                  >
                    {/* Desktop layout */}
                    <div className="hidden md:grid grid-cols-[2fr_160px_130px_110px_160px] items-center gap-4">
                      {/* Doc name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl flex-shrink-0">{fileIcon(doc.file_type)}</span>
                        <div className="min-w-0">
                          {isRenaming ? (
                            <input
                              ref={renameRef}
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onBlur={() => commitRename(doc)}
                              onKeyDown={e => { if (e.key === 'Enter') commitRename(doc); if (e.key === 'Escape') setRenamingId(null) }}
                              className="w-full text-sm font-medium text-gray-900 border border-indigo-400 rounded px-2 py-0.5 outline-none"
                            />
                          ) : (
                            <p
                              className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                              title="Double-click untuk rename"
                              onDoubleClick={() => startRename(doc)}
                            >
                              {doc.title || doc.file_name}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {doc.file_name}{doc.file_size_bytes ? ' · ' + fmtSize(doc.file_size_bytes) : ''}
                          </p>
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <select
                          value={catKey}
                          onChange={e => handleCategoryChange(doc, e.target.value as DocCategory)}
                          disabled={isUpdating}
                          className={'text-xs px-2 py-1.5 rounded-lg border w-full outline-none cursor-pointer focus:ring-1 focus:ring-indigo-400 disabled:opacity-50 ' + cat.color}
                        >
                          {Object.entries(CATEGORIES).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Date */}
                      <div>
                        <p className="text-xs text-gray-600">{fmtDate(doc.created_at)}</p>
                      </div>

                      {/* Status */}
                      <div>
                        <span className={'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ' + st.cls}>
                          <span className={'w-1.5 h-1.5 rounded-full flex-shrink-0 ' + st.dot} />
                          {st.label}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.parse_status === 'pending' && (
                          <button onClick={() => handleParse(doc)} disabled={parsing === doc.id} title="Proses" className="text-xs px-2 py-1.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50 transition-colors">
                            {parsing === doc.id ? '...' : 'Proses'}
                          </button>
                        )}
                        <Link href={canUse ? '/sessions?doc=' + doc.id : '#'} title="Simulasi"
                          className={'text-xs px-2 py-1.5 rounded-md border transition-colors ' + (canUse ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' : 'bg-gray-50 text-gray-300 border-gray-100 pointer-events-none')}>
                          🎤
                        </Link>
                        <Link href={canUse ? '/analysis?doc=' + doc.id : '#'} title="Analisa"
                          className={'text-xs px-2 py-1.5 rounded-md border transition-colors ' + (canUse ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-gray-50 text-gray-300 border-gray-100 pointer-events-none')}>
                          📊
                        </Link>
                        <Link href={canUse ? '/similarity?doc=' + doc.id : '#'} title="Plagiasi"
                          className={'text-xs px-2 py-1.5 rounded-md border transition-colors ' + (canUse ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-gray-50 text-gray-300 border-gray-100 pointer-events-none')}>
                          🔍
                        </Link>
                        <button onClick={() => startRename(doc)} title="Rename" className="text-xs px-2 py-1.5 rounded-md bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(doc)} disabled={deletingId === doc.id} title="Hapus" className="text-xs px-2 py-1.5 rounded-md bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 disabled:opacity-50 transition-colors">
                          {deletingId === doc.id ? '...' : '🗑'}
                        </button>
                      </div>
                    </div>

                    {/* Mobile layout */}
                    <div className="md:hidden flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5 flex-shrink-0">{fileIcon(doc.file_type)}</span>
                        <div className="min-w-0 flex-1">
                          {isRenaming ? (
                            <input
                              ref={renameRef}
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onBlur={() => commitRename(doc)}
                              onKeyDown={e => { if (e.key === 'Enter') commitRename(doc); if (e.key === 'Escape') setRenamingId(null) }}
                              className="w-full text-sm font-medium text-gray-900 border border-indigo-400 rounded px-2 py-1 outline-none"
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.title || doc.file_name}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">{doc.file_name} · {fmtDate(doc.created_at)}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ' + st.cls}>
                              <span className={'w-1.5 h-1.5 rounded-full ' + st.dot} />
                              {st.label}
                            </span>
                            <select
                              value={catKey}
                              onChange={e => handleCategoryChange(doc, e.target.value as DocCategory)}
                              className={'text-xs px-1.5 py-0.5 rounded border outline-none ' + cat.color}
                            >
                              {Object.entries(CATEGORIES).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {doc.parse_status === 'pending' && (
                          <button onClick={() => handleParse(doc)} disabled={parsing === doc.id} className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 disabled:opacity-50">
                            {parsing === doc.id ? '...' : 'Proses'}
                          </button>
                        )}
                        {canUse && <Link href={'/sessions?doc=' + doc.id} className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">🎤 Simulasi</Link>}
                        {canUse && <Link href={'/analysis?doc=' + doc.id} className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">📊 Analisa</Link>}
                        {canUse && <Link href={'/similarity?doc=' + doc.id} className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">🔍 Plagiasi</Link>}
                        <button onClick={() => startRename(doc)} className="text-xs px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-200">✏️</button>
                        <button onClick={() => handleDelete(doc)} disabled={deletingId === doc.id} className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-500 border border-red-100 disabled:opacity-50">
                          {deletingId === doc.id ? '...' : '🗑'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {docs.length > 0 && (
          <p className="mt-3 text-xs text-gray-400 px-1">
            Tip: Double-click nama dokumen untuk rename · Pilih kategori dari dropdown
          </p>
        )}
      </div>
    </div>
  )
}
