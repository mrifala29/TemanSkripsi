'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { getUser } from '@/lib/auth'

type Credits = {
  sim_ppt_credits: number
  sim_fulltext_credits: number
  analisa_ppt_credits: number
  analisa_fulltext_credits: number
  similarity_credits: number
}

type CreditTransaction = {
  id: string
  type: 'purchase' | 'usage' | 'bonus' | 'refund'
  feature: string
  amount: number
  description: string | null
  created_at: string
}

type RecentDocument = {
  id: string
  title: string | null
  file_name: string
  parse_status: 'pending' | 'processing' | 'done' | 'failed'
  created_at: string
}

// Pricing packages definition
const PACKAGES = [
  {
    name: 'Starter',
    price: 50000,
    credits: {
      sim_ppt: 2,
      sim_fulltext: 1,
      analisa_ppt: 2,
      analisa_fulltext: 1,
      similarity: 5,
    },
    color: 'border-gray-300 bg-gray-50',
  },
  {
    name: 'Plus',
    price: 100000,
    credits: {
      sim_ppt: 5,
      sim_fulltext: 3,
      analisa_ppt: 5,
      analisa_fulltext: 3,
      similarity: 10,
    },
    color: 'border-indigo-300 bg-indigo-50',
    popular: true,
  },
  {
    name: 'Pro',
    price: 200000,
    credits: {
      sim_ppt: 15,
      sim_fulltext: 10,
      analisa_ppt: 15,
      analisa_fulltext: 10,
      similarity: 30,
    },
    color: 'border-purple-300 bg-purple-50',
  },
]

const FEATURE_LABELS: Record<string, string> = {
  sim_ppt: 'Simulasi PPT',
  sim_fulltext: 'Simulasi Fulltext',
  analisa_ppt: 'Analisa PPT',
  analisa_fulltext: 'Analisa Fulltext',
  similarity: 'Cek Kesamaan',
}

const CREDIT_COSTS: Record<string, number> = {
  sim_ppt: 15000,
  sim_fulltext: 25000,
  analisa_ppt: 10000,
  analisa_fulltext: 20000,
  similarity: 5000,
}

const CREDIT_ICONS: Record<string, string> = {
  sim_ppt: '🎤',
  sim_fulltext: '📄',
  analisa_ppt: '📊',
  analisa_fulltext: '📝',
  similarity: '🔍',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Menunggu',  cls: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  processing: { label: 'Diproses', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  done:       { label: 'Siap',     cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  failed:     { label: 'Gagal',    cls: 'bg-red-50 text-red-700 border border-red-200' },
}

export default function DashboardPage() {
  const user = getUser()
  const [credits, setCredits] = useState<Credits | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [showPricingDetail, setShowPricingDetail] = useState(false)

  useEffect(() => {
    Promise.all([
      api.getCredits().catch(() => null),
      api.getCreditTransactions({ limit: 5 }).catch(() => []),
      api.getDocuments().catch(() => ({ data: [] })),
    ]).then(([creditsRes, txRes, docsRes]) => {
      if (creditsRes?.data) setCredits(creditsRes.data)
      if (Array.isArray(txRes?.data)) setTransactions(txRes.data)
      const docs = Array.isArray(docsRes?.data) ? docsRes.data : []
      setRecentDocs(docs.slice(0, 4))
    }).finally(() => setLoading(false))
  }, [])

  const creditEntries = credits
    ? ([
        ['sim_ppt', credits.sim_ppt_credits],
        ['sim_fulltext', credits.sim_fulltext_credits],
        ['analisa_ppt', credits.analisa_ppt_credits],
        ['analisa_fulltext', credits.analisa_fulltext_credits],
        ['similarity', credits.similarity_credits],
      ] as [string, number][])
    : []

  const totalCreditsValue = creditEntries.reduce(
    (acc, [key, count]) => acc + count * CREDIT_COSTS[key],
    0,
  )

  const hasLowCredits = credits && creditEntries.every(([, count]) => count === 0)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* ── GREETING ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Selamat datang, {user?.name?.split(' ')[0] ?? 'Mahasiswa'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Dashboard TemanSkripsi - Persiapkan sidang skripsimu dengan AI
        </p>
      </motion.div>

      {/* ── LOW CREDIT WARNING ── */}
      {!loading && hasLowCredits && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-3 bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm"
        >
          <span className="text-2xl">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-amber-900">Kreditmu sudah habis</p>
            <p className="text-sm text-amber-700 mt-1">
              Beli paket kredit untuk mulai menggunakan fitur AI: Simulasi Sidang, Analisa Skripsi, dan Cek Tulisan AI & Typo.
            </p>
          </div>
          <Link
            href="/pricing"
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Beli Kredit
          </Link>
        </motion.div>
      )}

      {/* ── CURRENT PACKAGE DISPLAY ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 mb-6 text-white shadow-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <span className="text-3xl">💳</span>
              </div>
              <div>
                <p className="text-sm text-indigo-100">Kredit Tersedia</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalCreditsValue)}
                </p>
              </div>
            </div>
            
            {!loading && credits && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {creditEntries.map(([key, count]) => (
                  <div key={key} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{CREDIT_ICONS[key]}</span>
                      <span className="text-2xl font-bold">{count}</span>
                    </div>
                    <p className="text-xs text-indigo-100 leading-tight">{FEATURE_LABELS[key]}</p>
                  </div>
                ))}
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowPricingDetail(!showPricingDetail)}
              className="bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              {showPricingDetail ? '✕ Tutup Paket' : '📦 Lihat Paket'}
            </button>
            <Link
              href="/pricing"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors text-center shadow-sm"
            >
              + Beli Kredit
            </Link>
          </div>
        </div>

        {/* Pricing packages detail - collapsible */}
        {showPricingDetail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-white/20"
          >
            <h3 className="text-lg font-bold mb-4">Paket Harga</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`bg-white rounded-2xl p-5 relative ${pkg.popular ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                      TERPOPULER
                    </span>
                  )}
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h4>
                  <p className="text-2xl font-extrabold text-indigo-600 mb-4">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(pkg.price)}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>🎤 Simulasi PPT</span>
                      <strong>{pkg.credits.sim_ppt}x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>📄 Simulasi Fulltext</span>
                      <strong>{pkg.credits.sim_fulltext}x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>📊 Analisa PPT</span>
                      <strong>{pkg.credits.analisa_ppt}x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>📝 Analisa Fulltext</span>
                      <strong>{pkg.credits.analisa_fulltext}x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>🔍 Cek Kesamaan</span>
                      <strong>{pkg.credits.similarity}x</strong>
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className={`block mt-4 text-center font-bold text-sm px-4 py-2.5 rounded-xl transition-colors ${
                      pkg.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Pilih Paket
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── 3 MAIN AI FEATURES CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Simulasi Sidang */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            href="/sessions"
            className="block bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg p-6 transition-all h-full group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-100 rounded-2xl p-4">
                <span className="text-4xl">🎤</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                credits && (credits.sim_ppt_credits + credits.sim_fulltext_credits > 0)
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {loading ? '...' : (credits ? (credits.sim_ppt_credits + credits.sim_fulltext_credits) : 0)} kredit
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
              Simulasi Sidang
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Latihan sidang dengan AI dosen penguji. Jawab pertanyaan dan dapatkan evaluasi.
            </p>
            <div className="flex items-center text-purple-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Mulai simulasi
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </motion.div>

        {/* Analisa Skripsi */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Link
            href="/analysis"
            className="block bg-white rounded-2xl border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg p-6 transition-all h-full group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-emerald-100 rounded-2xl p-4">
                <span className="text-4xl">📊</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                credits && (credits.analisa_ppt_credits + credits.analisa_fulltext_credits > 0)
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {loading ? '...' : (credits ? (credits.analisa_ppt_credits + credits.analisa_fulltext_credits) : 0)} kredit
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
              Analisa Skripsi
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Dapatkan skor dan feedback AI untuk setiap aspek skripsimu (5-7 aspek).
            </p>
            <div className="flex items-center text-emerald-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Analisa sekarang
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </motion.div>

        {/* Cek Tulisan AI & Typo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/similarity"
            className="block bg-white rounded-2xl border-2 border-gray-200 hover:border-amber-300 hover:shadow-lg p-6 transition-all h-full group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-amber-100 rounded-2xl p-4">
                <span className="text-4xl">🔍</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                credits && credits.similarity_credits > 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {loading ? '...' : (credits ? credits.similarity_credits : 0)} kredit
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
              Cek Tulisan AI & Typo
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Deteksi indikasi tulisan AI per bab dan temukan typo dengan lokasi spesifik.
            </p>
            <div className="flex items-center text-amber-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Cek sekarang
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Documents */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">📂 Dokumen Saya</h2>
              <Link
                href="/documents"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                Kelola
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentDocs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <span className="text-4xl mb-3 block">📄</span>
                <p className="text-sm text-gray-500 mb-4">Belum ada dokumen</p>
                <Link
                  href="/documents"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Dokumen
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    href="/documents"
                    className="flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-2xl flex-shrink-0">
                        {doc.file_name.endsWith('.pdf') ? '📄' : '📊'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {doc.title || doc.file_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtDateShort(doc.created_at)}</p>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_LABEL[doc.parse_status]?.cls}`}>
                      {STATUS_LABEL[doc.parse_status]?.label}
                    </span>
                  </Link>
                ))}
                
                {recentDocs.length > 0 && (
                  <Link
                    href="/documents"
                    className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2"
                  >
                    Lihat semua dokumen →
                  </Link>
                )}
              </div>
            )}
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 rounded-2xl border border-indigo-100 p-6"
          >
            <h3 className="text-base font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <span>💡</span>
              Tips Persiapan Sidang
            </h3>
            <ul className="space-y-2.5 text-sm text-indigo-800">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">1.</span>
                <span>Mulai dengan <strong>Analisa Fulltext</strong> untuk tahu kelemahan utama skripsimu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">2.</span>
                <span>Perbaiki berdasarkan feedback AI, lalu jalankan <strong>Simulasi Sidang</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">3.</span>
                <span>Gunakan <strong>Cek Tulisan AI & Typo</strong> sebelum submit ke dosen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">4.</span>
                <span>Ulangi simulasi minimal 2-3 kali sebelum hari H untuk maksimalkan persiapan</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">
          {/* Riwayat Transaksi */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📊</span>
              Riwayat Kredit
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-3xl block mb-2">📋</span>
                <p className="text-xs text-gray-400">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {tx.description || FEATURE_LABELS[tx.feature] || tx.feature}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDate(tx.created_at)}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 text-sm font-bold px-2 py-1 rounded ${
                        tx.amount > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Buy credits CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-center shadow-lg"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🎓</span>
            </div>
            <p className="text-white font-bold text-lg mb-1">Siap Latihan Sidang?</p>
            <p className="text-purple-200 text-sm mb-5">Beli paket kredit dan mulai persiapanmu sekarang</p>
            <Link
              href="/pricing"
              className="block bg-white text-purple-700 font-bold text-sm px-5 py-3 rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
            >
              Lihat Paket Harga →
            </Link>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
          >
            <h3 className="text-sm font-bold text-gray-900 mb-4">Statistik Cepat</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Total Dokumen</span>
                <span className="text-sm font-bold text-gray-900">{recentDocs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Dokumen Siap</span>
                <span className="text-sm font-bold text-emerald-600">
                  {recentDocs.filter(d => d.parse_status === 'done').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Transaksi</span>
                <span className="text-sm font-bold text-gray-900">{transactions.length}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
