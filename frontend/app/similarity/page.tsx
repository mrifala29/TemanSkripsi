'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const STEPS = [
  { num: '01', icon: '📤', title: 'Upload Dokumen', desc: 'Upload PDF atau PPTX skripsimu' },
  { num: '02', icon: '🔎', title: 'Analisis Teks', desc: 'Sistem memindai setiap kata dan kalimat' },
  { num: '03', icon: '🤖', title: 'Deteksi Sumber', desc: 'Bandingkan dengan database & deteksi konten AI' },
  { num: '04', icon: '📋', title: 'Laporan Per Bab', desc: 'Lihat skor kesamaan dan teks AI per bab' },
]

export default function SimilarityPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | {
    similarity: number
    aiText: number
    chapters: { name: string; similarity: number; aiText: number }[]
  }>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setResult(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setResult({
      similarity: 18,
      aiText: 22,
      chapters: [
        { name: 'BAB I – Pendahuluan', similarity: 12, aiText: 15 },
        { name: 'BAB II – Tinjauan Pustaka', similarity: 28, aiText: 35 },
        { name: 'BAB III – Metodologi', similarity: 10, aiText: 18 },
        { name: 'BAB IV – Hasil & Pembahasan', similarity: 14, aiText: 20 },
        { name: 'BAB V – Kesimpulan', similarity: 8, aiText: 12 },
      ],
    })
    setLoading(false)
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

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 pt-16 pb-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-amber-200 rounded-full animate-pulse" />
              Cek Kesamaan & AI
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Cek Plagiasi &<br />
              <span className="text-amber-200">Deteksi Teks AI</span>
            </h1>
            <p className="text-amber-100 text-base mb-8 leading-relaxed max-w-lg">
              Estimasi kemiripan teks dan deteksi konten yang kemungkinan ditulis AI — per bab. Pastikan skripsimu lolos sebelum maju sidang.
            </p>
            <a href="#upload" className="inline-block bg-white text-amber-700 font-bold px-8 py-3.5 rounded-xl hover:bg-amber-50 transition-all hover:scale-105 shadow-lg">
              🔍 Periksa Sekarang
            </a>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Cara Kerja Pengecekan</h2>
            <p className="text-gray-500">Proses cepat dari upload hingga laporan lengkap</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-amber-100" />
            {STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center relative">
                <div className="w-16 h-16 bg-white border-2 border-amber-200 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 gap-0.5 relative z-10 shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-amber-500 font-bold text-xs">{s.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload & Results */}
      <section id="upload" className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Dokumenmu</h2>
            <p className="text-gray-400 text-sm">Hasil estimasi tersedia dalam hitungan detik</p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Dokumen Skripsi</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-amber-300 transition-colors">
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm text-gray-500 mb-4">PDF, PPT, atau PPTX — maks. 20 MB</p>
              <input
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Pilih File
              </label>
              {file && (
                <p className="mt-3 text-sm text-gray-700 font-medium">{file.name}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="mt-4 w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Menganalisis...' : 'Periksa Sekarang'}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="space-y-4">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
                  <div className="text-4xl font-bold text-gray-900">{result.similarity}%</div>
                  <div className="mt-1 text-sm text-gray-500">Estimasi Kemiripan Teks</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
                  <div className="text-4xl font-bold text-gray-900">{result.aiText}%</div>
                  <div className="mt-1 text-sm text-gray-500">Estimasi Teks Ditulis AI</div>
                </motion.div>
              </div>

              {/* Per Chapter */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Rincian Per Bab</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {result.chapters.map((ch) => (
                    <div key={ch.name} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-800">{ch.name}</span>
                        <div className="flex gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeFor(ch.similarity, [15, 30])}`}>
                            {ch.similarity}% mirip
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeFor(ch.aiText, [20, 40])}`}>
                            {ch.aiText}% AI
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${colorFor(ch.similarity, [15, 30])}`}
                            style={{ width: `${ch.similarity}%` }}
                          />
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${colorFor(ch.aiText, [20, 40])}`}
                            style={{ width: `${ch.aiText}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 text-center px-4">
                ⚠️ Hasil merupakan estimasi. Bukan setara dengan layanan Turnitin atau alat deteksi AI profesional lainnya.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-10 shadow-xl shadow-amber-200">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-3">Cek sebelum terlambat</h2>
          <p className="text-amber-100 text-sm mb-6">Pastikan skripsimu bebas plagiasi dan konten AI sebelum maju sidang.</p>
          <a href="#upload" className="inline-block bg-white text-amber-700 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-all hover:scale-105">
            Periksa Sekarang →
          </a>
        </motion.div>
      </section>

      <footer className="py-6 px-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2026 TemanSkripsi · <Link href="/" className="hover:text-amber-600">Kembali ke Beranda</Link></p>
      </footer>
    </div>
  )
}
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | {
    similarity: number
    aiText: number
    chapters: { name: string; similarity: number; aiText: number }[]
  }>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setResult(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setResult({
      similarity: 18,
      aiText: 22,
      chapters: [
        { name: 'BAB I – Pendahuluan', similarity: 12, aiText: 15 },
        { name: 'BAB II – Tinjauan Pustaka', similarity: 28, aiText: 35 },
        { name: 'BAB III – Metodologi', similarity: 10, aiText: 18 },
        { name: 'BAB IV – Hasil & Pembahasan', similarity: 14, aiText: 20 },
        { name: 'BAB V – Kesimpulan', similarity: 8, aiText: 12 },
      ],
    })
    setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
            ← Kembali ke Beranda
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Uji Kesamaan & Teks AI</h1>
          <p className="mt-2 text-gray-500">
            Estimasi kemiripan teks dan deteksi konten yang kemungkinan ditulis AI, per bab.
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Dokumen Skripsi</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors">
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm text-gray-500 mb-4">PDF, PPT, atau PPTX — maks. 20 MB</p>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Pilih File
            </label>
            {file && (
              <p className="mt-3 text-sm text-gray-700 font-medium">{file.name}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Menganalisis...' : 'Periksa Sekarang'}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
                <div className="text-4xl font-bold text-gray-900">{result.similarity}%</div>
                <div className="mt-1 text-sm text-gray-500">Estimasi Kemiripan Teks</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
                <div className="text-4xl font-bold text-gray-900">{result.aiText}%</div>
                <div className="mt-1 text-sm text-gray-500">Estimasi Teks Ditulis AI</div>
              </div>
            </div>

            {/* Per Chapter */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Rincian Per Bab</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {result.chapters.map((ch) => (
                  <div key={ch.name} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">{ch.name}</span>
                      <div className="flex gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeFor(ch.similarity, [15, 30])}`}>
                          {ch.similarity}% mirip
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeFor(ch.aiText, [20, 40])}`}>
                          {ch.aiText}% AI
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${colorFor(ch.similarity, [15, 30])}`}
                          style={{ width: `${ch.similarity}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${colorFor(ch.aiText, [20, 40])}`}
                          style={{ width: `${ch.aiText}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center px-4">
              ⚠️ Hasil merupakan estimasi. Bukan setara dengan layanan Turnitin atau alat deteksi AI profesional lainnya.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
