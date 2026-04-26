'use client'

import { useState } from 'react'
import Link from 'next/link'

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
