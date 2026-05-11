'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type DocType = 'ppt' | 'fulltext'

type Variant = {
  priceLabel: string
  limit: string
  guarantee: string
  features: string[]
}

type Feature = {
  key: string
  icon: string
  name: string
  desc: string
  howItWorks: string
  hasBothTypes: boolean
  ppt: Variant | null
  fulltext: Variant
}

const FEATURES: Feature[] = [
  {
    key: 'simulasi',
    icon: '🎤',
    name: 'Simulasi Sidang',
    desc: 'Latihan tanya-jawab dengan AI dosen penguji',
    howItWorks: 'AI bertanya → kamu jawab → AI evaluasi + tanya lanjutan (berulang)',
    hasBothTypes: true,
    ppt: {
      priceLabel: 'IDR 15.000',
      limit: 'Maks 50 slide PPT/PPTX',
      guarantee: 'Min. 5 putaran tanya-jawab',
      features: [
        '1 sesi simulasi penuh',
        'Pertanyaan berbasis isi slide',
        'AI evaluasi jawaban + follow-up tiap giliran',
        'Maks 50 slide PPT/PPTX',
        'Jaminan min. 5 putaran',
      ],
    },
    fulltext: {
      priceLabel: 'IDR 25.000',
      limit: 'Maks 100 halaman PDF',
      guarantee: 'Min. 10 putaran tanya-jawab',
      features: [
        '1 sesi simulasi penuh',
        'Pertanyaan mendalam per bab skripsi',
        'AI evaluasi jawaban + follow-up tiap giliran',
        'Maks 100 halaman PDF',
        'Jaminan min. 10 putaran',
      ],
    },
  },
  {
    key: 'analisa',
    icon: '📊',
    name: 'Analisa & Penilaian',
    desc: 'Skor 6 aspek skripsi + feedback dari AI',
    howItWorks: 'Hasil dalam 1–3 menit setelah dokumen diproses',
    hasBothTypes: true,
    ppt: {
      priceLabel: 'IDR 10.000',
      limit: 'Maks 50 slide PPT/PPTX',
      guarantee: 'Skor 6 aspek + feedback',
      features: [
        'Skor per aspek 0–100',
        'Feedback konkret tiap aspek',
        'Identifikasi kelemahan utama',
        'Maks 50 slide PPT/PPTX',
      ],
    },
    fulltext: {
      priceLabel: 'IDR 20.000',
      limit: 'Maks 100 halaman PDF',
      guarantee: 'Skor + potensi pertanyaan sidang',
      features: [
        'Skor per aspek 0–100',
        'Feedback konkret tiap aspek',
        'Potensi pertanyaan sidang',
        'Saran perbaikan spesifik',
        'Maks 100 halaman PDF',
      ],
    },
  },
  {
    key: 'kesamaan',
    icon: '🔍',
    name: 'Cek Kesamaan',
    desc: 'Laporan kemiripan dengan koleksi di sistem',
    howItWorks: 'Perbandingan internal — bukan vs internet',
    hasBothTypes: false,
    ppt: null,
    fulltext: {
      priceLabel: 'IDR 5.000',
      limit: 'Maks 100 halaman PDF',
      guarantee: 'Persentase + bagian paling mirip',
      features: [
        'Persentase kemiripan overall',
        'Bagian teks yang paling mirip',
        'Dibanding dokumen lain di sistem',
        'Maks 100 halaman PDF',
      ],
    },
  },
]

type Bundle = {
  icon: string
  name: string
  desc: string
  badge?: string
  ppt: { priceLabel: string; normalLabel: string; save: string; includes: string[] }
  fulltext: { priceLabel: string; normalLabel: string; save: string; includes: string[] }
}

const BUNDLES: Bundle[] = [
  {
    icon: '🔎',
    name: 'Sidang + Cek Kesamaan',
    desc: 'Latihan sidang & periksa originalitas dokumen',
    ppt: {
      priceLabel: 'IDR 17.000',
      normalLabel: 'IDR 20.000',
      save: 'Hemat 15%',
      includes: ['1× Simulasi PPT', '1× Cek Kesamaan'],
    },
    fulltext: {
      priceLabel: 'IDR 25.000',
      normalLabel: 'IDR 30.000',
      save: 'Hemat 17%',
      includes: ['1× Simulasi Fulltext', '1× Cek Kesamaan'],
    },
  },
  {
    icon: '🎯',
    name: 'Sidang + Analisa',
    desc: 'Latihan sidang & temukan kelemahan skripsi',
    badge: 'REKOMENDASI',
    ppt: {
      priceLabel: 'IDR 20.000',
      normalLabel: 'IDR 25.000',
      save: 'Hemat 20%',
      includes: ['1× Simulasi PPT', '1× Analisa PPT'],
    },
    fulltext: {
      priceLabel: 'IDR 35.000',
      normalLabel: 'IDR 45.000',
      save: 'Hemat 22%',
      includes: ['1× Simulasi Fulltext', '1× Analisa Fulltext'],
    },
  },
  {
    icon: '⭐',
    name: 'Paket Lengkap',
    desc: 'Semua fitur sekaligus — persiapan maksimal',
    ppt: {
      priceLabel: 'IDR 24.000',
      normalLabel: 'IDR 30.000',
      save: 'Hemat 20%',
      includes: ['1× Simulasi PPT', '1× Analisa PPT', '1× Cek Kesamaan'],
    },
    fulltext: {
      priceLabel: 'IDR 39.000',
      normalLabel: 'IDR 50.000',
      save: 'Hemat 22%',
      includes: ['1× Simulasi Fulltext', '1× Analisa Fulltext', '1× Cek Kesamaan'],
    },
  },
]

const FAQ = [
  {
    q: 'Apa itu "putaran tanya-jawab" di simulasi?',
    a: 'Satu putaran = AI mengajukan pertanyaan → kamu menjawab → AI mengevaluasi jawabanmu sekaligus mengajukan pertanyaan lanjutan. Siklus ini berulang hingga kamu mengakhiri sesi. Jadi di setiap giliran, kamu mendapat evaluasi DAN pertanyaan baru.',
  },
  {
    q: 'Apa bedanya PPT dan Fulltext?',
    a: 'PPT (slide sidang): cocok untuk latihan cepat atau jika skripsi belum final. AI membaca isi slide. Fulltext (PDF skripsi lengkap): analisis jauh lebih mendalam karena AI membaca seluruh isi skripsi per bab.',
  },
  {
    q: 'Kenapa ada batas halaman/slide?',
    a: 'Dokumen tebal membutuhkan lebih banyak waktu dan biaya AI untuk diproses. Batas ini menjaga kualitas layanan dan harga tetap terjangkau. Mayoritas skripsi S1 (60–90 halaman) masuk dalam batas 100 halaman.',
  },
  {
    q: 'Apa itu sistem kredit?',
    a: 'Kredit disimpan per fitur di akunmu — tidak ada masa kedaluwarsa. Beli sesuai kebutuhan, gunakan kapan saja. Kredit Simulasi tidak bisa dipakai untuk Analisa, dan sebaliknya.',
  },
  {
    q: 'Apa yang dijamin di "min. N putaran"?',
    a: 'Jika sesi terputus karena error dari sistem kami sebelum mencapai minimum, kredit akan dikembalikan penuh ke akunmu.',
  },
  {
    q: 'Cek kesamaan sama seperti Turnitin?',
    a: 'Tidak. Cek kami membandingkan skripsimu dengan dokumen lain yang ada di sistem TemanSkripsi — bukan vs internet. Ini alat bantu kewaspadaan internal, bukan pengganti Turnitin.',
  },
]

function Toggle({
  value,
  onChange,
}: {
  value: DocType
  onChange: (v: DocType) => void
}) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-semibold">
      <button
        onClick={() => onChange('ppt')}
        className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
          value === 'ppt'
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        📊 PPT
      </button>
      <button
        onClick={() => onChange('fulltext')}
        className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
          value === 'fulltext'
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        📄 Fulltext
      </button>
    </div>
  )
}

export default function PricingPage() {
  const [featureTypes, setFeatureTypes] = useState<Record<string, DocType>>({
    simulasi: 'fulltext',
    analisa: 'fulltext',
  })
  const [bundleType, setBundleType] = useState<DocType>('fulltext')

  function setFType(key: string, v: DocType) {
    setFeatureTypes((prev) => ({ ...prev, [key]: v }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              🎁 Bonus registrasi: 1 sesi Simulasi PPT gratis
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Bayar Sesuai Kebutuhan
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-2">
              Kredit per fitur, tidak ada langganan bulanan. Beli apa yang kamu butuhkan, gunakan kapan saja.
            </p>
            <p className="text-xs text-gray-400">
              💳 QRIS · GoPay · OVO · Transfer Bank
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── PER FITUR ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Per Fitur</h2>
            <p className="text-sm text-gray-500">
              Pilih fitur yang kamu butuhkan, lalu pilih jenis dokumen — PPT atau skripsi lengkap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const selectedType = feature.hasBothTypes ? featureTypes[feature.key] : 'fulltext'
              const variant = selectedType === 'ppt' && feature.ppt ? feature.ppt : feature.fulltext

              return (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="border border-gray-200 rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      <div className="text-3xl mb-1">{feature.icon}</div>
                      <h3 className="text-base font-bold text-gray-900">{feature.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{feature.desc}</p>
                    </div>
                    {feature.hasBothTypes && (
                      <Toggle
                        value={featureTypes[feature.key]}
                        onChange={(v) => setFType(feature.key, v)}
                      />
                    )}
                  </div>

                  {/* How it works */}
                  <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2 mb-4 leading-relaxed">
                    💡 {feature.howItWorks}
                  </p>

                  {/* Price — animated on switch */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${feature.key}-${selectedType}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="mb-4 pb-4 border-b border-gray-100"
                    >
                      <p className="text-3xl font-extrabold text-gray-900">{variant.priceLabel}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{variant.limit}</p>
                      <p className="text-xs text-indigo-600 font-medium mt-1">{variant.guarantee}</p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Features */}
                  <AnimatePresence mode="wait">
                    <motion.ul
                      key={`${feature.key}-${selectedType}-list`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-2 mb-6 flex-1"
                    >
                      {variant.features.map((f, j) => (
                        <li key={j} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-indigo-400 mt-0.5 flex-shrink-0">✓</span>
                          {f}
                        </li>
                      ))}
                    </motion.ul>
                  </AnimatePresence>

                  <Link
                    href="/auth/login"
                    className="block text-center w-full px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Beli Kredit
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── BUNDLING ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paket Bundling</h2>
            <p className="text-sm text-gray-500 mb-6">
              Kombinasi fitur yang tepat, harga lebih hemat.
            </p>
            {/* Global bundle type toggle */}
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1 shadow-sm">
              <button
                onClick={() => setBundleType('ppt')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  bundleType === 'ppt'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                📊 PPT Sidang
              </button>
              <button
                onClick={() => setBundleType('fulltext')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  bundleType === 'fulltext'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                📄 Fulltext Skripsi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {BUNDLES.map((bundle, i) => {
              const v = bundleType === 'ppt' ? bundle.ppt : bundle.fulltext
              return (
                <motion.div
                  key={bundle.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative border rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-all duration-300 ${
                    bundle.badge
                      ? 'border-indigo-200 bg-indigo-50/50 shadow-lg shadow-indigo-100'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {bundle.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        {bundle.badge}
                      </span>
                    </div>
                  )}

                  <div className="text-3xl mb-2">{bundle.icon}</div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{bundle.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{bundle.desc}</p>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${bundle.name}-${bundleType}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="mb-4 pb-4 border-b border-gray-100"
                    >
                      <p className="text-2xl font-extrabold text-gray-900">{v.priceLabel}</p>
                      <p className="text-xs text-gray-400 line-through mt-0.5">{v.normalLabel}</p>
                      <span className="inline-block mt-1.5 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {v.save}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    <motion.ul
                      key={`${bundle.name}-${bundleType}-list`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-2 mb-6 flex-1"
                    >
                      {v.includes.map((item, j) => (
                        <li key={j} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-indigo-400 mt-0.5 flex-shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </motion.ul>
                  </AnimatePresence>

                  <Link
                    href="/auth/login"
                    className="block text-center w-full px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Beli Paket
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Pertanyaan Umum</h2>
          <div className="space-y-5">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-12 shadow-xl shadow-indigo-200"
        >
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-3xl font-bold text-white mb-4">Mulai Gratis Sekarang</h2>
          <p className="text-indigo-100 mb-8">
            Daftar dan langsung dapat 1 sesi Simulasi PPT gratis. Tidak perlu kartu kredit.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-white hover:bg-gray-50 text-indigo-700 font-bold px-10 py-3.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
          >
            Daftar Gratis →
          </Link>
        </motion.div>
      </section>

      <footer className="py-8 px-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">
          © 2026 TemanSkripsi · <Link href="/" className="hover:text-indigo-600">Kembali ke Beranda</Link>
        </p>
      </footer>
    </div>
  )
}
