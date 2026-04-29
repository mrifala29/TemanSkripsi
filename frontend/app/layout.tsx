import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavbarController from '@/components/NavbarController'
import SidebarController from '@/components/SidebarController'

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
        <NavbarController />
        <SidebarController>
          {children}
        </SidebarController>
      </body>
    </html>
  )
}

