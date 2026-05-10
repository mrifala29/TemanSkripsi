'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const SATUAN = [
  {
    icon: '🎤',
    name: 'Simulasi PPT',
    desc: 'Latihan sidang dari slide presentasi',
    price: 'IDR 15.000',
    limit: 'Maks 50 slide',
    guarantee: 'Min. 5 tanya-jawab',
    features: [
      '✓ 1 sesi simulasi penuh',
      '✓ AI dosen penguji kritis',
      '✓ Pertanyaan berbasis isi slide',
      '✓ Maks 50 slide PPT/PPTX',
      '✓ Jaminan min. 5 tanya-jawab',
    ],
    color: 'border-gray-200',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  {
    icon: '📄',
    name: 'Simulasi Fulltext',
    desc: 'Latihan sidang dari skripsi lengkap',
    price: 'IDR 25.000',
    limit: 'Maks 100 halaman',
    guarantee: 'Min. 10 tanya-jawab',
    features: [
      '✓ 1 sesi simulasi penuh',
      '✓ AI dosen penguji kritis',
      '✓ Pertanyaan mendalam per bab',
      '✓ Maks 100 halaman PDF',
      '✓ Jaminan min. 10 tanya-jawab',
    ],
    color: 'border-gray-200',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  {
    icon: '📊',
    name: 'Analisa PPT',
    desc: 'Skor & feedback dari slide presentasi',
    price: 'IDR 10.000',
    limit: 'Maks 50 slide',
    guarantee: 'Skor 6 aspek',
    features: [
      '✓ Skor per aspek (0–100)',
      '✓ Feedback konkret per aspek',
      '✓ Identifikasi kelemahan utama',
      '✓ Maks 50 slide PPT/PPTX',
    ],
    color: 'border-gray-200',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  {
    icon: '📝',
    name: 'Analisa Fulltext',
    desc: 'Penilaian menyeluruh skripsi lengkap',
    price: 'IDR 20.000',
    limit: 'Maks 100 halaman',
    guarantee: 'Skor 6 aspek + potensi pertanyaan',
    features: [
      '✓ Skor per aspek (0–100)',
      '✓ Feedback konkret per aspek',
      '✓ Potensi pertanyaan sidang',
      '✓ Saran perbaikan spesifik',
      '✓ Maks 100 halaman PDF',
    ],
    color: 'border-indigo-200 bg-indigo-50/30',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  {
    icon: '🔍',
    name: 'Cek Kesamaan',
    desc: 'Laporan kemiripan dengan koleksi di sistem',
    price: 'IDR 5.000',
    limit: 'Maks 100 halaman',
    guarantee: 'Persentase kemiripan overall',
    features: [
      '✓ Persentase kemiripan overall',
      '✓ Bagian yang paling mirip',
      '✓ Dibanding dokumen lain di sistem',
      '✓ Maks 100 halaman PDF',
    ],
    color: 'border-gray-200',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
]

const BUNDLING = [
  {
    icon: '🎯',
    name: 'Paket Sidang PPT',
    desc: 'Untuk yang presentasi pakai slide',
    price: 'IDR 20.000',
    normalPrice: 'IDR 25.000',
    save: 'Hemat 20%',
    includes: ['1x Simulasi PPT (15rb)', '1x Analisa PPT (10rb)'],
    color: 'border-gray-200',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  {
    icon: '📄',
    name: 'Paket Sidang Fulltext',
    desc: 'Untuk yang ingin analisa mendalam',
    price: 'IDR 35.000',
    normalPrice: 'IDR 45.000',
    save: 'Hemat 22%',
    includes: ['1x Simulasi Fulltext (25rb)', '1x Analisa Fulltext (20rb)'],
    color: 'border-gray-200',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  {
    icon: '⭐',
    name: 'Paket Lengkap',
    desc: 'Semua fitur dalam satu paket',
    price: 'IDR 42.000',
    normalPrice: 'IDR 50.000',
    save: 'Hemat 16%',
    includes: ['1x Simulasi Fulltext (25rb)', '1x Analisa Fulltext (20rb)', '1x Cek Kesamaan (5rb)'],
    color: 'border-indigo-200 bg-indigo-50/50 shadow-lg shadow-indigo-100',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
    badge: 'REKOMENDASI',
  },
  {
    icon: '🚀',
    name: 'Paket Intensif',
    desc: 'Latihan sebelum & sesudah revisi',
    price: 'IDR 58.000',
    normalPrice: 'IDR 75.000',
    save: 'Hemat 23%',
    includes: ['2x Simulasi Fulltext (50rb)', '1x Analisa Fulltext (20rb)', '1x Cek Kesamaan (5rb)'],
    color: 'border-gray-200',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
]

const FAQ = [
  {
    q: 'Apa itu sistem kredit?',
    a: 'Kamu membeli kredit sesuai fitur yang dibutuhkan. Kredit disimpan di akunmu dan tidak ada masa kedaluwarsa — dipakai kapan saja.',
  },
  {
    q: 'Kenapa ada batas halaman/slide?',
    a: 'Dokumen sangat tebal membutuhkan lebih banyak waktu dan biaya AI untuk diproses. Batas ini menjaga kualitas layanan dan keterjangkauan harga.',
  },
  {
    q: 'Apa yang dijamin di "min. N tanya-jawab"?',
    a: 'Jika sesi terputus karena error dari sistem kami sebelum mencapai minimum, kredit akan dikembalikan penuh ke akunmu.',
  },
  {
    q: 'Apakah ada trial gratis?',
    a: 'Ya! Setiap akun baru mendapat 1 sesi Simulasi PPT gratis sebagai bonus registrasi. Tidak perlu memasukkan kartu kredit.',
  },
  {
    q: 'Apakah cek kesamaan sama seperti Turnitin?',
    a: 'Tidak. Cek kesamaan kami membandingkan skripsimu dengan dokumen lain yang ada di sistem TemanSkripsi. Ini alat bantu internal, bukan pengganti Turnitin.',
  },
]

export default function PricingPage() {
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

      {/* ── SATUAN ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Per Fitur (Satuan)</h2>
            <p className="text-sm text-gray-500">Cocok jika kamu hanya butuh satu jenis bantuan</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {SATUAN.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`border ${p.color} rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-1">{p.desc}</p>
                <p className="text-xs text-indigo-600 font-medium mb-4">{p.limit} · {p.guarantee}</p>
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-2xl font-extrabold text-gray-900">{p.price}</p>
                  <p className="text-xs text-gray-400 mt-0.5">per penggunaan</p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="text-xs text-gray-600">{f}</li>
                  ))}
                </ul>
                <Link
                  href="/auth/login"
                  className={`block text-center w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${p.button}`}
                >
                  Beli Kredit
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUNDLING ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paket Bundling</h2>
            <p className="text-sm text-gray-500">Hemat lebih banyak dengan kombinasi fitur yang tepat</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {BUNDLING.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative border ${p.color} rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-all duration-300`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {p.badge}
                    </span>
                  </div>
                )}
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{p.desc}</p>
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-2xl font-extrabold text-gray-900">{p.price}</p>
                  <p className="text-xs text-gray-400 line-through mt-0.5">{p.normalPrice}</p>
                  <span className="inline-block mt-1.5 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {p.save}
                  </span>
                </div>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {p.includes.map((f, j) => (
                    <li key={j} className="text-xs text-gray-600">✓ {f}</li>
                  ))}
                </ul>
                <Link
                  href="/auth/login"
                  className={`block text-center w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${p.button}`}
                >
                  Beli Paket
                </Link>
              </motion.div>
            ))}
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
                transition={{ delay: i * 0.07 }}
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
