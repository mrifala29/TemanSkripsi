'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white pt-20 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Pilih Paket yang Tepat
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-2">
              Mulai dari Rp15.000 untuk satu fitur, atau Rp30.000 untuk akses penuh.
            </p>
            <p className="text-xs text-gray-400">
              Bayar sesuai kebutuhanmu, tanpa ikatan jangka panjang.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📚',
                name: 'Starter',
                desc: 'Mulai dari satu fitur',
                price: 'IDR 15.000',
                period: 'per fitur',
                features: ['✓ Akses 1 fitur pilihan', '✓ Upload 1 dokumen', '✓ Laporan hasil detail', '✓ Support 24 jam', '✓ Valid 7 hari'],
                color: 'bg-white border-gray-200',
                button: 'bg-indigo-600 text-white hover:bg-indigo-700',
              },
              {
                icon: '⭐',
                name: 'Pro',
                desc: 'Semua fitur, satu harga',
                price: 'IDR 30.000',
                period: 'akses penuh',
                features: ['✓ Semua 3 fitur (simulasi, analisa, plagiasi)', '✓ Unlimited upload per 30 hari', '✓ Laporan PDF & detail', '✓ Priority support', '✓ Akses fitur baru'],
                color: 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100',
                button: 'bg-indigo-600 text-white hover:bg-indigo-700',
                badge: true,
              },
              {
                icon: '🚀',
                name: 'Enterprise',
                desc: 'Untuk organisasi/serius',
                price: 'Hubungi kami',
                period: 'custom package',
                features: ['✓ Akses unlimited semua fitur', '✓ Dedicated support team', '✓ Custom integration', '✓ Laporan analytics lengkap', '✓ SLA guarantee'],
                color: 'bg-white border-gray-200',
                button: 'border border-gray-300 text-gray-600 hover:bg-gray-50',
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative border ${plan.color} rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1.5`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">REKOMENDASI</span>
                  </div>
                )}
                <div className="text-4xl mb-3">{plan.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-6">{plan.desc}</p>
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <p className="text-3xl font-extrabold text-gray-900">{plan.price}</p>
                  <p className="text-xs text-gray-400 mt-1">{plan.period}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="text-sm text-gray-600">{feature}</li>
                  ))}
                </ul>
                <Link
                  href={plan.name === 'Enterprise' ? '#' : '/auth/login'}
                  className={`block text-center w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all ${plan.button}`}
                >
                  {plan.name === 'Enterprise' ? 'Hubungi Sales' : 'Beli Sekarang'}
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-16"
          >
            <p className="text-sm text-gray-500 mb-3">
              ❓ Ada pertanyaan? <a href="#" className="text-indigo-600 font-semibold hover:underline">Hubungi kami</a>
            </p>
            <p className="text-xs text-gray-400">
              💳 Tersedia pembayaran dengan kartu kredit, debit, atau e-wallet
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Pertanyaan Umum</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Apa perbedaan antara Starter dan Pro?',
                a: 'Starter memberikan akses ke 1 fitur pilihan selama 7 hari. Pro memberikan akses ke semua 3 fitur (simulasi sidang, analisa, dan cek plagiasi) dengan unlimited upload selama 30 hari.',
              },
              {
                q: 'Apakah saya bisa upgrade paket?',
                a: 'Ya, Anda bisa upgrade kapan saja. Jika Anda sudah membeli Starter dan ingin upgrade ke Pro, kami akan memberikan kredit dari pembelian Starter Anda.',
              },
              {
                q: 'Bagaimana jika saya tidak puas?',
                a: 'Kami menjamin kepuasan Anda. Jika tidak puas dalam 24 jam pertama, kami akan memberikan refund penuh tanpa pertanyaan.',
              },
              {
                q: 'Apakah ada trial gratis?',
                a: 'Anda bisa mencoba setiap fitur dengan hasil demo gratis di halaman fitur masing-masing. Untuk hasil penuh dengan dokumen Anda sendiri, silakan beli paket.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-12 shadow-xl shadow-indigo-200"
        >
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-4">Mulai Sekarang</h2>
          <p className="text-indigo-100 mb-8">
            Pilih paket yang sesuai dan mulai persiapkan sidangmu dengan bantuan AI kami.
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-white hover:bg-gray-50 text-indigo-700 font-bold px-10 py-3.5 rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
          >
            Beli Paket Sekarang →
          </Link>
        </motion.div>
      </section>

      <footer className="py-8 px-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">
          © 2026 TemanSkripsi · <Link href="/" className="hover:text-indigo-600">Kembali ke Beranda</Link>
        </p>
      </footer>
    </div>
  )
}
