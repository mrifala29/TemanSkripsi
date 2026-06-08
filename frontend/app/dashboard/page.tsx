'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

// DUMMY DATA
const DUMMY_CREDITS = {
  sempro_simulasi: 3,
  sempro_analisa: 2,
  sidang_simulasi: 5,
  sidang_analisa: 4,
  kesamaan: 8,
}

const DUMMY_DOCUMENTS = [
  {
    id: '1',
    title: 'Proposal Penelitian - Metode Pembelajaran Matematika',
    file_name: 'proposal-matematika.pdf',
    type: 'proposal',
    status: 'done',
    uploaded_at: '2026-06-05T10:30:00Z',
  },
  {
    id: '2',
    title: 'Laporan Akhir Skripsi - Pengaruh Media Digital',
    file_name: 'laporan-akhir.pdf',
    type: 'final_report',
    status: 'done',
    uploaded_at: '2026-06-03T14:20:00Z',
  },
  {
    id: '3',
    title: 'Draft BAB III Metodologi Penelitian',
    file_name: 'draft-bab3.pdf',
    type: 'proposal',
    status: 'processing',
    uploaded_at: '2026-06-07T09:15:00Z',
  },
  {
    id: '4',
    title: 'Revisi Proposal Setelah Bimbingan',
    file_name: 'revisi-proposal-v2.pdf',
    type: 'proposal',
    status: 'done',
    uploaded_at: '2026-06-01T16:45:00Z',
  },
]

const DUMMY_HISTORY = [
  {
    no: 1,
    document: 'Proposal Penelitian - Metode Pembelajaran Matematika',
    feature: 'Simulasi Sidang',
    type: 'Sempro',
    date: '2026-06-06T15:30:00Z',
    result: 'Baik - 8 pertanyaan dijawab dengan lancar',
  },
  {
    no: 2,
    document: 'Laporan Akhir Skripsi - Pengaruh Media Digital',
    feature: 'Analisa Skripsi',
    type: 'Sidang',
    date: '2026-06-05T11:20:00Z',
    result: 'Skor: 82/100 - Perlu perbaikan di BAB IV',
  },
  {
    no: 3,
    document: 'Proposal Penelitian - Metode Pembelajaran Matematika',
    feature: 'Cek Kesamaan',
    type: '-',
    date: '2026-06-04T09:10:00Z',
    result: '12% AI Detection, 5 Typo ditemukan',
  },
  {
    no: 4,
    document: 'Revisi Proposal Setelah Bimbingan',
    feature: 'Analisa Skripsi',
    type: 'Sempro',
    date: '2026-06-03T14:30:00Z',
    result: 'Skor: 75/100 - Metodologi perlu diperkuat',
  },
  {
    no: 5,
    document: 'Laporan Akhir Skripsi - Pengaruh Media Digital',
    feature: 'Simulasi Sidang',
    type: 'Sidang',
    date: '2026-06-02T10:00:00Z',
    result: 'Cukup - 12 pertanyaan, beberapa perlu pendalaman',
  },
]

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  done: { label: 'Siap', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  processing: { label: 'Diproses', className: 'bg-blue-100 text-blue-700 border-blue-300' },
  pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  failed: { label: 'Gagal', className: 'bg-red-100 text-red-700 border-red-300' },
}

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

function formatDateShort(dateStr: string) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'simulasi' | 'analisa' | 'kesamaan'>('all')

  const filteredHistory = DUMMY_HISTORY.filter((item) => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'simulasi') return item.feature === 'Simulasi Sidang'
    if (selectedTab === 'analisa') return item.feature === 'Analisa Skripsi'
    if (selectedTab === 'kesamaan') return item.feature === 'Cek Kesamaan'
    return true
  })

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Selamat datang kembali, Alfarizy!</p>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Dokumen
          </Link>
        </motion.div>

        {/* Credit Cards - Reference dari pricing page */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">💳 Kredit Tersedia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sempro - Simulasi */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-purple-100 rounded-xl p-3">
                  <span className="text-3xl">🎤</span>
                </div>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                  SEMPRO
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Simulasi Sidang</h3>
              <p className="text-3xl font-extrabold text-purple-600 mb-2">{DUMMY_CREDITS.sempro_simulasi}</p>
              <p className="text-xs text-gray-500">kredit tersisa</p>
            </div>

            {/* Sempro - Analisa */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-emerald-100 rounded-xl p-3">
                  <span className="text-3xl">📊</span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  SEMPRO
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Analisa Skripsi</h3>
              <p className="text-3xl font-extrabold text-emerald-600 mb-2">{DUMMY_CREDITS.sempro_analisa}</p>
              <p className="text-xs text-gray-500">kredit tersisa</p>
            </div>

            {/* Sidang - Simulasi */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-purple-100 rounded-xl p-3">
                  <span className="text-3xl">🎤</span>
                </div>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  SIDANG
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Simulasi Sidang</h3>
              <p className="text-3xl font-extrabold text-purple-600 mb-2">{DUMMY_CREDITS.sidang_simulasi}</p>
              <p className="text-xs text-gray-500">kredit tersisa</p>
            </div>

            {/* Sidang - Analisa */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-emerald-100 rounded-xl p-3">
                  <span className="text-3xl">📊</span>
                </div>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  SIDANG
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Analisa Skripsi</h3>
              <p className="text-3xl font-extrabold text-emerald-600 mb-2">{DUMMY_CREDITS.sidang_analisa}</p>
              <p className="text-xs text-gray-500">kredit tersisa</p>
            </div>

            {/* Kesamaan (No Sempro/Sidang distinction) */}
            <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-amber-100 rounded-xl p-3">
                  <span className="text-3xl">🔍</span>
                </div>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                  SEMUA
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Cek Kesamaan</h3>
              <p className="text-3xl font-extrabold text-amber-600 mb-2">{DUMMY_CREDITS.kesamaan}</p>
              <p className="text-xs text-gray-500">kredit tersisa</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              <span>💎</span>
              Lihat Paket & Beli Kredit
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">📂 Dokumen Saya</h2>
              <p className="text-sm text-gray-500 mt-0.5">{DUMMY_DOCUMENTS.length} dokumen terupload</p>
            </div>
            <Link
              href="/documents"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              Kelola Semua
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dokumen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Upload
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {DUMMY_DOCUMENTS.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{doc.title}</p>
                          <p className="text-xs text-gray-500">{doc.file_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          doc.type === 'proposal'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {doc.type === 'proposal' ? 'Proposal' : 'Laporan Akhir'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          STATUS_BADGE[doc.status]?.className
                        }`}
                      >
                        {STATUS_BADGE[doc.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateShort(doc.uploaded_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Usage History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Riwayat Penggunaan Fitur AI</h2>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Semua', icon: '📋' },
                { key: 'simulasi', label: 'Simulasi', icon: '🎤' },
                { key: 'analisa', label: 'Analisa', icon: '📊' },
                { key: 'kesamaan', label: 'Kesamaan', icon: '🔍' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    selectedTab === tab.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nama Dokumen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fitur AI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hasil
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="text-sm font-medium">Belum ada riwayat untuk filter ini</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.no} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.no}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{item.document}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.feature === 'Simulasi Sidang'
                              ? 'bg-purple-100 text-purple-700'
                              : item.feature === 'Analisa Skripsi'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.feature}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.type !== '-' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {item.type}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.date)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{item.result}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredHistory.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Menampilkan {filteredHistory.length} dari {DUMMY_HISTORY.length} riwayat
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
