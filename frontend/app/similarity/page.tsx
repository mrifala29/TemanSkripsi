'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'

type Document = {
  id: string
  file_name: string
  title: string | null
  parse_status: string
}

type TypoDetail = {
  typo: string
  correction: string
  page: number
  line: number
  context: string
}

type TypoCheck = {
  total_typos_detected: number
  typo_categories: {
    spelling_errors: number
    grammatical_errors: number
    punctuation_errors: number
  }
  typos_with_location: TypoDetail[]
}

type SimilarityCheck = {
  id: string
  document_id: string
  similarity_score: number | null
  status: string
  created_at: string
  chapters?: Array<{ name: string; similarity: number }>
  typo_check?: TypoCheck | null
}

function colorFor(val: number, thresholds: [number, number]) {
  if (val <= thresholds[0]) return 'bg-emerald-500'
  if (val <= thresholds[1]) return 'bg-amber-400'
  return 'bg-red-500'
}

function badgeFor(val: number, thresholds: [number, number]) {
  if (val <= thresholds[0]) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (val <= thresholds[1]) return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-red-700 bg-red-50 border-red-200'
}

function DocumentPicker() {
  const router = useRouter()
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDocuments()
      .then(res => setDocs((res.data || []).filter((d: Document) => d.parse_status === 'done')))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🔍 Cek Kesamaan & Typo</h1>
        <p className="text-gray-500 mt-1">Pilih dokumen untuk mengecek kemiripan teks dan deteksi typo.</p>
      </div>
      {docs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-gray-600 font-medium">Belum ada dokumen yang siap</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Upload dan proses dokumen terlebih dahulu.</p>
          <Link href="/documents" className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
            + Upload Dokumen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc, i) => (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/similarity?doc=${doc.id}`)}
              className="w-full text-left bg-white border border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 rounded-xl px-5 py-4 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📄</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{doc.title || doc.file_name}</p>
                  {doc.title && <p className="text-xs text-gray-400 truncate mt-0.5">{doc.file_name}</p>}
                </div>
                <span className="text-amber-400 group-hover:text-amber-600 transition-colors flex-shrink-0">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

function SimilarityContent() {
  const searchParams = useSearchParams()
  const docId = searchParams.get('doc')

  const [checks, setChecks] = useState<SimilarityCheck[]>([])
  const [selected, setSelected] = useState<SimilarityCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!docId) { setLoading(false); return }
    loadChecks()
  }, [docId])

  async function loadChecks() {
    setLoading(true)
    try {
      const res = await api.getSimilarityChecks()
      const data: SimilarityCheck[] = (res.data || []).filter((c: SimilarityCheck) => c.document_id === docId)
      setChecks(data)
      if (data.length > 0) setSelected(data[0])
    } catch {
      setError('Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }

  async function runCheck() {
    if (!docId) return
    setChecking(true)
    setError(null)
    try {
      await api.checkSimilarity(docId)
      await loadChecks()
    } catch (e: any) {
      setError(e.message || 'Gagal menjalankan pengecekan.')
    } finally {
      setChecking(false)
    }
  }

  if (!docId && !loading) return <DocumentPicker />
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔍 Cek Kesamaan & Typo</h1>
          <p className="text-gray-500 mt-1 text-sm">Estimasi kemiripan teks dan deteksi typo</p>
        </div>
        <div className="flex gap-2">
          <Link href="/similarity" className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors">
            ← Pilih Dokumen
          </Link>
          <button
            onClick={runCheck}
            disabled={checking}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {checking ? '⏳ Memeriksa...' : '🔍 Cek Sekarang'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>
      )}

      {checks.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-600 font-medium">Belum ada hasil pengecekan</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Klik "Cek Sekarang" untuk mulai.</p>
          <button
            onClick={runCheck}
            disabled={checking}
            className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {checking ? '⏳ Memeriksa...' : '🔍 Mulai Pengecekan'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">

          {checks.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {checks.map((c, i) => (
                <button key={c.id} onClick={() => setSelected(c)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    selected?.id === c.id ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                  }`}
                >
                  Cek #{i + 1} · {new Date(c.created_at).toLocaleDateString('id-ID')}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <>
              {/* Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
                  <p className={`text-5xl font-bold ${
                    (selected.similarity_score ?? 0) <= 20 ? 'text-emerald-600' :
                    (selected.similarity_score ?? 0) <= 35 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {selected.similarity_score != null ? `${selected.similarity_score}%` : '—'}
                  </p>
                  <p className="mt-1.5 text-sm text-gray-500">Estimasi Kemiripan</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
                  <p className={`text-5xl font-bold ${
                    !selected.typo_check ? 'text-gray-400' :
                    selected.typo_check.total_typos_detected === 0 ? 'text-emerald-600' :
                    selected.typo_check.total_typos_detected <= 10 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {selected.typo_check != null ? selected.typo_check.total_typos_detected : '—'}
                  </p>
                  <p className="mt-1.5 text-sm text-gray-500">Typo Terdeteksi</p>
                  {selected.typo_check && (
                    <p className="text-xs text-gray-400 mt-1">
                      {selected.typo_check.typo_categories.spelling_errors} ejaan · {selected.typo_check.typo_categories.grammatical_errors} tata bahasa · {selected.typo_check.typo_categories.punctuation_errors} tanda baca
                    </p>
                  )}
                </div>
              </div>

              {/* Per-chapter breakdown if available */}
              {selected.chapters && selected.chapters.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Rincian Per Bab</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {selected.chapters.map((ch) => (
                      <div key={ch.name} className="px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-800">{ch.name}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeFor(ch.similarity, [15, 30])}`}>
                            {ch.similarity}% mirip
                          </span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${colorFor(ch.similarity, [15, 30])}`} style={{ width: `${ch.similarity}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Typo report */}
              {selected.typo_check && selected.typo_check.typos_with_location.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">✏️ Daftar Typo</h2>
                    <span className="text-xs text-gray-400">{selected.typo_check.total_typos_detected} typo ditemukan</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs text-gray-500 text-left">
                          <th className="px-6 py-3 font-medium">Typo</th>
                          <th className="px-4 py-3 font-medium">Koreksi</th>
                          <th className="px-4 py-3 font-medium">Hal.</th>
                          <th className="px-4 py-3 font-medium">Baris</th>
                          <th className="px-4 py-3 font-medium">Konteks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selected.typo_check.typos_with_location.map((t, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 font-medium text-red-600">{t.typo}</td>
                            <td className="px-4 py-3 text-emerald-700">{t.correction}</td>
                            <td className="px-4 py-3 text-gray-500">{t.page}</td>
                            <td className="px-4 py-3 text-gray-500">{t.line}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{t.context}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selected.status === 'processing' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-center">
                  ⏳ Pengecekan sedang diproses oleh AI.
                </div>
              )}

              <p className="text-xs text-gray-400 text-center">
                ⚠️ Hasil merupakan estimasi internal. Bukan setara dengan Turnitin atau alat plagiasi profesional.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function SimilarityPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 p-8">Loading...</div>}>
      <SimilarityContent />
    </Suspense>
  )
}
