'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { auth as authApi } from '@/lib/api'
import { setAuth } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('Semua kolom wajib diisi.')
      return
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await authApi.register(name, email, password)
      setAuth(res.data.token, res.data.user)
      router.push('/documents')
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center">
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

      <div className="relative z-10 w-full flex items-center justify-center px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 max-w-5xl">
          {/* Form - Left side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 w-full max-w-sm"
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-base">T</div>
                <span className="font-bold text-gray-900 text-xl">TemanSkripsi</span>
              </Link>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Buat akun baru</h1>
            <p className="text-gray-500 text-sm mb-8 text-center">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">Masuk di sini</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-all hover:scale-[1.01] shadow-md shadow-indigo-200"
              >
                {loading ? 'Membuat akun...' : 'Daftar Gratis →'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Dengan mendaftar, kamu menyetujui{' '}
                <a href="#" className="underline hover:text-gray-600">Syarat & Ketentuan</a> TemanSkripsi.
              </p>
            </div>
          </motion.div>

          {/* Mascot - Right side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="hidden lg:flex flex-shrink-0 w-56 lg:w-64"
          >
            <motion.div
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image src="/mascot.png" alt="Maskot" width={280} height={280} className="w-full drop-shadow-2xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
