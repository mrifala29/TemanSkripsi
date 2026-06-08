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

const DUMMY_CHECKS = [
  {
    id: '1',
    document: 'Proposal Penelitian - Metode Pembelajaran Matematika',
    date: '2026-06-04T09:10:00Z',
    ai_percentage: 12,
    total_typos: 5,
    highest_chapter: 'BAB II (18%)',
    trend: 'down', // down = improvement
    summary: 'Deteksi AI menurun dari 18% menjadi 12%. Typo berkurang dari 12 ke 5.',
  },
  {
    id: '2',
    document: 'Laporan Akhir Skripsi - Pengaruh Media Digital',
    date: '2026-05-30T14:25:00Z',
    ai_percentage: 8,
    total_typos: 3,
    highest_chapter: 'BAB I (14%)',
    trend: 'same',
    summary: 'Tingkat deteksi AI sangat rendah (8%). Hanya 3 typo minor ditemukan.',
  },
  {
    id: '3',
    document: 'Revisi Proposal Setelah Bimbingan',
    date: '2026-05-25T11:40:00Z',
    ai_percentage: 25,
    total_typos: 15,
    highest_chapter: 'BAB III (42%)',
    trend: 'up',
    summary: 'Deteksi AI cukup tinggi di BAB III. Perlu review manual. 15 typo perlu diperbaiki.',
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

export default function SimilarityPage() {
  const [selectedDoc, setSelectedDoc] = useState<string>('')

  const filteredChecks = selectedDoc
    ? DUMMY_CHECKS.filter((c) => c.document === DUMMY_DOCUMENTS.find((d) => d.id === selectedDoc)?.title)
    : DUMMY_CHECKS

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
              <span>🔍</span>
              Cek Tulisan AI & Typo
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Deteksi indikasi tulisan AI per bab + identifikasi typo dengan lokasi spesifik
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
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
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
                  <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                    <span>🔍</span>
                    Cek Sekarang
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Gunakan <strong>1 kredit Kesamaan</strong>
                  </p>
                </motion.div>
              )}

              {!selectedDoc && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 text-center">
                    💡 Pilih dokumen untuk cek tulisan AI & typo
                  </p>
                </div>
              )}

              {/* Info Card */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-semibold text-blue-900 mb-2">ℹ️ Yang Dicek:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• % AI per bab (transparan)</li>
                  <li>• Kalimat terdeteksi AI</li>
                  <li>• Typo: spelling, grammar, punctuation</li>
                  <li>• Lokasi: halaman + baris</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-800">
                  ⚠️ <strong>Disclaimer:</strong> Hasil deteksi AI adalah estimasi berbasis LLM, bukan bukti mutlak.
                </p>
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
                <h2 className="text-lg font-bold text-gray-900">📊 Riwayat Pengecekan</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {filteredChecks.length} pengecekan tersimpan{' '}
                  {selectedDoc && `untuk dokumen terpilih`}
                </p>
              </div>

              <div className="overflow-x-auto">
                {filteredChecks.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <span className="text-6xl block mb-4">🔍</span>
                    <p className="text-gray-600 font-medium mb-2">Belum ada riwayat pengecekan</p>
                    <p className="text-sm text-gray-500">
                      {selectedDoc
                        ? 'Dokumen ini belum pernah dicek'
                        : 'Pilih dokumen dan mulai pengecekan pertamamu'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredChecks.map((check) => (
                      <div key={check.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{check.document}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {formatDate(check.date)}
                            </div>
                          </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          {/* AI Percentage */}
                          <div
                            className={`rounded-lg p-4 border-2 ${
                              check.ai_percentage <= 15
                                ? 'bg-emerald-50 border-emerald-200'
                                : check.ai_percentage <= 30
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold text-gray-600">% AI Overall</p>
                              {check.trend === 'down' && (
                                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              {check.trend === 'up' && (
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <p
                              className={`text-3xl font-black ${
                                check.ai_percentage <= 15
                                  ? 'text-emerald-600'
                                  : check.ai_percentage <= 30
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {check.ai_percentage}%
                            </p>
                          </div>

                          {/* Total Typos */}
                          <div
                            className={`rounded-lg p-4 border-2 ${
                              check.total_typos === 0
                                ? 'bg-emerald-50 border-emerald-200'
                                : check.total_typos <= 10
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <p className="text-xs font-semibold text-gray-600 mb-1">Total Typo</p>
                            <p
                              className={`text-3xl font-black ${
                                check.total_typos === 0
                                  ? 'text-emerald-600'
                                  : check.total_typos <= 10
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {check.total_typos}
                            </p>
                          </div>

                          {/* Highest Chapter */}
                          <div className="rounded-lg p-4 border-2 bg-blue-50 border-blue-200">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Bab Tertinggi AI</p>
                            <p className="text-sm font-bold text-blue-700">{check.highest_chapter}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-700 leading-relaxed">{check.summary}</p>
                        </div>

                        <div className="flex gap-2">
                          <button className="text-sm font-semibold text-amber-600 hover:text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                            📄 Lihat Detail Per Bab
                          </button>
                          <button className="text-sm font-semibold text-gray-600 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            📋 Daftar Typo Lengkap
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
