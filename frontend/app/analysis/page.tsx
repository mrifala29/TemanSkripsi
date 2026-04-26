'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'

type Analysis = {
  id: string
  document_id: string
  overall_score: number | null
  summary: string | null
  status: string
  created_at: string
}

type Score = {
  category: string
  score: number
  max_score: number
  feedback: string
}

function AnalysisContent() {
  const searchParams = useSearchParams()
  const docId = searchParams.get('doc')

  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selected, setSelected] = useState<Analysis | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    loadAnalyses()
  }, [])

  async function loadAnalyses() {
    setLoading(true)
    try {
      const res = await api.getAnalyses()
      const data = res.data || []
      setAnalyses(data)
      if (data.length > 0) setSelected(data[0])
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

  const scoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100
    if (pct >= 80) return 'text-emerald-600'
    if (pct >= 60) return 'text-amber-500'
    return 'text-red-500'
  }

  const scoreBar = (score: number, max: number) => {
    const pct = Math.round((score / max) * 100)
    const bg = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-500'
    return (
      <div className="w-full bg-gray-100 rounded-full h-2 mt-1.5">
        <div className={`${bg} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Analisa Skripsi</h1>
          <p className="text-gray-500 mt-1">Lihat skor dan feedback dari AI untuk dokumenmu</p>
        </div>
        {docId && (
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {analyzing ? 'Menganalisa...' : '🔍 Analisa Dokumen'}
          </button>
        )}
      </div>

      {!docId && analyses.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-500 mb-4">Belum ada analisa. Mulai dari halaman Dokumen.</p>
          <Link href="/documents" className="text-indigo-600 hover:underline text-sm">
            Pergi ke Dokumen →
          </Link>
        </div>
      )}

      {selected && (
        <div className="space-y-6">
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
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selected.status === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {selected.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(selected.created_at).toLocaleDateString('id-ID')}
                </p>
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
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">{s.category}</p>
                      <p className={`text-sm font-semibold ${scoreColor(s.score, s.max_score)}`}>
                        {s.score}/{s.max_score}
                      </p>
                    </div>
                    {scoreBar(s.score, s.max_score)}
                    {s.feedback && (
                      <p className="text-xs text-gray-400 mt-1">{s.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List of analyses */}
      {analyses.length > 1 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Riwayat Analisa</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {analyses.map(a => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${selected?.id === a.id ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-800">{a.id.slice(0, 8)}...</p>
                  <p className={`text-lg font-bold ${scoreColor(a.overall_score || 0, 100)}`}>
                    {a.overall_score ?? '—'}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(a.created_at).toLocaleDateString('id-ID')}
                </p>
              </button>
            ))}
          </div>
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
