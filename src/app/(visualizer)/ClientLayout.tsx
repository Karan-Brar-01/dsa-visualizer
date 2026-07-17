'use client'
import { useEffect } from 'react'

import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useUIStore } from '@/stores/uiStore'
import { useVisualViewport } from '@/hooks/useVisualViewport'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const isFullscreen = useUIStore((s) => s.isFullscreen)
  const viewportHeight = useVisualViewport()

  // iOS Safari keyboard bug fix: when an input loses focus, the page might stay scrolled
  useEffect(() => {
    const handleFocusOut = (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') {
        setTimeout(() => {
          window.scrollTo(0, 0)
          document.body.scrollTop = 0
        }, 100)
      }
    }
    document.addEventListener('focusout', handleFocusOut)
    return () => document.removeEventListener('focusout', handleFocusOut)
  }, [])


  return (
    <div className="fixed inset-0 flex bg-[hsl(225,20%,6%)] flex-col md:flex-row" style={{ height: viewportHeight }}>
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
