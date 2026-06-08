'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

// DUMMY DATA
const DUMMY_DOCUMENTS = [
  {
    id: '1',
    title: 'Proposal Penelitian - Metode Pembelajaran Matematika',
    file_name: 'proposal-matematika.pdf',
    type: 'proposal',
    status: 'done',
  },
  {
    id: '2',
    title: 'Laporan Akhir Skripsi - Pengaruh Media Digital',
    file_name: 'laporan-akhir.pdf',
    type: 'final_report',
    status: 'done',
  },
  {
    id: '4',
    title: 'Revisi Proposal Setelah Bimbingan',
    file_name: 'revisi-proposal-v2.pdf',
    type: 'proposal',
    status: 'done',
  },
]

const DUMMY_ANALYSES = [
  {
    id: '1',
    document: 'Laporan Akhir Skripsi - Pengaruh Media Digital',
    type: 'Sidang',
    date: '2026-06-05T11:20:00Z',
    overall_score: 82,
    best_aspect: 'Metode Penelitian (92/100)',
    worst_aspect: 'Hasil dan Pembahasan (68/100)',
    trend: 'up', // up, down, same
    summary: 'Skor meningkat 7 poin dari analisa sebelumnya. Metodologi sangat kuat, perlu perbaikan di BAB IV.',
  },
  {
    id: '2',
    document: 'Revisi Proposal Setelah Bimbingan',
    type: 'Sempro',
    date: '2026-06-03T14:30:00Z',
    overall_score: 75,
    best_aspect: 'Latar Belakang (85/100)',
    worst_aspect: 'Metode Penelitian (65/100)',
    trend: 'up',
    summary: 'Perbaikan signifikan di latar belakang. Metodologi perlu diperkuat dengan referensi tambahan.',
  },
  {
    id: '3',
    document: 'Proposal Penelitian - Metode Pembelajaran Matematika',
    type: 'Sempro',
    date: '2026-05-20T09:45:00Z',
    overall_score: 78,
    best_aspect: 'Rumusan Masalah (88/100)',
    worst_aspect: 'Daftar Pustaka (60/100)',
    trend: 'same',
    summary: 'Rumusan masalah jelas dan fokus. Referensi perlu lebih bervariasi dan up-to-date.',
  },
]

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function AnalysisPage() {
  const [selectedDoc, setSelectedDoc] = useState<string>('')

  const filteredAnalyses = selectedDoc
    ? DUMMY_ANALYSES.filter((a) => a.document === DUMMY_DOCUMENTS.find((d) => d.id === selectedDoc)?.title)
    : DUMMY_ANALYSES

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span>📊</span>
              Analisa Skripsi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Penilaian otomatis kualitas skripsi per aspek dengan feedback AI
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Dashboard
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Document Selector */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📂 Pilih Dokumen</h2>
              <div className="space-y-3">
                {DUMMY_DOCUMENTS.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedDoc === doc.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">📄</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{doc.title}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              doc.type === 'proposal'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {doc.type === 'proposal' ? 'Proposal' : 'Laporan'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedDoc && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                    <span>🔍</span>
                    Analisa Sekarang
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Gunakan <strong>1 kredit Sempro/Sidang</strong>
                  </p>
                </motion.div>
              )}

              {!selectedDoc && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 text-center">
                    💡 Pilih dokumen untuk mulai analisa
                  </p>
                </div>
              )}

              {/* Info Card */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-semibold text-blue-900 mb-2">📋 Aspek Penilaian:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Proposal: 5 aspek</li>
                  <li>• Laporan Akhir: 7 aspek</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Right: History Table */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">📊 Riwayat Analisa</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {filteredAnalyses.length} analisa tersimpan{' '}
                  {selectedDoc && `untuk dokumen terpilih`}
                </p>
              </div>

              <div className="overflow-x-auto">
                {filteredAnalyses.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <span className="text-6xl block mb-4">📊</span>
                    <p className="text-gray-600 font-medium mb-2">Belum ada riwayat analisa</p>
                    <p className="text-sm text-gray-500">
                      {selectedDoc
                        ? 'Dokumen ini belum pernah dianalisa'
                        : 'Pilih dokumen dan mulai analisa pertamamu'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredAnalyses.map((analysis) => (
                      <div key={analysis.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{analysis.document}</h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  analysis.type === 'Sempro'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                {analysis.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {formatDate(analysis.date)}
                            </div>
                          </div>

                          {/* Score Badge */}
                          <div className="flex-shrink-0 text-center">
                            <div
                              className={`text-3xl font-black mb-1 ${
                                analysis.overall_score >= 80
                                  ? 'text-emerald-600'
                                  : analysis.overall_score >= 60
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {analysis.overall_score}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">dari 100</span>
                              {analysis.trend === 'up' && (
                                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              {analysis.trend === 'down' && (
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Aspect Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <p className="text-xs text-emerald-700 font-semibold mb-1">✅ Aspek Terbaik</p>
                            <p className="text-sm font-bold text-emerald-900">{analysis.best_aspect}</p>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs text-red-700 font-semibold mb-1">⚠️ Perlu Perbaikan</p>
                            <p className="text-sm font-bold text-red-900">{analysis.worst_aspect}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
                        </div>

                        <div className="flex gap-2">
                          <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                            📄 Lihat Detail Lengkap
                          </button>
                          <button className="text-sm font-semibold text-gray-600 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            📥 Download Laporan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
