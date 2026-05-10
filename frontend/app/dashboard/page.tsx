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
    <div className="p-6 max-w-5xl mx-auto">
      {/* ── GREETING ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {user?.name?.split(' ')[0] ?? 'Mahasiswa'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Persiapkan sidang skripsimu dengan bantuan AI dosen penguji.
        </p>
      </motion.div>

      {/* ── LOW CREDIT WARNING ── */}
      {!loading && hasLowCredits && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <span className="text-xl">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Kreditmu sudah habis</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Beli kredit untuk mulai simulasi, analisa, atau cek kesamaan skripsimu.
            </p>
          </div>
          <Link
            href="/pricing"
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Beli Kredit
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Credit Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Kredit Tersisa</h2>
                {!loading && credits && totalCreditsValue > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Senilai ±{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalCreditsValue)}
                  </p>
                )}
              </div>
              <Link
                href="/pricing"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Beli Kredit
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {creditEntries.map(([key, count]) => (
                  <div
                    key={key}
                    className={`rounded-xl p-4 border ${
                      count > 0
                        ? 'bg-indigo-50 border-indigo-100'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="text-2xl mb-1">{CREDIT_ICONS[key]}</div>
                    <p className={`text-2xl font-extrabold ${count > 0 ? 'text-indigo-700' : 'text-gray-300'}`}>
                      {count}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{FEATURE_LABELS[key]}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h2 className="text-base font-bold text-gray-900 mb-4">Mulai Dari Sini</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: '📂',
                  title: 'Kelola Dokumen',
                  desc: 'Upload & proses skripsi atau PPT',
                  href: '/documents',
                  color: 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30',
                },
                {
                  icon: '🎤',
                  title: 'Mulai Simulasi',
                  desc: 'Latihan sidang dengan AI dosen penguji',
                  href: '/sessions',
                  color: 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30',
                  disabled: credits ? (credits.sim_ppt_credits + credits.sim_fulltext_credits === 0) : false,
                },
                {
                  icon: '📊',
                  title: 'Analisa Skripsi',
                  desc: 'Skor 6 aspek + feedback dari AI',
                  href: '/analysis',
                  color: 'border-gray-200 hover:border-sky-200 hover:bg-sky-50/30',
                  disabled: credits ? (credits.analisa_ppt_credits + credits.analisa_fulltext_credits === 0) : false,
                },
                {
                  icon: '🔍',
                  title: 'Cek Kesamaan',
                  desc: 'Cek kemiripan dengan dokumen lain',
                  href: '/similarity',
                  color: 'border-gray-200 hover:border-teal-200 hover:bg-teal-50/30',
                  disabled: credits ? credits.similarity_credits === 0 : false,
                },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.disabled ? '/pricing' : action.href}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${action.color} ${
                    action.disabled ? 'opacity-60' : ''
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{action.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      {action.title}
                      {action.disabled && (
                        <span className="text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Kredit habis
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Documents */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Dokumen Terbaru</h2>
              <Link href="/documents" className="text-xs text-indigo-600 hover:underline font-medium">
                Lihat semua →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentDocs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 mb-3">Belum ada dokumen</p>
                <Link
                  href="/documents"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Upload dokumen pertamamu →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">
                        {doc.file_name.endsWith('.pdf') ? '📄' : '📊'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {doc.title || doc.file_name}
                        </p>
                        <p className="text-xs text-gray-400">{fmtDateShort(doc.created_at)}</p>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_LABEL[doc.parse_status]?.cls}`}>
                      {STATUS_LABEL[doc.parse_status]?.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">

          {/* Riwayat Transaksi */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h2 className="text-base font-bold text-gray-900 mb-4">Riwayat Kredit</h2>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Belum ada transaksi</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {tx.description || FEATURE_LABELS[tx.feature] || tx.feature}
                      </p>
                      <p className="text-xs text-gray-400">{fmtDate(tx.created_at)}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 text-xs font-bold ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 rounded-2xl border border-indigo-100 p-5"
          >
            <h3 className="text-sm font-bold text-indigo-900 mb-3">💡 Tips Persiapan Sidang</h3>
            <ul className="space-y-2 text-xs text-indigo-800">
              <li>→ Mulai dengan <strong>Analisa Fulltext</strong> untuk tahu kelemahan utama</li>
              <li>→ Perbaiki berdasarkan feedback, lalu <strong>Simulasi Sidang</strong></li>
              <li>→ Gunakan <strong>Cek Kesamaan</strong> sebelum submit ke dosen</li>
              <li>→ Ulangi simulasi minimal 2x sebelum hari H</li>
            </ul>
          </motion.div>

          {/* Buy credits CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-indigo-600 rounded-2xl p-5 text-center"
          >
            <div className="text-3xl mb-2">🎓</div>
            <p className="text-white font-bold text-sm mb-1">Siap latihan sidang?</p>
            <p className="text-indigo-200 text-xs mb-4">Beli paket dan mulai sekarang.</p>
            <Link
              href="/pricing"
              className="block bg-white text-indigo-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Lihat Paket Harga
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
