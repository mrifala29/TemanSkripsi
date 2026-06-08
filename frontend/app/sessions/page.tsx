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

const DUMMY_SESSIONS = [
  {
    id: '1',
    document: 'Proposal Penelitian - Metode Pembelajaran Matematika',
    type: 'Sempro',
    date: '2026-06-06T15:30:00Z',
    duration: '35 menit',
    qa_count: 8,
    evaluation: 'Baik',
    summary: '8 pertanyaan dijawab dengan lancar. Metodologi jelas, latar belakang kuat.',
  },
  {
    id: '2',
    document: 'Laporan Akhir Skripsi - Pengaruh Media Digital',
    type: 'Sidang',
    date: '2026-06-02T10:00:00Z',
    duration: '52 menit',
    qa_count: 12,
    evaluation: 'Cukup',
    summary: '12 pertanyaan diajukan. Beberapa jawaban perlu pendalaman, terutama di BAB IV.',
  },
  {
    id: '3',
    document: 'Revisi Proposal Setelah Bimbingan',
    type: 'Sempro',
    date: '2026-05-28T14:15:00Z',
    duration: '28 menit',
    qa_count: 7,
    evaluation: 'Baik',
    summary: 'Revisi sudah sesuai saran dosen. Pertanyaan fokus pada timeline penelitian.',
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

export default function SessionsPage() {
  const [selectedDoc, setSelectedDoc] = useState<string>('')

  const filteredSessions = selectedDoc
    ? DUMMY_SESSIONS.filter((s) => s.document === DUMMY_DOCUMENTS.find((d) => d.id === selectedDoc)?.title)
    : DUMMY_SESSIONS

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
              <span>🎤</span>
              Simulasi Sidang
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Latihan sidang dengan AI dosen penguji - Sempro & Sidang Akhir
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
                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
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
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                    <span>🚀</span>
                    Mulai Simulasi Baru
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Gunakan <strong>1 kredit Sempro/Sidang</strong>
                  </p>
                </motion.div>
              )}

              {!selectedDoc && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 text-center">
                    💡 Pilih dokumen untuk mulai simulasi
                  </p>
                </div>
              )}
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
                <h2 className="text-lg font-bold text-gray-900">📊 Riwayat Simulasi</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {filteredSessions.length} sesi simulasi{' '}
                  {selectedDoc && `untuk dokumen terpilih`}
                </p>
              </div>

              <div className="overflow-x-auto">
                {filteredSessions.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <span className="text-6xl block mb-4">🎤</span>
                    <p className="text-gray-600 font-medium mb-2">Belum ada riwayat simulasi</p>
                    <p className="text-sm text-gray-500">
                      {selectedDoc
                        ? 'Dokumen ini belum pernah disimulasikan'
                        : 'Pilih dokumen dan mulai simulasi pertamamu'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredSessions.map((session) => (
                      <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{session.document}</h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  session.type === 'Sempro'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                {session.type}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {session.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                  />
                                </svg>
                                {session.qa_count} tanya-jawab
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {formatDate(session.date)}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                              session.evaluation === 'Baik'
                                ? 'bg-emerald-100 text-emerald-700'
                                : session.evaluation === 'Cukup'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {session.evaluation}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-700 leading-relaxed">{session.summary}</p>
                        </div>

                        <div className="flex gap-2">
                          <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                            📄 Lihat Transkrip
                          </button>
                          <button className="text-sm font-semibold text-gray-600 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            🔄 Ulangi Simulasi
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
