'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import Link from 'next/link'

type Analysis = {
  id: string
  document_id: string
  overall_score: number | null
  summary: string | null
  status: string
  created_at: string
  analysis_type: 'proposal' | 'final_report' | null
}

type Score = {
  category: string
  score: number
  max_score: number
  feedback: string
}

type Document = {
  id: string
  file_name: string
  title: string | null
  parse_status: string
  document_type: 'proposal' | 'final_report' | null
}

const PROPOSAL_LABELS: Record<string, string> = {
  latar_belakang: 'Latar Belakang',
  rumusan_masalah: 'Rumusan Masalah',
  tujuan: 'Tujuan Penelitian',
  metode_penelitian: 'Metode Penelitian',
  daftar_pustaka: 'Daftar Pustaka',
}

const LAPORAN_LABELS: Record<string, string> = {
  abstrak: 'Abstrak',
  latar_belakang: 'Latar Belakang',
  rumusan_masalah: 'Rumusan Masalah',
  tujuan: 'Tujuan Penelitian',
  metode_penelitian: 'Metode Penelitian',
  hasil_dan_pembahasan: 'Hasil dan Pembahasan',
  kesimpulan_saran: 'Kesimpulan & Saran',
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
      <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">📊 Analisa Skripsi</h1>
        <p className="text-gray-500 mt-1">Pilih dokumen untuk melihat atau menjalankan analisa AI.</p>
      </div>
      {docs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-gray-600 font-medium">Belum ada dokumen yang siap</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Upload dan proses dokumen terlebih dahulu.</p>
          <Link href="/documents" className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
            + Upload Dokumen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc, i) => (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/analysis?doc=${doc.id}`)}
              className="w-full text-left bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-xl px-5 py-4 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📄</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{doc.title || doc.file_name}</p>
                  {doc.title && <p className="text-xs text-gray-400 truncate mt-0.5">{doc.file_name}</p>}
                </div>
                <span className="text-emerald-400 group-hover:text-emerald-600 transition-colors flex-shrink-0">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

function AnalysisContent() {
  const searchParams = useSearchParams()
  const docId = searchParams.get('doc')

  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selected, setSelected] = useState<Analysis | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (!docId) { setLoading(false); return }
    loadAnalyses()
  }, [docId])

  async function loadAnalyses() {
    setLoading(true)
    try {
      // Fetch document info for type detection
      try {
        const docRes = await api.getDocuments()
        const docData: Document[] = docRes.data || []
        const found = docData.find(d => d.id === docId) || null
        setDoc(found)
      } catch { /* non-critical */ }

      const res = await api.getAnalyses()
      const data: Analysis[] = res.data || []
      const filtered = docId ? data.filter(a => a.document_id === docId) : data
      setAnalyses(filtered)
      if (filtered.length > 0) {
        const first = filtered[0]
        setSelected(first)
        // Fetch scores for this analysis
        try {
          const sRes = await (api as any).getAnalysisScores?.(first.id)
          if (sRes?.data) setScores(sRes.data)
        } catch { /* scores endpoint may not exist yet */ }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function runAnalysis() {
    if (!docId) return
    setAnalyzing(true)
    try {
      await api.analyzeDocument(docId)
      await loadAnalyses()
    } catch (e) {
      console.error(e)
    } finally {
      setAnalyzing(false)
    }
  }

  const getAspectLabel = (category: string) => {
    const docType = selected?.analysis_type || doc?.document_type
    if (docType === 'proposal') return PROPOSAL_LABELS[category] || category
    if (docType === 'final_report') return LAPORAN_LABELS[category] || category
    // Fallback: check both maps
    return PROPOSAL_LABELS[category] || LAPORAN_LABELS[category] || category
  }

  const scoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100
    if (pct >= 80) return 'text-emerald-600'
    if (pct >= 60) return 'text-amber-500'
    return 'text-red-500'
  }

  const scoreBg = (score: number, max: number) => {
    const pct = Math.round((score / max) * 100)
    return pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-500'
  }

  // No docId → document picker
  if (!docId && !loading) return <DocumentPicker />
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Analisa Skripsi</h1>
          <p className="text-gray-500 mt-1 text-sm">Skor dan feedback AI untuk dokumenmu</p>
        </div>
        <div className="flex gap-2">
          <Link href="/analysis" className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors">
            ← Pilih Dokumen
          </Link>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {analyzing ? '⏳ Menganalisa...' : '🔍 Analisa Sekarang'}
          </button>
        </div>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600 font-medium">Belum ada analisa</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Klik "Analisa Sekarang" untuk mulai.</p>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {analyzing ? '⏳ Menganalisa...' : '🔍 Mulai Analisa'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Multi-analysis selector */}
          {analyses.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {analyses.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    selected?.id === a.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  Analisa #{i + 1} · {new Date(a.created_at).toLocaleDateString('id-ID')}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <>
              {/* Overall score */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Skor Keseluruhan</p>
                    <p className={`text-5xl font-bold mt-1 ${scoreColor(selected.overall_score || 0, 100)}`}>
                      {selected.overall_score ?? '—'}
                      <span className="text-xl text-gray-400">/100</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {(() => {
                      const docType = selected.analysis_type || doc?.document_type
                      if (docType === 'proposal') return (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">Proposal</span>
                      )
                      if (docType === 'final_report') return (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">Laporan Akhir</span>
                      )
                      return null
                    })()
                    }
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${
                      selected.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {selected.status === 'done' ? '✅ Selesai' : '⏳ ' + selected.status}
                    </span>
                  </div>
                </div>
                {selected.summary && (
                  <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-4 leading-relaxed border border-gray-100">
                    {selected.summary}
                  </p>
                )}
              </div>

              {/* Score breakdown */}
              {scores.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-900 mb-4">Rincian Skor</h2>
                  <div className="space-y-4">
                    {scores.map((s, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-gray-700">{getAspectLabel(s.category)}</p>
                          <p className={`text-sm font-semibold ${scoreColor(s.score, s.max_score)}`}>
                            {s.score}/{s.max_score}
                          </p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`${scoreBg(s.score, s.max_score)} h-2 rounded-full transition-all`}
                            style={{ width: `${Math.round((s.score / s.max_score) * 100)}%` }} />
                        </div>
                        {s.feedback && <p className="text-xs text-gray-400 mt-1">{s.feedback}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.status === 'processing' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-center">
                  ⏳ Analisa sedang diproses. Halaman akan diperbarui otomatis.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 p-8">Loading...</div>}>
      <AnalysisContent />
    </Suspense>
  )
}
