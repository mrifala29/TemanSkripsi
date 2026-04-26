'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'

type Message = {
  id: string
  role: 'ai' | 'user'
  content: string
  turn_index: number
}

const STEPS = [
  { num: '01', icon: '📤', title: 'Upload Skripsi', desc: 'Upload file PDF atau PPT skripsimu' },
  { num: '02', icon: '🤖', title: 'AI Membaca', desc: 'AI menganalisis seluruh isi dokumen' },
  { num: '03', icon: '💬', title: 'Simulasi Dimulai', desc: 'AI bertanya seperti dosen penguji kritis' },
  { num: '04', icon: '🏆', title: 'Evaluasi Jawaban', desc: 'Lihat area mana perlu persiapan lebih' },
]

const CHAT_DEMO = [
  { role: 'ai', text: 'Bagaimana kamu menentukan populasi dan sampel penelitianmu? Jelaskan dasar pemilihannya.' },
  { role: 'user', text: 'Saya menggunakan purposive sampling dengan 50 responden mahasiswa tingkat akhir.' },
  { role: 'ai', text: 'Mengapa 50 responden? Apakah ada rujukan literatur yang mendukung jumlah tersebut?' },
  { role: 'user', text: 'Berdasarkan Roscoe (1975), ukuran sampel 30–500 layak untuk penelitian kuantitatif.' },
]

function SessionsLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 pt-16 pb-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Simulasi Sidang
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Latihan Sidang<br />
              <span className="text-indigo-200">dengan AI Dosen Penguji</span>
            </h1>
            <p className="text-indigo-100 text-base mb-8 leading-relaxed max-w-lg">
              Satu pertanyaan per giliran — persis seperti suasana sidang nyata. AI bertanya kritis berdasarkan isi skripsimu.
            </p>
            <Link href="/auth/login" className="inline-block bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-all hover:scale-105 shadow-lg">
              🚀 Mulai Simulasi Sekarang
            </Link>
          </div>
          <div className="flex-shrink-0 w-44 lg:w-52 opacity-90">
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <Image src="/mascot.png" alt="Maskot" width={260} height={260} className="w-full drop-shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Cara Kerja Simulasi</h2>
            <p className="text-gray-500">4 langkah mudah untuk mulai latihan sidang</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-indigo-100" />
            {STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center relative">
                <div className="w-16 h-16 bg-white border-2 border-indigo-200 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 gap-0.5 relative z-10 shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-indigo-500 font-bold text-xs">{s.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mock Demo */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Seperti Ini Tampilannya</h2>
            <p className="text-gray-400 text-sm">Contoh sesi simulasi sidang skripsi</p>
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
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
            <div className="p-4 space-y-3 bg-gray-50">
              {CHAT_DEMO.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[84%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-700 shadow-sm rounded-bl-sm'}`}>
                    {msg.role === 'ai' && <p className="text-[10px] text-indigo-500 font-semibold mb-1">🎓 Dosen Penguji</p>}
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
              <div className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-xs text-gray-400">Ketik jawabanmu...</div>
              <Link href="/auth/login" className="bg-indigo-600 text-white rounded-xl px-4 py-2.5 text-xs font-semibold">Mulai</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upload Document */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Skripsimu</h2>
            <p className="text-gray-400 text-sm">Mulai simulasi sidang dalam beberapa langkah</p>
          </div>

          {/* Upload Form */}
          <form className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Dokumen Skripsi</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors">
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm text-gray-500 mb-4">PDF atau PPTX — maks. 20 MB</p>
              <label
                htmlFor="file-upload-sessions"
                className="cursor-pointer inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Pilih File
              </label>
              <input
                type="file"
                id="file-upload-sessions"
                accept=".pdf,.ppt,.pptx"
                className="hidden"
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold py-3 rounded-xl transition-colors"
            >
              Mulai Simulasi
            </button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-10 shadow-xl shadow-indigo-200">
          <div className="text-4xl mb-3">🎓</div>
          <h2 className="text-2xl font-bold text-white mb-3">Siap latihan sidang?</h2>
          <p className="text-indigo-100 text-sm mb-6">Upload skripsimu dan mulai simulasi dengan AI dosen penguji.</p>
          <Link href="/auth/login" className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-all hover:scale-105">
            Mulai Simulasi →
          </Link>
        </motion.div>
      </section>

      <footer className="py-6 px-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2026 TemanSkripsi · <Link href="/" className="hover:text-indigo-600">Kembali ke Beranda</Link></p>
      </footer>
    </div>
  )
}

function ChatSession() {
  const searchParams = useSearchParams()
  const docId = searchParams.get('doc')
  const sessionId = searchParams.get('session')

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<string | null>(sessionId)
  const [starting, setStarting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function startSession() {
    if (!docId) return
    setStarting(true)
    try {
      const res = await api.createSession({ document_id: docId })
      const sid = res.data?.id || res.id
      setCurrentSession(sid)
      // First AI question will come from backend
      const msgRes = await api.getMessages(sid)
      setMessages(msgRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setStarting(false)
    }
  }

  async function sendMessage() {
    if (!input.trim() || !currentSession || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      turn_index: prev.length + 1
    }])

    setLoading(true)
    try {
      const res = await api.sendMessage(currentSession, userMsg)
      const aiMsg = res.data?.ai_message || res.ai_message
      if (aiMsg) {
        setMessages(prev => [...prev, {
          id: aiMsg.id || Date.now().toString() + '_ai',
          role: 'ai',
          content: aiMsg.content,
          turn_index: aiMsg.turn_index
        }])
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_err',
        role: 'ai',
        content: '⚠️ Maaf, terjadi error. Coba lagi.',
        turn_index: 0
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!currentSession) {
    if (!docId) return <SessionsLanding />
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-5xl mb-4">🎤</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Simulasi Sidang</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          AI akan bertindak sebagai dosen penguji yang kritis. Jawab setiap pertanyaan sebaik mungkin.
        </p>
        <button
          onClick={startSession}
          disabled={starting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
        >
          {starting ? 'Mempersiapkan...' : '🚀 Mulai Sekarang'}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-80px)]">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">🎤 Simulasi Sidang</h1>
        <p className="text-sm text-gray-400">Session ID: {currentSession.slice(0, 8)}...</p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>Menunggu AI memulai pertanyaan pertama...</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-50 text-gray-800 border border-gray-200'
            }`}>
              {msg.role === 'ai' && (
                <p className="text-xs text-gray-400 mb-1">🎓 Dosen Penguji</p>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">🎓 Dosen Penguji</p>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ketik jawaban kamu..."
          disabled={loading}
          className="flex-1 bg-white border border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-medium text-sm transition-colors"
        >
          Kirim
        </button>
      </div>
    </div>
  )
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 p-8">Loading...</div>}>
      <ChatSession />
    </Suspense>
  )
}
