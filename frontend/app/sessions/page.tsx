'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

type Message = {
  id: string
  role: 'ai' | 'user'
  content: string
  turn_index: number
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-5xl mb-4">🎤</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Simulasi Sidang</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          AI akan bertindak sebagai dosen penguji yang kritis. Jawab setiap pertanyaan sebaik mungkin.
        </p>
        {docId ? (
          <button
            onClick={startSession}
            disabled={starting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
          >
            {starting ? 'Mempersiapkan...' : '🚀 Mulai Sekarang'}
          </button>
        ) : (
          <p className="text-red-500">Pilih dokumen terlebih dahulu dari halaman <a href="/documents" className="underline text-indigo-600">Dokumen</a>.</p>
        )}
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
