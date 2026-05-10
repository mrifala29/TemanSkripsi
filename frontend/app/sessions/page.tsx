'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'

type Message = {
  id: string
  role: 'ai' | 'user'
  content: string
  turn_index: number
}

type Document = {
  id: string
  file_name: string
  title: string | null
  parse_status: string
}

function DocumentPicker() {
  const router = useRouter()
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getDocuments()
      .then(res => setDocs((res.data || []).filter((d: Document) => d.parse_status === 'done')))
      .catch(() => setError('Gagal memuat dokumen.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🎤 Simulasi Sidang</h1>
        <p className="text-gray-500 mt-1">Pilih dokumen untuk memulai sesi simulasi dengan AI dosen penguji.</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-gray-600 font-medium">Belum ada dokumen yang siap</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Upload dan proses dokumen skripsimu terlebih dahulu.</p>
          <Link href="/documents" className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            + Upload Dokumen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc, i) => (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/sessions?doc=${doc.id}`)}
              className="w-full text-left bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl px-5 py-4 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">📄</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{doc.title || doc.file_name}</p>
                  {doc.title && <p className="text-xs text-gray-400 truncate mt-0.5">{doc.file_name}</p>}
                </div>
                <span className="text-indigo-400 group-hover:text-indigo-600 transition-colors flex-shrink-0">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
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
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg, turn_index: prev.length + 1 }])
    setLoading(true)
    try {
      const res = await api.sendMessage(currentSession, userMsg)
      const aiMsg = res.data?.ai_message || res.ai_message
      if (aiMsg) {
        setMessages(prev => [...prev, { id: aiMsg.id || Date.now().toString() + '_ai', role: 'ai', content: aiMsg.content, turn_index: aiMsg.turn_index }])
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + '_err', role: 'ai', content: '⚠️ Maaf, terjadi error. Coba lagi.', turn_index: 0 }])
    } finally {
      setLoading(false)
    }
  }

  // No docId → show document picker
  if (!docId) return <DocumentPicker />

  // Has docId but no session → start prompt
  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="text-5xl mb-4">🎤</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Simulasi Sidang</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          AI akan bertindak sebagai dosen penguji yang kritis. Jawab setiap pertanyaan sebaik mungkin.
        </p>
        <div className="flex gap-3">
          <Link href="/sessions" className="px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
            ← Pilih Dokumen Lain
          </Link>
          <button
            onClick={startSession}
            disabled={starting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            {starting ? 'Mempersiapkan...' : '🚀 Mulai Simulasi'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">🎤 Simulasi Sidang</h1>
          <p className="text-xs text-gray-400">Session: {currentSession.slice(0, 8)}...</p>
        </div>
        <Link href="/sessions" className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
          ← Dokumen Lain
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>Menunggu AI memulai pertanyaan pertama...</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-800 border border-gray-200'
            }`}>
              {msg.role === 'ai' && <p className="text-xs text-gray-400 mb-1">🎓 Dosen Penguji</p>}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">🎓 Dosen Penguji</p>
              <div className="flex gap-1">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

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
