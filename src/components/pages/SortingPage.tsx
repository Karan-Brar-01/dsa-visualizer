'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/pages/SortingPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { SortingCanvas } from '@/components/canvas/SortingCanvas'
import { SortingOperationPanel } from '@/components/controls/SortingOperationPanel'
import { SortingStepController } from '@/components/controls/SortingStepController'
import { useSortingStore, selectors } from '@/stores/sortingStore'
import { useSortingSequencer } from '@/hooks/useSortingSequencer'
import type { SortAlgorithm } from '@/stores/sortingStore'

interface SortingPageProps {
  algorithm: SortAlgorithm
}

export function SortingPage({ algorithm }: SortingPageProps) {
  const isPlaying = useSortingStore(selectors.isPlaying)
  const steps     = useSortingStore((s) => s.steps)
  const currentStep = useSortingStore(selectors.currentStep)
  const currentStepIndex = useSortingStore(selectors.currentStepIndex)
  const log       = useSortingStore(selectors.operationLog)
  const currentArray = useSortingStore(selectors.currentArray)

  const isFullscreen = useUIStore((s) => s.isFullscreen)
  const setAlgorithm = useSortingStore((s) => s.setAlgorithm)
  const { play, pause, stepForward, stepBack } = useSortingStore(selectors.actions)

  // Set algorithm on mount and when it changes
  useEffect(() => {
    setAlgorithm(algorithm)
  }, [algorithm, setAlgorithm])

  // Drive playback
  useSortingSequencer()

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return
      switch (e.code) {
        case 'Space': e.preventDefault(); if (steps.length > 0) { isPlaying ? pause() : play() }; break
        case 'ArrowRight': e.preventDefault(); if (!isPlaying && steps.length > 0) stepForward(); break
        case 'ArrowLeft': e.preventDefault(); if (!isPlaying && steps.length > 0) stepBack(); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isPlaying, play, pause, stepForward, stepBack, steps])

  return (
    <div className={`flex flex-col ${isFullscreen ? 'flex-1 h-full w-full relative' : 'h-[calc(100dvh-3.5rem)] md:h-full overflow-y-auto md:overflow-hidden'}`}>
      {/* Top Controls Bar */}
      <header
        className={
          isFullscreen
            ? 'absolute bottom-4 pb-[env(safe-area-inset-bottom)] left-0 right-0 z-50 flex flex-col items-center justify-center px-2 pointer-events-none'
            : 'flex-shrink-0 border-b border-[hsl(225,12%,18%)] bg-[hsl(225,18%,10%)] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10'
        }
      >
        <div className={isFullscreen ? 'flex flex-col md:flex-row items-center justify-center gap-1.5 bg-[hsl(225,18%,10%)]/95 backdrop-blur-md rounded-xl p-2 shadow-2xl border border-[hsl(225,12%,25%)] w-full max-w-[95vw] max-h-[30vh] overflow-y-auto' : 'w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4'}>
          <SortingOperationPanel algorithm={algorithm} />
          <SortingStepController algorithm={algorithm} />
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className={`relative bg-[hsl(225,20%,6%)] ${isFullscreen ? 'flex-1 h-full' : 'h-[60vh] min-h-[60vh] md:h-auto md:min-h-0 md:flex-1 flex-shrink-0'}`}>
        <SortingCanvas />
      </main>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-mono text-[hsl(210,8%,45%)]">{label}</span>
    </div>
  )
}
