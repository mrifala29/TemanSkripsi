'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Email dan password wajib diisi.')
      return
    }
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    window.location.href = '/sessions'
  }

  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8 md:py-12">
      {/* Constellation SVG background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <line x1="8%" y1="12%" x2="22%" y2="28%" stroke="rgba(99,102,241,0.08)" strokeWidth="1" />
        <line x1="22%" y1="28%" x2="14%" y2="55%" stroke="rgba(99,102,241,0.06)" strokeWidth="1" />
        <line x1="38%" y1="18%" x2="52%" y2="32%" stroke="rgba(99,102,241,0.08)" strokeWidth="1" />
        <line x1="52%" y1="32%" x2="48%" y2="52%" stroke="rgba(99,102,241,0.06)" strokeWidth="1" />
        <line x1="75%" y1="58%" x2="88%" y2="70%" stroke="rgba(99,102,241,0.08)" strokeWidth="1" />
        <line x1="88%" y1="15%" x2="75%" y2="32%" stroke="rgba(99,102,241,0.06)" strokeWidth="1" />
        <circle cx="8%" cy="12%" r="3" fill="rgba(99,102,241,0.15)" />
        <circle cx="22%" cy="28%" r="4" fill="rgba(99,102,241,0.18)" />
        <circle cx="38%" cy="18%" r="3.5" fill="rgba(99,102,241,0.12)" />
        <circle cx="52%" cy="32%" r="4" fill="rgba(99,102,241,0.15)" />
        <circle cx="75%" cy="32%" r="3.5" fill="rgba(99,102,241,0.12)" />
        <circle cx="88%" cy="15%" r="3" fill="rgba(99,102,241,0.10)" />
        <circle cx="75%" cy="58%" r="3.5" fill="rgba(99,102,241,0.12)" />
        <circle cx="88%" cy="70%" r="2.5" fill="rgba(99,102,241,0.10)" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Mascot - top center */}
        <div className="flex justify-center mb-6 md:mb-8">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 md:w-32"
          >
            <Image src="/mascot.png" alt="Maskot" width={128} height={128} className="w-full" />
          </motion.div>
        </div>

        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 md:w-9 h-8 md:h-9 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-extrabold text-sm md:text-base">T</div>
            <span className="font-bold text-gray-900 text-lg md:text-xl">TemanSkripsi</span>
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 text-center">Masuk ke akun</h1>
        <p className="text-gray-500 text-xs md:text-sm mb-6 md:mb-8 text-center">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="text-indigo-600 font-semibold hover:underline">Daftar gratis</Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
            />
          </div>

          {error && (
            <p className="text-xs md:text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5">{error}</p>
          )}

          <div className="flex items-center justify-between text-xs md:text-sm">
            <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600" />
              Ingat saya
            </label>
            <a href="#" className="text-indigo-600 hover:underline font-medium">Lupa password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 md:py-3 rounded-lg md:rounded-xl transition-all hover:scale-[1.01] shadow-md shadow-indigo-200 text-sm md:text-base"
          >
            {loading ? 'Masuk...' : 'Masuk →'}
          </button>
        </form>

        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100">
          <p className="text-[10px] md:text-xs text-gray-400 text-center">
            Dengan masuk, kamu menyetujui{' '}
            <a href="#" className="underline hover:text-gray-600">Syarat & Ketentuan</a> TemanSkripsi.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
