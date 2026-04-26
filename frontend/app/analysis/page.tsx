'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

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

const STEPS = [
  { num: '01', icon: '📤', title: 'Upload Skripsi', desc: 'Upload PDF skripsimu ke sistem' },
  { num: '02', icon: '🔍', title: 'AI Membaca', desc: 'AI menganalisis seluruh konten dokumen' },
  { num: '03', icon: '📊', title: 'Penilaian per Aspek', desc: 'Skor per aspek: metode, data, analisis, dst.' },
  { num: '04', icon: '💡', title: 'Feedback Detail', desc: 'Terima saran spesifik untuk perbaikan' },
]

const DEMO_SCORES = [
  { label: 'Metode Penelitian', score: 82, color: 'bg-emerald-500' },
  { label: 'Kajian Pustaka', score: 75, color: 'bg-indigo-500' },
  { label: 'Analisis Data', score: 68, color: 'bg-amber-400' },
  { label: 'Penarikan Kesimpulan', score: 85, color: 'bg-emerald-500' },
  { label: 'Orisinalitas', score: 79, color: 'bg-indigo-400' },
]

function AnalysisLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 pt-16 pb-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
              Analisa Skripsi
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Analisa Mendalam<br />
              <span className="text-emerald-200">Skripsimu dengan AI</span>
            </h1>
            <p className="text-emerald-100 text-base mb-8 leading-relaxed max-w-lg">
              Dapatkan skor per aspek dan feedback spesifik untuk setiap bagian skripsimu — metode, kajian pustaka, analisis data, hingga kesimpulan.
            </p>
            <Link href="/auth/login" className="inline-block bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-all hover:scale-105 shadow-lg">
              📊 Analisa Skripsimu Sekarang
            </Link>
          </div>
          <div className="flex-shrink-0 w-44 lg:w-52 opacity-90">
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <Image src="/mascot.png" alt="Maskot" width={260} height={260} className="w-full drop-shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Cara Kerja Analisa</h2>
            <p className="text-gray-500">Dari upload sampai feedback dalam hitungan menit</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-emerald-100" />
            {STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center relative">
                <div className="w-16 h-16 bg-white border-2 border-emerald-200 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 gap-0.5 relative z-10 shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-emerald-600 font-bold text-xs">{s.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Score Card */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Dokumenmu</h2>
            <p className="text-gray-400 text-sm">Dapatkan laporan analisa dalam hitungan menit</p>
          </div>

          {/* Upload Form */}
          <form className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Dokumen Skripsi</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-emerald-300 transition-colors">
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm text-gray-500 mb-4">PDF atau PPTX — maks. 20 MB</p>
              <label
                htmlFor="file-upload-analysis"
                className="cursor-pointer inline-block bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Pilih File
              </label>
              <input
                type="file"
                id="file-upload-analysis"
                accept=".pdf,.ppt,.pptx"
                className="hidden"
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-base font-semibold py-3 rounded-xl transition-colors"
            >
              Analisa Sekarang
            </button>
          </form>

          {/* Results Demo */}
          <div className="text-center mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Contoh Hasil Analisa</h3>
            <p className="text-gray-400 text-sm">Skor per aspek dan feedback detail seperti ini</p>
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Laporan Analisa Skripsi</p>
                <p className="text-emerald-100 text-xs mt-0.5">Analisis AI · 5 aspek</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-extrabold text-white">78</p>
                <p className="text-emerald-200 text-xs">/ 100</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {DEMO_SCORES.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm text-gray-700">{s.label}</p>
                    <p className="text-sm font-bold text-gray-900">{s.score}<span className="text-gray-400 font-normal">/100</span></p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.score}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 + 0.2, duration: 0.6 }}
                      className={`${s.color} h-2 rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <Link href="/auth/login" className="block text-center bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors">
                Lihat Analisa Lengkap →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-10 shadow-xl shadow-emerald-200">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-2xl font-bold text-white mb-3">Tahu seberapa siap skripsimu?</h2>
          <p className="text-emerald-100 text-sm mb-6">Upload dan dapatkan laporan analisa lengkap dengan skor dan feedback AI.</p>
          <Link href="/auth/login" className="inline-block bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-all hover:scale-105">
            Mulai Analisa →
          </Link>
        </motion.div>
      </section>

      <footer className="py-6 px-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2026 TemanSkripsi · <Link href="/" className="hover:text-emerald-600">Kembali ke Beranda</Link></p>
      </footer>
    </div>
  )
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

  if (!loading && !docId && analyses.length === 0) return <AnalysisLanding />

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
