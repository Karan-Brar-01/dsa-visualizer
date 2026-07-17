'use client'
import { useEffect } from 'react'

import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useUIStore } from '@/stores/uiStore'
import { Minimize2 } from 'lucide-react'
import { useVisualViewport } from '@/hooks/useVisualViewport'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const isFullscreen = useUIStore((s) => s.isFullscreen)
  const { height, offsetTop } = useVisualViewport()

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
    <div className="fixed left-0 right-0 flex bg-[hsl(225,20%,6%)] flex-col md:flex-row" style={{ height, top: offsetTop }}>
      {/* Left sidebar — navigation */}
      {!isFullscreen && (
        <div className="hidden md:flex">
          <Sidebar />
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden w-full relative">
        {!isFullscreen && <TopBar />}
        <main className="flex flex-col flex-1 overflow-hidden relative">
          {children}
        </main>
        
        {isFullscreen && (
          <button
            onClick={() => useUIStore.getState().toggleFullscreen()}
            className="absolute top-4 right-4 z-50 flex items-center gap-2 p-2 px-3 md:hidden bg-[hsl(225,18%,10%)]/80 backdrop-blur-md border border-[hsl(225,12%,25%)] rounded-xl text-[hsl(210,8%,65%)] hover:text-white shadow-xl pointer-events-auto transition-colors text-xs font-medium"
            title="Exit Fullscreen"
          >
            <Minimize2 className="w-4 h-4" />
            Exit Fullscreen
          </button>
        )}
      </div>
    </div>
  )
}
