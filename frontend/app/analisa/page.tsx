'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

/* ─── DATA ──────────────────────────────────────────────── */

const ANALYSIS_SCORES = [
  { aspect: 'Latar Belakang',         score: 82, feedback: 'Relevansi masalah sudah kuat. Pastikan gap penelitian dipertegas dengan data terkini.' },
  { aspect: 'Rumusan Masalah',        score: 75, feedback: 'Rumusan cukup spesifik namun kurang terukur. Tambahkan indikator keberhasilan yang jelas.' },
  { aspect: 'Metodologi Penelitian',  score: 68, feedback: 'Perlu justifikasi lebih kuat mengapa metode ini dipilih dibanding alternatif yang ada.' },
  { aspect: 'Analisis & Pembahasan',  score: 85, feedback: 'Pembahasan sangat baik — argumentasi data sudah selaras dengan temuan penelitian.' },
  { aspect: 'Kesimpulan & Saran',     score: 79, feedback: 'Kesimpulan sudah menjawab rumusan masalah. Saran perlu lebih spesifik dan actionable.' },
]

const FLOW_STEPS = [
  { icon: '📤', num: '01', title: 'Upload Dokumen Skripsi', desc: 'Upload file PDF atau PPT skripsimu. Sistem mendukung dokumen hingga 50 halaman dengan ekstraksi teks otomatis dari semua bab.' },
  { icon: '🔬', num: '02', title: 'AI Mengekstrak & Membaca', desc: 'AI membaca seluruh isi dokumen per bab. Setiap paragraf, argumen, data, dan kesimpulan diproses untuk pemahaman menyeluruh.' },
  { icon: '⚖️', num: '03', title: 'Penilaian per Aspek', desc: 'Setiap dari 5 aspek dinilai secara independen berdasarkan standar yang mencerminkan ekspektasi dosen penguji sesungguhnya.' },
  { icon: '📊', num: '04', title: 'Skor 0–100 Ditampilkan', desc: 'Setiap aspek mendapat skor numerik 0–100 dengan visualisasi warna — hijau (kuat), kuning (perlu perhatian), merah (lemah).' },
  { icon: '💡', num: '05', title: 'Feedback & Rekomendasi', desc: 'Setiap skor disertai penjelasan spesifik mengapa nilai itu diberikan dan langkah konkret yang bisa kamu ambil untuk memperbaikinya.' },
]

const ASPECTS = [
  {
    icon: '📖',
    title: 'Latar Belakang',
    color: 'bg-indigo-50 border-indigo-200',
    labelColor: 'text-indigo-700',
    points: [
      'Relevansi dan urgensi masalah yang diteliti',
      'Kualitas identifikasi gap penelitian',
      'Dukungan data dan fakta terkini',
      'Kejelasan alur berpikir dari masalah ke solusi',
    ],
  },
  {
    icon: '❓',
    title: 'Rumusan Masalah',
    color: 'bg-purple-50 border-purple-200',
    labelColor: 'text-purple-700',
    points: [
      'Kejelasan dan spesifisitas rumusan masalah',
      'Keterukuran (measurability) setiap pertanyaan penelitian',
      'Konsistensi dengan latar belakang',
      'Cakupan yang tepat — tidak terlalu luas atau sempit',
    ],
  },
  {
    icon: '🔬',
    title: 'Metodologi',
    color: 'bg-blue-50 border-blue-200',
    labelColor: 'text-blue-700',
    points: [
      'Ketepatan pemilihan metode untuk menjawab rumusan masalah',
      'Justifikasi pemilihan metode vs alternatif',
      'Kualitas desain penelitian dan sampling',
      'Kejelasan prosedur pengumpulan dan analisis data',
    ],
  },
  {
    icon: '📈',
    title: 'Analisis & Pembahasan',
    color: 'bg-emerald-50 border-emerald-200',
    labelColor: 'text-emerald-700',
    points: [
      'Kedalaman analisis terhadap data yang dikumpulkan',
      'Konsistensi temuan dengan metodologi yang digunakan',
      'Kemampuan menjelaskan temuan anomali',
      'Hubungan hasil dengan teori dan penelitian sebelumnya',
    ],
  },
  {
    icon: '🎯',
    title: 'Kesimpulan & Saran',
    color: 'bg-amber-50 border-amber-200',
    labelColor: 'text-amber-700',
    points: [
      'Keterjawaban semua rumusan masalah',
      'Kesesuaian kesimpulan dengan temuan penelitian',
      'Spesifisitas dan relevansi saran yang diberikan',
      'Kontribusi penelitian terhadap bidang ilmu',
    ],
  },
]

/* ─── ANIMATED SCORE BAR ─────────────────────────────────── */
function ScoreBar({ score, delay }: { score: number; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const color = score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-400' : 'bg-red-400'
  const label = score >= 80 ? 'Kuat' : score >= 65 ? 'Cukup' : 'Perlu Perbaikan'
  const labelColor = score >= 80 ? 'text-emerald-600 bg-emerald-50' : score >= 65 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'

  return (
    <div ref={ref}>
      <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${score}%` } : { width: 0 }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${labelColor}`}>{label}</span>
        <span className={`text-[10px] font-bold ${score >= 80 ? 'text-emerald-600' : score >= 65 ? 'text-amber-500' : 'text-red-500'}`}>{score}/100</span>
      </div>
    </div>
  )
}

/* ─── PAGE ──────────────────────────────────────────────── */
export default function AnalisaPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-8 transition-colors">
              ← Kembali ke Beranda
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <span className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              📊 Analisa & Penilaian Skripsi
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Ketahui Kekuatan & Kelemahan<br />
            <span className="text-emerald-600">Skripsimu Sebelum Hari Sidang</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            AI menilai skripsimu secara objektif dari 5 aspek utama yang sama dengan kriteria penilaian dosen penguji. 
            Skor, feedback spesifik, dan saran perbaikan langsung keluar begitu analisa selesai.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/analysis" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105 shadow-md shadow-emerald-200">
              📊 Analisa Skripsimu Sekarang
            </Link>
            <a href="#alur" className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-medium text-base transition-all">
              Lihat Alur →
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-8 mt-12 flex-wrap">
            {[
              { num: '5', label: 'Aspek Penilaian' },
              { num: '0–100', label: 'Skala Skor' },
              { num: '2–5 mnt', label: 'Waktu Analisa' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-extrabold text-emerald-600">{s.num}</p>
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
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Alur Analisa Skripsi</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Dari upload hingga laporan skor — 5 langkah yang terjadi secara otomatis</p>
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
                <div className="flex-shrink-0 w-14 h-14 bg-white border-2 border-emerald-200 rounded-2xl flex flex-col items-center justify-center shadow-sm gap-0.5">
                  <span className="text-xl">{step.icon}</span>
                  <span className="text-[10px] font-bold text-emerald-500">{step.num}</span>
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

      {/* ── CONTOH HASIL ANALISA ─────────────────────────── */}
      <section className="py-20 px-6 bg-emerald-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Contoh Hasil Analisa</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Begini tampilan laporan yang akan kamu terima setelah analisa selesai</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Score card */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="bg-emerald-600 px-5 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">📊</div>
                    <div>
                      <p className="text-white text-sm font-semibold">Hasil Analisa Skripsi</p>
                      <p className="text-emerald-200 text-xs">Dinilai AI per aspek</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.p
                      className="text-white text-4xl font-extrabold"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      78
                    </motion.p>
                    <p className="text-emerald-200 text-xs">Overall</p>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {ANALYSIS_SCORES.map((item, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-gray-700 mb-2">{item.aspect}</p>
                      <ScoreBar score={item.score} delay={i * 0.12} />
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-gray-100 text-center">
                  <span className="text-[10px] text-gray-400">Analisa: Skripsi Analisis Sentimen ML · 10 Mei 2026</span>
                </div>
              </div>
            </motion.div>

            {/* Feedback cards */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Feedback per Aspek</h3>
              {ANALYSIS_SCORES.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                    item.score >= 80 ? 'bg-emerald-100 text-emerald-700' : item.score >= 65 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.score}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{item.aspect}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.feedback}</p>
                  </div>
                </motion.div>
              ))}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 mb-1">💡 Prioritas Perbaikan</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  Fokus pada Metodologi (68) terlebih dahulu — tambahkan komparasi metode dan justifikasi pemilihan. 
                  Ini kemungkinan menjadi pertanyaan utama dosen penguji.
                </p>
              </div>
            </motion.div>
          </div>

          <p className="text-[11px] text-gray-400 text-center mt-6">
            * Contoh demo. Skor dan feedback aktual berbasis isi dokumen skripsimu yang sebenarnya.
          </p>
        </div>
      </section>

      {/* ── 5 ASPEK DETAIL ───────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">5 Aspek yang Dinilai</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Rubrik penilaian dirancang mengikuti standar akademik umum yang digunakan dosen penguji
            </p>
          </motion.div>

          <div className="space-y-5">
            {ASPECTS.map((aspect, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`border rounded-2xl p-6 ${aspect.color}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{aspect.icon}</span>
                  <h3 className={`text-base font-bold ${aspect.labelColor}`}>{aspect.title}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aspect.points.map((point, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs">✓</span>
                      <p className="text-xs text-gray-600 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIPS ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Cara Optimal Menggunakan Analisa</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: '📅', step: 'Tahap 1', title: 'Setelah Draft Pertama', desc: 'Analisa draft awal untuk mendapat gambaran besar area yang paling perlu diperbaiki sebelum revisi besar.' },
              { icon: '🔄', step: 'Tahap 2', title: 'Setelah Revisi Besar', desc: 'Lakukan analisa ulang setelah revisi untuk memastikan skor naik dan feedback sudah teratasi dengan baik.' },
              { icon: '✅', step: 'Tahap 3', title: 'Final Check Sebelum Sidang', desc: 'Gunakan sebagai final check seminggu sebelum sidang — pastikan tidak ada aspek yang masih merah.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{item.step}</span>
                <h3 className="text-sm font-bold text-gray-900 mt-3 mb-2">{item.title}</h3>
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
          className="max-w-2xl mx-auto text-center bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-12 shadow-xl shadow-emerald-200"
        >
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-3xl font-bold text-white mb-4">Cek nilai skripsimu sekarang</h2>
          <p className="text-emerald-100 mb-8 leading-relaxed">
            Upload dan analisa skripsimu dalam hitungan menit.<br />
            Tahu persis apa yang perlu diperbaiki.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/analysis" className="inline-block bg-white hover:bg-gray-50 text-emerald-700 font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-md">
              📊 Analisa Sekarang →
            </Link>
            <Link href="/simulasi" className="inline-block bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium px-8 py-3.5 rounded-xl transition-all">
              Lihat Fitur Simulasi →
            </Link>
          </div>
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
