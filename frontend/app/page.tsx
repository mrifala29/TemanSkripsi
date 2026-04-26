'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const TYPING_TEXTS = [
  'Siap Menghadapi Sidang?',
  'Latihan Sekarang, Percaya Diri Nanti.',
  'AI Dosen Penguji — Kapan Saja.',
  'Nilai Skripsimu Sebelum Hari H.',
]

const FEATURES = [
  {
    icon: '🎤',
    title: 'Simulasi Sidang',
    desc: 'Chat interaktif dengan AI dosen penguji yang kritis. Satu pertanyaan per giliran — persis seperti suasana sidang nyata.',
    color: 'bg-indigo-50 border-indigo-100',
    iconBg: 'bg-indigo-100',
    tag: 'Fitur Utama',
    tagColor: 'bg-indigo-600 text-white',
    link: '/sessions',
  },
  {
    icon: '📊',
    title: 'Analisa & Penilaian',
    desc: 'Skor 0–100 per aspek: latar belakang, metodologi, analisis, konsistensi, hingga kesimpulan. Lengkap dengan saran perbaikan.',
    color: 'bg-emerald-50 border-emerald-100',
    iconBg: 'bg-emerald-100',
    tag: 'Skor Otomatis',
    tagColor: 'bg-emerald-600 text-white',
    link: '/analysis',
  },
  {
    icon: '🔍',
    title: 'Uji Kesamaan & Teks AI',
    desc: 'Estimasi persentase kemiripan teks antar dokumen dan deteksi seberapa banyak teks yang kemungkinan ditulis oleh AI per bab.',
    color: 'bg-amber-50 border-amber-100',
    iconBg: 'bg-amber-100',
    tag: 'Deteksi AI',
    tagColor: 'bg-amber-500 text-white',
    link: '/similarity',
  },
]

const FEATURE_STEPS: Record<string, { num: string; icon: string; title: string; desc: string }[]> = {
  simulasi: [
    { num: '01', icon: '📤', title: 'Upload Skripsi', desc: 'Upload file PDF atau PPT skripsimu' },
    { num: '02', icon: '🤖', title: 'AI Membaca', desc: 'AI menganalisis seluruh isi dokumen' },
    { num: '03', icon: '💬', title: 'Simulasi Dimulai', desc: 'AI bertanya satu per satu seperti dosen penguji' },
    { num: '04', icon: '🏆', title: 'Evaluasi Jawaban', desc: 'Lihat di mana kamu perlu lebih siap' },
  ],
  analisa: [
    { num: '01', icon: '📤', title: 'Upload Skripsi', desc: 'Upload file PDF atau PPT skripsimu' },
    { num: '02', icon: '🔬', title: 'AI Menganalisis', desc: 'AI menilai setiap aspek penulisan skripsi' },
    { num: '03', icon: '📊', title: 'Skor Keluar', desc: 'Skor 0–100 per aspek ditampilkan' },
    { num: '04', icon: '💡', title: 'Saran Perbaikan', desc: 'Perbaiki kelemahan sebelum hari sidang' },
  ],
  plagiasi: [
    { num: '01', icon: '📤', title: 'Upload Skripsi', desc: 'Upload file PDF atau PPT skripsimu' },
    { num: '02', icon: '🔍', title: 'Cek Kemiripan', desc: 'Sistem memeriksa kemiripan teks antar dokumen' },
    { num: '03', icon: '🤖', title: 'Deteksi Teks AI', desc: 'Estimasi persentase teks yang ditulis AI' },
    { num: '04', icon: '📋', title: 'Laporan Per Bab', desc: 'Detail kemiripan dan AI per bab' },
  ],
}

const TAB_CONFIG = [
  { key: 'simulasi', label: '🎤 Simulasi Sidang', activeClass: 'bg-indigo-600 text-white shadow-md' },
  { key: 'analisa', label: '📊 Analisa & Penilaian', activeClass: 'bg-emerald-600 text-white shadow-md' },
  { key: 'plagiasi', label: '🔍 Cek Kesamaan & AI', activeClass: 'bg-amber-500 text-white shadow-md' },
]

const TAB_COLORS: Record<string, { border: string; num: string; line: string }> = {
  simulasi: { border: 'border-indigo-200', num: 'text-indigo-500', line: 'bg-indigo-100' },
  analisa: { border: 'border-emerald-200', num: 'text-emerald-500', line: 'bg-emerald-100' },
  plagiasi: { border: 'border-amber-200', num: 'text-amber-500', line: 'bg-amber-100' },
}

const ANALYSIS_SCORES = [
  { aspect: 'Latar Belakang', score: 82 },
  { aspect: 'Rumusan Masalah', score: 75 },
  { aspect: 'Metodologi', score: 68 },
  { aspect: 'Analisis & Pembahasan', score: 85 },
  { aspect: 'Kesimpulan', score: 79 },
]

const SIMILARITY_CHAPTERS = [
  { chapter: 'BAB I – Pendahuluan', similarity: 12, ai: 15 },
  { chapter: 'BAB II – Tinjauan Pustaka', similarity: 28, ai: 35 },
  { chapter: 'BAB III – Metodologi', similarity: 10, ai: 18 },
  { chapter: 'BAB IV – Hasil & Pembahasan', similarity: 14, ai: 20 },
]

const CHAT_DEMO = [
  { role: 'ai', text: 'Bagaimana kamu menentukan populasi dan sampel penelitianmu? Jelaskan dasar pemilihannya.' },
  { role: 'user', text: 'Saya menggunakan purposive sampling dengan 50 responden dari kalangan mahasiswa tingkat akhir.' },
  { role: 'ai', text: 'Mengapa 50 responden? Apakah ada rujukan literatur yang mendukung jumlah tersebut?' },
]

export default function Home() {
  const [textIndex, setTextIndex] = useState(0)
  const [chatIndex, setChatIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('simulasi')

  useEffect(() => {
    const t = setInterval(() => setTextIndex(i => (i + 1) % TYPING_TEXTS.length), 3200)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setChatIndex(i => (i < CHAT_DEMO.length ? i + 1 : i)), 1800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-white pt-12 pb-28 px-6 min-h-[88vh] flex items-center">
        {/* Background dots */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.07)_1px,transparent_0)] bg-[size:36px_36px]" />

        {/* Mascot — animated right-side decoration */}
        <div className="absolute right-0 bottom-0 w-64 lg:w-80 xl:w-[400px] pointer-events-none select-none">
          <motion.div
            animate={{ y: [0, -22, 0], rotate: [-3, 2.5, -3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'bottom center' }}
          >
            <Image
              src="/mascot.png"
              alt="Maskot TemanSkripsi"
              width={400}
              height={400}
              priority
              className="w-full select-none"
            />
          </motion.div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              Powered by Google Gemini AI
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-3 leading-tight tracking-tight"
          >
            Teman<span className="text-indigo-600">Skripsi</span>
          </motion.h1>

          <div className="h-9 flex items-center mb-5">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="text-xl lg:text-2xl font-semibold text-indigo-600"
              >
                {TYPING_TEXTS[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-lg max-w-lg mb-10 leading-relaxed"
          >
            Latihan sidang skripsi dengan AI sebagai dosen penguji kritis.
            Simulasi, analisa mendalam, dan uji kesamaan teks — semua dalam satu platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/sessions"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-105 shadow-md shadow-indigo-200"
            >
              🚀 Mulai Sekarang — Gratis
            </Link>
            <a
              href="#fitur"
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-medium text-base transition-all duration-200"
            >
              Lihat Fitur →
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-5 mt-8 justify-center"
          >
            {['✓ Gratis selamanya', '✓ Tanpa daftar dulu', '✓ Hasil instan'].map((t, i) => (
              <span key={i} className="text-xs text-gray-400 font-medium">{t}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fitur" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              3 Fitur Utama
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Semua yang kamu butuhkan untuk persiapan sidang yang maksimal.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={f.link}
                  className={`group block bg-white border ${f.color} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg h-full`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${f.iconBg} rounded-xl flex items-center justify-center text-2xl`}>
                      {f.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${f.tagColor}`}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  <p className="mt-5 text-indigo-600 text-xs font-semibold group-hover:underline">Mulai →</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Cara Kerja</h2>
            <p className="text-gray-500">Pilih fitur untuk lihat alurnya</p>
          </motion.div>

          {/* Tab switcher */}
          <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? tab.activeClass
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
                <div className={`hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 ${TAB_COLORS[activeTab].line}`} />
                {FEATURE_STEPS[activeTab].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="text-center relative"
                  >
                    <div className={`w-16 h-16 bg-white border-2 ${TAB_COLORS[activeTab].border} rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 gap-0.5 relative z-10 shadow-sm`}>
                      <span className="text-xl">{s.icon}</span>
                      <span className={`${TAB_COLORS[activeTab].num} font-bold text-xs`}>{s.num}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{s.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── AI BEHAVIOR — redesigned with mock chat ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                AI Dosen Penguji
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-5 mb-4 leading-tight">
                Kritis. Mendalam.<br />Seperti Aslinya.
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                AI TemanSkripsi bukan asisten yang ramah — ia adalah dosen penguji yang sesungguhnya.
                Setiap pertanyaan dirancang untuk menguji pemahaman, bukan sekadar mengonfirmasi.
              </p>
              <div className="space-y-5">
                {[
                  { icon: '🎯', title: 'Pertanyaan Kontekstual', desc: 'Berdasarkan isi dokumen skripsimu, bukan template umum' },
                  { icon: '🔁', title: 'Penggalian Mendalam', desc: 'Jawaban lemah? AI langsung gali lebih dalam' },
                  { icon: '📋', title: 'Alur Terstruktur', desc: 'Latar belakang → rumusan masalah → metode → hasil' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
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

            {/* Right: mock chat UI */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
            >
              {/* Chat header */}
              <div className="bg-indigo-600 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🎓</div>
                <div>
                  <p className="text-white text-sm font-semibold">Dosen Penguji AI</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-indigo-200 text-xs">Online · Siap menguji</p>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="p-4 space-y-3 bg-gray-50 min-h-[220px]">
                {CHAT_DEMO.slice(0, chatIndex).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[84%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
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
                {chatIndex > 0 && chatIndex < CHAT_DEMO.length && (
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
              </div>

              {/* Mock input bar */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
                <div className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-xs text-gray-400">
                  Ketik jawabanmu...
                </div>
                <div className="bg-indigo-600 text-white rounded-xl px-4 py-2.5 text-xs font-semibold cursor-default">
                  Kirim
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ANALISA & PENILAIAN ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left on desktop: score card mock */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden order-2 lg:order-1"
            >
              <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">📊</div>
                  <div>
                    <p className="text-white text-sm font-semibold">Hasil Analisa Skripsi</p>
                    <p className="text-emerald-200 text-xs">Dinilai AI per aspek</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-3xl font-extrabold">78</p>
                  <p className="text-emerald-200 text-xs">Overall Score</p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-gray-50">
                {ANALYSIS_SCORES.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-700 font-medium">{item.aspect}</span>
                      <span className="text-xs font-bold text-emerald-600">{item.score}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${item.score >= 80 ? 'bg-emerald-500' : item.score >= 65 ? 'bg-amber-400' : 'bg-red-400'}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-white">
                <p className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5">💡</span>
                  <span>Metodologi perlu diperkuat — tambahkan justifikasi pemilihan metode penelitian</span>
                </p>
              </div>
            </motion.div>

            {/* Right on desktop: info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                Analisa & Penilaian
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-5 mb-4 leading-tight">
                Objektif. Menyeluruh.<br />Per Aspek.
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                AI menilai skripsimu dari 5 aspek utama — mulai dari latar belakang, metodologi, hingga kesimpulan. Skor dan saran langsung keluar setelah analisa selesai.
              </p>
              <div className="space-y-5">
                {[
                  { icon: '📏', title: '5 Aspek Penilaian', desc: 'Latar belakang, metodologi, analisis, konsistensi, kesimpulan' },
                  { icon: '🎯', title: 'Skor 0–100 per Aspek', desc: 'Nilai objektif berbasis isi dokumenmu, bukan template umum' },
                  { icon: '📝', title: 'Saran Perbaikan Detail', desc: 'Tahu persis apa yang harus diperbaiki sebelum hari sidang' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
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

      {/* ── CEK KESAMAAN & AI ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                Cek Kesamaan & Teks AI
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-5 mb-4 leading-tight">
                Transparan. Cepat.<br />Per Bab.
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                Estimasi kemiripan teks dan deteksi konten yang kemungkinan ditulis AI — ditampilkan per bab agar kamu tahu persis di mana yang perlu diperhatikan.
              </p>
              <div className="space-y-5">
                {[
                  { icon: '📐', title: 'Estimasi Kemiripan Teks', desc: 'Persentase kemiripan antar dokumen, per bab' },
                  { icon: '🤖', title: 'Deteksi Teks AI', desc: 'Estimasi seberapa banyak teks yang kemungkinan ditulis AI' },
                  { icon: '⚠️', title: 'Laporan Transparan', desc: 'Estimasi untuk deteksi dini — bukan pengganti Turnitin' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
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

            {/* Right: similarity report mock */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
            >
              <div className="bg-amber-500 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🔍</div>
                <div>
                  <p className="text-white text-sm font-semibold">Laporan Kesamaan & AI</p>
                  <p className="text-amber-100 text-xs">Analisa per bab</p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
                <div className="px-5 py-4 text-center">
                  <p className="text-2xl font-extrabold text-gray-900">18%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Estimasi Kemiripan</p>
                </div>
                <div className="px-5 py-4 text-center">
                  <p className="text-2xl font-extrabold text-gray-900">22%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Estimasi Teks AI</p>
                </div>
              </div>
              <div className="p-5 space-y-4 bg-gray-50">
                {SIMILARITY_CHAPTERS.map((ch, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-700 font-medium">{ch.chapter}</span>
                      <div className="flex gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ch.similarity <= 15 ? 'text-emerald-700 bg-emerald-50' : ch.similarity <= 30 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}>
                          {ch.similarity}% mirip
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ch.ai <= 20 ? 'text-emerald-700 bg-emerald-50' : ch.ai <= 40 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}>
                          {ch.ai}% AI
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${ch.similarity <= 15 ? 'bg-emerald-500' : ch.similarity <= 30 ? 'bg-amber-400' : 'bg-red-500'}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(ch.similarity * 2.5, 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: i * 0.1 }}
                        />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${ch.ai <= 20 ? 'bg-emerald-500' : ch.ai <= 40 ? 'bg-amber-400' : 'bg-red-500'}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(ch.ai * 2.5, 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: i * 0.1 + 0.05 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-white">
                <p className="text-[10px] text-gray-400">
                  ⚠️ Hasil merupakan estimasi. Bukan pengganti Turnitin atau alat deteksi AI profesional.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="py-20 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-12 shadow-xl shadow-indigo-200"
        >
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-3xl font-bold text-white mb-4">Jangan tunda persiapanmu</h2>
          <p className="text-indigo-100 mb-8 leading-relaxed">
            Mulai latihan sidang sekarang dengan AI dosen penguji.<br />
            Gratis, tanpa perlu daftar dulu.
          </p>
          <Link
            href="/sessions"
            className="inline-block bg-white hover:bg-gray-50 text-indigo-700 font-bold px-10 py-3.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
          >
            Mulai Sekarang →
          </Link>
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
