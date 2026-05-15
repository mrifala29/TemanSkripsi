'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

/* ─── DATA ──────────────────────────────────────────────── */

const CHAPTERS = [
  { chapter: 'BAB I – Pendahuluan',         similarity: 12, typos: 3,  risk: 'low' },
  { chapter: 'BAB II – Tinjauan Pustaka',   similarity: 28, typos: 7,  risk: 'medium' },
  { chapter: 'BAB III – Metodologi',        similarity: 10, typos: 2,  risk: 'low' },
  { chapter: 'BAB IV – Hasil & Pembahasan', similarity: 14, typos: 5,  risk: 'low' },
  { chapter: 'BAB V – Kesimpulan',          similarity:  8, typos: 1,  risk: 'low' },
]

const FLOW_STEPS = [
  { icon: '📤', num: '01', title: 'Upload Laporan Akhir', desc: 'Upload file PDF Laporan Akhirmu. Sistem mengekstrak teks dari setiap bab dan halaman secara otomatis.' },
  { icon: '🔢', num: '02', title: 'Segmentasi per Bab', desc: 'Teks dibagi per bab berdasarkan struktur dokumen untuk analisa yang lebih granular dan akurat.' },
  { icon: '📐', num: '03', title: 'Cek Kemiripan Teks', desc: 'Setiap segmen diubah menjadi vektor menggunakan model embedding. Kemiripan dihitung berdasarkan kedekatan antar vektor dengan dokumen lain di sistem.' },
  { icon: '✏️', num: '04', title: 'Deteksi Typo', desc: 'AI membaca teks per halaman dan mengidentifikasi salah ejaan, kesalahan tata bahasa minor, dan punctuation. Setiap typo dilengkapi lokasi halaman dan baris.' },
  { icon: '📋', num: '05', title: 'Laporan Lengkap', desc: 'Hasil kemiripan per bab + daftar typo dengan halaman, baris, dan konteks kalimat — sekilas langsung paham apa yang perlu diperbaiki.' },
]

const RISK_GUIDE = [
  { range: '0–15%',  label: 'Aman',           color: 'bg-emerald-100 border-emerald-300 text-emerald-800', bar: 'bg-emerald-500', desc: 'Teks originalitas sangat baik. Tidak perlu khawatir.' },
  { range: '16–30%', label: 'Perlu Perhatian', color: 'bg-amber-100 border-amber-300 text-amber-800',   bar: 'bg-amber-400',  desc: 'Ada kesamaan yang cukup signifikan. Periksa bagian ini.' },
  { range: '31%+',   label: 'Berisiko',        color: 'bg-red-100 border-red-300 text-red-800',         bar: 'bg-red-500',   desc: 'Persentase tinggi. Sangat disarankan untuk merevisi bagian ini.' },
]

const FAQ = [
  { q: 'Apakah ini sama dengan Turnitin?', a: 'Tidak. TemanSkripsi menggunakan vector similarity berbasis embedding AI untuk membandingkan dokumenmu dengan koleksi di sistem kami — bukan database dokumen publik. Hasil ini adalah estimasi untuk deteksi dini secara internal, bukan pengganti Turnitin resmi.' },
  { q: 'Bagaimana cara kerja deteksi typo?', a: 'AI membaca teks laporan akhirmu halaman per halaman dan mengidentifikasi tiga kategori: salah ejaan (spelling errors), kesalahan tata bahasa minor, dan punctuation yang tidak tepat. Setiap typo yang ditemukan dilengkapi nomor halaman, nomor baris, dan potongan kalimat sebagai konteks.' },
  { q: 'BAB II sering punya persentase tinggi — kenapa?', a: 'Tinjauan Pustaka secara alami mengandung banyak kutipan, parafrase, dan terminologi akademik yang mirip antar dokumen. Wajar jika BAB II memiliki kemiripan lebih tinggi dari bab lain.' },
  { q: 'Seberapa akurat deteksi typo?', a: 'Deteksi typo dilakukan oleh LLM yang sangat baik dalam memahami konteks bahasa. Namun tetap ada margin kesalahan — nama orang atau istilah teknis bisa terflag. Gunakan daftar typo sebagai panduan awal dan verifikasi secara manual.' },
]

/* ─── ANIMATED BAR ───────────────────────────────────────── */
function AnimatedBar({ value, color, delay }: { value: number; color: string; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={inView ? { width: `${Math.min(value * 2.5, 100)}%` } : { width: 0 }}
        transition={{ duration: 0.9, delay, ease: 'easeOut' }}
      />
    </div>
  )
}

/* ─── PAGE ──────────────────────────────────────────────── */
export default function PlagiasiPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-8 transition-colors">
              ← Kembali ke Beranda
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <span className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              🔍 Cek Kesamaan & Typo
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Kemiripan Teks + Deteksi Typo<br />
            <span className="text-amber-500">Sebelum Laporan Akhir Dikumpulkan</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Periksa estimasi kemiripan teks per bab dan temukan typo otomatis — lengkap dengan lokasi
            halaman dan baris agar mudah diperbaiki sebelum pengumpulan.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/similarity" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105 shadow-md shadow-amber-200">
              🔍 Cek Skripsimu Sekarang
            </Link>
            <a href="#alur" className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-medium text-base transition-all">
              Lihat Alur →
            </a>
          </motion.div>

          {/* Disclaimer banner */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-8 inline-flex items-center gap-2 bg-white border border-amber-200 text-amber-700 text-xs px-4 py-2.5 rounded-full shadow-sm">
            <span>⚠️</span>
            <span>Cek internal saja — bukan pengganti Turnitin. Deteksi typo dilengkapi lokasi halaman dan baris.</span>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-8 mt-10 flex-wrap">
            {[
              { num: 'Per Bab', label: 'Laporan Kemiripan' },
              { num: 'Halaman + Baris', label: 'Lokasi Typo' },
              { num: '<3 mnt', label: 'Waktu Proses' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-extrabold text-amber-500">{s.num}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ALUR ─────────────────────────────────────────── */}
      <section id="alur" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Alur Cek Kesamaan & Typo</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Dari upload hingga laporan — 5 langkah yang terjadi otomatis</p>
          </motion.div>

          <div className="space-y-6">
            {FLOW_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-5 items-start bg-gray-50 rounded-2xl p-5 border border-gray-100"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-white border-2 border-amber-200 rounded-2xl flex flex-col items-center justify-center shadow-sm gap-0.5">
                  <span className="text-xl">{step.icon}</span>
                  <span className="text-[10px] font-bold text-amber-500">{step.num}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTOH LAPORAN ───────────────────────────────── */}
      <section className="py-20 px-6 bg-amber-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Contoh Laporan Per Bab</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Begini tampilan laporan yang akan kamu terima setelah pengecekan selesai</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Report card */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="bg-amber-500 px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🔍</div>
                  <div>
                    <p className="text-white text-sm font-semibold">Laporan Kesamaan & Typo</p>
                    <p className="text-amber-100 text-xs">Skripsi: Analisis Sentimen ML · Per bab</p>
                  </div>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
                  <div className="px-5 py-5 text-center">
                    <motion.p
                      className="text-4xl font-extrabold text-emerald-600"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      18%
                    </motion.p>
                    <p className="text-xs text-gray-500 mt-1">Estimasi Kemiripan</p>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-2 inline-block">✓ Aman</span>
                  </div>
                  <div className="px-5 py-5 text-center">
                    <motion.p
                      className="text-4xl font-extrabold text-amber-500"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, type: 'spring' }}
                    >
                      18
                    </motion.p>
                    <p className="text-xs text-gray-500 mt-1">Typo Ditemukan</p>
                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mt-2 inline-block">⚠ Periksa</span>
                  </div>
                </div>

                {/* Per-chapter bars */}
                <div className="p-5 space-y-4 bg-gray-50">
                  <div className="flex gap-8 text-[10px] text-gray-400 font-semibold mb-1">
                    <span className="flex-1">BAB</span>
                    <span className="w-20 text-center">Kemiripan</span>
                    <span className="w-20 text-center">Typo</span>
                  </div>
                  {CHAPTERS.map((ch, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <span className="text-xs text-gray-700 font-medium flex-1 truncate">{ch.chapter}</span>
                        <div className="flex gap-1 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ch.similarity <= 15 ? 'text-emerald-700 bg-emerald-50' : ch.similarity <= 30 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}>
                            {ch.similarity}%
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ch.typos === 0 ? 'text-emerald-700 bg-emerald-50' : ch.typos <= 5 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}>
                            {ch.typos} typo
                          </span>
                        </div>
                      </div>
                      <AnimatedBar value={ch.similarity} color={ch.similarity <= 15 ? 'bg-emerald-500' : ch.similarity <= 30 ? 'bg-amber-400' : 'bg-red-500'} delay={i * 0.08} />
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-1 rounded bg-emerald-400 inline-block" /> Bar = Kemiripan per bab</span>
                  <span className="flex items-center gap-1">✏️ Badge typo warna merah = perlu perhatian</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 text-center mt-3">* Demo contoh — laporan aktual berbasis dokumen skripsimu</p>
            </motion.div>

            {/* Insight side */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900">Cara Membaca Laporan</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Setiap bab menampilkan bar kemiripan teks dan badge jumlah typo.
                Warna bar dan badge mencerminkan tingkat perhatian yang dibutuhkan.
              </p>

              {/* Risk guide */}
              <div className="space-y-3">
                {RISK_GUIDE.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`border rounded-xl p-4 ${r.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">{r.label}</span>
                      <span className="text-xs font-semibold">{r.range}</span>
                    </div>
                    <div className={`h-1.5 rounded-full mb-2 w-1/2 ${r.bar}`} />
                    <p className="text-xs leading-relaxed opacity-80">{r.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 mb-1">⚡ Fokus Perhatian</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  Pada contoh di atas, BAB II perlu perhatian lebih karena kemiripan 28% (zona kuning) dan 7 typo ditemukan.
                  Prioritaskan revisi parafrase dan perbaiki typo sebelum pengumpulan.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Pertanyaan yang Sering Ditanyakan</h2>
          </motion.div>

          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-gray-50 rounded-2xl border border-gray-200 p-6"
              >
                <p className="text-sm font-bold text-gray-900 mb-2">❓ {item.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KAPAN DIGUNAKAN ───────────────────────────────── */}
      <section className="py-20 px-6 bg-amber-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Kapan Sebaiknya Digunakan?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: '✍️', step: 'Setelah Draft Selesai', desc: 'Gunakan setelah menyelesaikan keseluruhan draft — sebelum bimbingan terakhir. Identifikasi bagian yang paling berisiko lebih awal.' },
              { icon: '🔄', step: 'Setelah Revisi Besar', desc: 'Cek ulang setelah melakukan revisi besar untuk memastikan perubahan yang kamu buat benar-benar mengurangi persentase risiko.' },
              { icon: '📅', step: '1–2 Minggu Sebelum Sidang', desc: 'Final check sebelum mendaftar sidang. Pastikan tidak ada bab yang masih berada di zona merah atau kuning.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-amber-200 p-6"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{item.step}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-12 shadow-xl shadow-amber-200"
        >
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-3xl font-bold text-white mb-4">Periksa Keaslian Skripsimu Sekarang</h2>
          <p className="text-amber-100 mb-8 leading-relaxed">
            Dapatkan gambaran menyeluruh tentang originalitas skripsimu<br />
            sebelum memasuki ruang sidang.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/similarity" className="inline-block bg-white hover:bg-gray-50 text-amber-700 font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-md">
              🔍 Cek Sekarang →
            </Link>
            <Link href="/analisa" className="inline-block bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium px-8 py-3.5 rounded-xl transition-all">
              Lihat Fitur Analisa →
            </Link>
          </div>
          <p className="text-amber-200 text-xs mt-6">
            ⚠️ Cek internal saja — bukan pengganti Turnitin. Typo detection berbantuan AI.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">
          © 2026 TemanSkripsi · Dibuat untuk membantu mahasiswa Indonesia lulus dengan percaya diri
        </p>
      </footer>
    </div>
  )
}
