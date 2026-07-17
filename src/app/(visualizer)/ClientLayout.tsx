'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useUIStore } from '@/stores/uiStore'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const isFullscreen = useUIStore((s) => s.isFullscreen)

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(225,20%,6%)] flex-col md:flex-row">
      {/* Left sidebar — navigation */}
      {!isFullscreen && (
        <div className="hidden md:flex">
          <Sidebar />
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        {!isFullscreen && <TopBar />}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
