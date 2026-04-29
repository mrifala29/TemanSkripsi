'use client'

import { usePathname } from 'next/navigation'
import AppSidebar from './AppSidebar'

const APP_ROUTES = ['/documents', '/sessions', '/analysis', '/similarity']

export default function SidebarController({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isApp = APP_ROUTES.some((r) => pathname.startsWith(r))

  if (isApp) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 ml-56 min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    )
  }

  return <main>{children}</main>
}
