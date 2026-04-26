import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TemanSkripsi — Simulator Sidang AI',
  description: 'Latihan sidang skripsi dengan AI dosen penguji',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-white text-gray-900 min-h-screen`}>
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              🎓 Teman<span className="text-indigo-600">Skripsi</span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/sessions" className="text-gray-500 hover:text-indigo-600 transition-colors font-medium">
                Simulasi
              </Link>
              <Link href="/analysis" className="text-gray-500 hover:text-indigo-600 transition-colors font-medium">
                Analisa
              </Link>
              <Link href="/similarity" className="text-gray-500 hover:text-indigo-600 transition-colors font-medium">
                Plagiasi
              </Link>
              <Link href="/auth/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors">
                Login
              </Link>
            </div>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
