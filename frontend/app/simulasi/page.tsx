'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'

/* ─── MOCK DATA ────────────────────────────────────────── */

const CHAT_DEMO = [
  { role: 'ai',   text: 'Sebelum kita mulai, coba jelaskan secara singkat apa kontribusi utama skripsimu terhadap bidang yang kamu teliti.' },
  { role: 'user', text: 'Skripsi saya membahas implementasi machine learning untuk klasifikasi sentimen ulasan produk berbahasa Indonesia.' },
  { role: 'ai',   text: 'Bagaimana kamu memilih algoritma klasifikasi yang digunakan? Apakah kamu membandingkan beberapa model sebelum menentukan pilihan akhir?' },
  { role: 'user', text: 'Ya, saya membandingkan Naive Bayes, SVM, dan BERT. BERT memberikan akurasi tertinggi di 91.3%.' },
  { role: 'ai',   text: 'Mengapa akurasi BERT yang lebih tinggi tidak otomatis menjadikannya pilihan terbaik? Pertimbangkan aspek efisiensi komputasi dan kebutuhan deployment-nya.' },
  { role: 'user', text: 'Betul, BERT membutuhkan resource komputasi yang jauh lebih besar. Untuk deployment skala kecil, SVM bisa menjadi alternatif yang lebih efisien.' },
  { role: 'ai',   text: 'Bagus. Lalu bagaimana kamu menangani ketidakseimbangan kelas (class imbalance) dalam dataset ulasan produk yang kamu gunakan?' },
]

const SAMPLE_QUESTIONS = [
  { category: 'Latar Belakang', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', questions: [
    'Mengapa masalah yang kamu angkat relevan untuk diteliti saat ini?',
    'Apa yang membedakan penelitianmu dengan penelitian sebelumnya?',
    'Bagaimana kondisi gap penelitian yang kamu identifikasi?',
  ]},
  { category: 'Metodologi', color: 'bg-purple-50 border-purple-200 text-purple-800', questions: [
    'Mengapa kamu memilih metode ini dibanding alternatif yang ada?',
    'Bagaimana cara kamu memastikan validitas data penelitian?',
    'Apa keterbatasan metode yang kamu gunakan dan bagaimana mengatasinya?',
  ]},
  { category: 'Hasil & Analisis', color: 'bg-blue-50 border-blue-200 text-blue-800', questions: [
    'Apakah hasil penelitianmu konsisten dengan hipotesis awal?',
    'Bagaimana kamu menjelaskan temuan yang anomali atau tidak terduga?',
    'Implikasi praktis apa yang bisa diambil dari hasil penelitianmu?',
  ]},
  { category: 'Kesimpulan', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', questions: [
    'Apakah kesimpulanmu sudah menjawab semua rumusan masalah?',
    'Rekomendasi apa yang kamu berikan untuk penelitian selanjutnya?',
    'Bagaimana kontribusi penelitianmu terhadap pengembangan ilmu?',
  ]},
]

const FLOW_STEPS = [
  { icon: '📤', num: '01', title: 'Upload Dokumen Skripsi', desc: 'Upload file PDF atau PPT skripsimu. AI akan membaca dan memahami seluruh isi dokumen — mulai dari BAB I hingga daftar pustaka.' },
  { icon: '🧠', num: '02', title: 'AI Memahami Konteks', desc: 'AI mengekstrak topik utama, metodologi, argumen, dan temuan penelitianmu. Proses ini memastikan pertanyaan yang dihasilkan benar-benar relevan.' },
  { icon: '🎙️', num: '03', title: 'Sesi Simulasi Dimulai', desc: 'AI membuka sesi dengan pertanyaan pembuka, lalu mengikuti alur sidang nyata: latar belakang → metodologi → hasil → kesimpulan.' },
  { icon: '🔁', num: '04', title: 'Penggalian Bertahap', desc: 'Jawaban yang kurang mendalam langsung digali lebih jauh. AI memastikan setiap topik terjawab tuntas sebelum berlanjut ke pertanyaan berikutnya.' },
  { icon: '📋', num: '05', title: 'Feedback & Ringkasan', desc: 'Di akhir sesi, AI memberikan ringkasan performa: topik mana yang sudah kuat dan mana yang masih perlu diperdalam sebelum sidang.' },
]

/* ─── ANIMATED CHAT COMPONENT ───────────────────────────── */
function AnimatedChat() {
  const [shown, setShown] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    if (shown >= CHAT_DEMO.length) return
    const delay = shown === 0 ? 500 : shown % 2 === 0 ? 2200 : 1400
    const t = setTimeout(() => setShown(s => s + 1), delay)
    return () => clearTimeout(t)
  }, [inView, shown])

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🎓</div>
        <div>
          <p className="text-white text-sm font-semibold">Dosen Penguji AI</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-indigo-200 text-xs">Online · Sesi aktif</p>
          </div>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] bg-white/15 text-white px-2 py-1 rounded-full">Skripsi: Analisis Sentimen ML</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 bg-gray-50 h-[360px] overflow-y-auto">
        {CHAT_DEMO.slice(0, shown).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-white border border-gray-200 text-gray-700 shadow-sm rounded-bl-sm'
            }`}>
              {msg.role === 'ai' && (
                <p className="text-[10px] text-indigo-500 font-semibold mb-1">🎓 Dosen Penguji</p>
              )}
              {msg.text}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {shown > 0 && shown < CHAT_DEMO.length && shown % 2 !== 0 && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <p className="text-[10px] text-indigo-500 font-semibold mb-1.5">🎓 Dosen Penguji</p>
              <div className="flex gap-1">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {shown >= CHAT_DEMO.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-2">
            <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
              Sesi berlanjut... AI akan terus menggali lebih dalam
            </span>
          </motion.div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
        <div className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-xs text-gray-400">
          Ketik jawabanmu...
        </div>
        <button className="bg-indigo-600 text-white rounded-xl px-4 py-2.5 text-xs font-semibold">Kirim</button>
      </div>
    </div>
  )
}

/* ─── PAGE ──────────────────────────────────────────────── */
export default function SimulasiPage() {
  const [activeCategory, setActiveCategory] = useState(0)

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-8 transition-colors">
              ← Kembali ke Beranda
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <span className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              🎤 Simulasi Sidang
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Latihan Sidang Seperti<br />
            <span className="text-indigo-600">Aslinya — Kapan Saja</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            AI TemanSkripsi berperan sebagai dosen penguji yang sesungguhnya. Bukan asisten yang membantu —
            AI bertanya kritis, menggali setiap jawaban secara mendalam, dan memastikan kamu benar-benar memahami skripsimu sendiri.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sessions" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105 shadow-md shadow-indigo-200">
              🎤 Mulai Simulasi Sekarang
            </Link>
            <a href="#alur" className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-medium text-base transition-all">
              Lihat Alur →
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-8 mt-12 flex-wrap">
            {[
              { num: '~50', label: 'Pola Pertanyaan' },
              { num: '5', label: 'Aspek yang Diuji' },
              { num: '1:1', label: 'Pertanyaan per Giliran' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-extrabold text-indigo-600">{s.num}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ALUR LENGKAP ─────────────────────────────────── */}
      <section id="alur" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Alur Simulasi Sidang</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Dari upload dokumen hingga feedback akhir — ikuti 5 langkah berikut</p>
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
                <div className="flex-shrink-0 w-14 h-14 bg-white border-2 border-indigo-200 rounded-2xl flex flex-col items-center justify-center shadow-sm gap-0.5">
                  <span className="text-xl">{step.icon}</span>
                  <span className="text-[10px] font-bold text-indigo-500">{step.num}</span>
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

      {/* ── LIVE DEMO CHAT ────────────────────────────────── */}
      <section className="py-20 px-6 bg-indigo-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Lihat Langsung Cara Kerjanya</h2>
            <p className="text-gray-500">Demo animasi percakapan nyata dengan AI dosen penguji</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <AnimatedChat />
              <p className="text-[11px] text-gray-400 text-center mt-3">
                Animasi berjalan otomatis — menampilkan percakapan simulasi nyata
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900">Apa yang Terjadi di Balik Layar?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Setiap pertanyaan yang muncul bukan dari template generik — melainkan dibangun secara real-time 
                berdasarkan isi skripsimu, jawaban terakhirmu, dan peta argumentasi yang sedang dibangun AI.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: '🎯',
                    title: 'Pertanyaan 100% Berbasis Dokumenmu',
                    desc: 'AI membaca seluruh isi skripsimu sebelum sesi dimulai. Setiap pertanyaan merujuk langsung ke bab, halaman, atau argumen spesifik dalam dokumenmu.',
                  },
                  {
                    icon: '🔁',
                    title: 'Follow-up Adaptif',
                    desc: 'Jawaban yang kurang lengkap atau ambigu memicu pertanyaan pendalaman. AI memastikan setiap topik terjawab dengan tuntas sebelum melanjutkan.',
                  },
                  {
                    icon: '🧠',
                    title: 'Koneksi Lintas Bab',
                    desc: 'Seperti dosen penguji nyata, AI bisa menghubungkan temuan BAB IV dengan metodologi di BAB III untuk mengidentifikasi inkonsistensi.',
                  },
                  {
                    icon: '📊',
                    title: 'Penilaian Kualitas Jawaban',
                    desc: 'Di balik layar, AI menilai kedalaman, akurasi, dan konsistensi setiap jawabanmu untuk dirangkum di feedback akhir sesi.',
                  },
                  {
                    icon: '🏆',
                    title: 'Feedback Akhir Terstruktur',
                    desc: 'Setelah sesi selesai, kamu mendapat laporan: topik yang sudah dikuasai, area yang lemah, dan rekomendasi fokus belajar sebelum sidang.',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-9 h-9 bg-white border border-indigo-100 rounded-xl flex items-center justify-center text-base flex-shrink-0 shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CONTOH PERTANYAAN ─────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Contoh Pertanyaan AI</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Pertanyaan nyata yang mungkin diajukan AI berdasarkan isi skripsimu. Klik kategori untuk lihat contohnya.
            </p>
          </motion.div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {SAMPLE_QUESTIONS.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === i
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`border rounded-2xl p-6 space-y-4 ${SAMPLE_QUESTIONS[activeCategory].color}`}
            >
              <p className="text-sm font-bold mb-3">{SAMPLE_QUESTIONS[activeCategory].category}</p>
              {SAMPLE_QUESTIONS[activeCategory].questions.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-3 items-start"
                >
                  <span className="text-lg mt-0.5">🎓</span>
                  <p className="text-sm leading-relaxed">{q}</p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <p className="text-xs text-gray-400 text-center mt-4">
            * Pertanyaan aktual berbasis isi dokumen skripsimu — bukan template generik seperti di atas
          </p>
        </div>
      </section>

      {/* ── TIPS ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Tips Maksimalkan Simulasi</h2>
            <p className="text-gray-500">Ikuti tips ini untuk hasil latihan yang lebih efektif</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: '📖', tip: 'Baca ulang skripsimu sebelum simulasi', desc: 'Pastikan kamu familiar dengan isi dokumen yang diupload agar bisa menjawab dengan konteks yang tepat.' },
              { icon: '🔄', tip: 'Lakukan lebih dari 1 sesi', desc: 'Sesi pertama untuk identifikasi kelemahan. Sesi berikutnya untuk memperkuat area yang masih lemah.' },
              { icon: '✍️', tip: 'Catat pertanyaan yang sulit', desc: 'Setiap pertanyaan yang sulit kamu jawab adalah sinyal area yang perlu diperdalam sebelum sidang.' },
              { icon: '📝', tip: 'Jawab dengan lengkap dan terstruktur', desc: 'Jawab seperti di depan dosen nyata — tidak boleh terlalu singkat, tapi juga tidak melantur.' },
              { icon: '📅', tip: 'Mulai 2–3 minggu sebelum sidang', desc: 'Beri waktu cukup untuk revisi dan perbaikan setelah mendapat feedback dari simulasi.' },
              { icon: '🤝', tip: 'Diskusikan hasil dengan dosen pembimbing', desc: 'Bagikan feedback dari simulasi ke dosen pembimbing untuk validasi dan arahan lebih lanjut.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 items-start"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{item.tip}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
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
          className="max-w-2xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-12 shadow-xl shadow-indigo-200"
        >
          <div className="text-5xl mb-4">🎤</div>
          <h2 className="text-3xl font-bold text-white mb-4">Siap mulai latihan sidang?</h2>
          <p className="text-indigo-100 mb-8 leading-relaxed">
            Upload skripsimu dan mulai simulasi sekarang.<br />
            AI dosen penguji sudah menunggu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sessions" className="inline-block bg-white hover:bg-gray-50 text-indigo-700 font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-md">
              🚀 Mulai Simulasi →
            </Link>
            <Link href="/analisa" className="inline-block bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium px-8 py-3.5 rounded-xl transition-all">
              Lihat Fitur Analisa →
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
