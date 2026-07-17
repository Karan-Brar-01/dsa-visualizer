'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/pages/HeapPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { HeapVisualizerCanvas } from '@/components/canvas/HeapVisualizerCanvas'
import { HeapOperationPanel } from '@/components/controls/HeapOperationPanel'
import { HeapStepController } from '@/components/controls/HeapStepController'
import { useHeapStore, selectors } from '@/stores/heapStore'
import { useAnimationSequencer } from '@/hooks/useAnimationSequencer'

export function HeapPage() {
  const isPlaying     = useHeapStore((s) => s.isPlaying)
  const playbackSpeed = useHeapStore((s) => s.playbackSpeed)
  const currentStep   = useHeapStore((s) => s.currentStep)
  const steps         = useHeapStore((s) => s.steps)
  const log           = useHeapStore(selectors.operationLog)
  const snapshot      = useHeapStore(selectors.snapshot)
  const heapType      = useHeapStore(selectors.heapType)

  const { applyStep, commitOperation, play, pause, stepForward, stepBack } =
    useHeapStore(selectors.actions)

  useAnimationSequencer({
    isPlaying,
    playbackSpeed,
    steps,
    currentStepIndex: currentStep?.stepIndex ?? -1,
    applyStep,
    commitOperation,
    pause,
  })

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

  const isFullscreen = useUIStore((s) => s.isFullscreen)

  return (
    <div className={`flex flex-col ${isFullscreen ? 'h-[100dvh] relative' : 'h-[calc(100dvh-3.5rem)] md:h-full overflow-y-auto md:overflow-hidden'}`}>
      {/* Top Controls Bar */}
      <header
        className={
          isFullscreen
            ? 'absolute bottom-4 pb-[env(safe-area-inset-bottom)] left-0 right-0 z-50 flex flex-col items-center justify-center px-4 pointer-events-none'
            : 'flex-shrink-0 border-b border-[hsl(225,12%,18%)] bg-[hsl(225,18%,10%)] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10'
        }
      >
        <div className={isFullscreen ? 'flex flex-col md:flex-row items-center justify-center gap-2 bg-[hsl(225,18%,10%)]/80 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-[hsl(225,12%,25%)] pointer-events-auto' : 'w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4'}>
          <HeapOperationPanel />
          <HeapStepController />
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className={`relative bg-[hsl(225,20%,6%)] ${isFullscreen ? 'flex-1 h-full' : 'h-[60vh] min-h-[60vh] md:h-auto md:min-h-0 md:flex-1 flex-shrink-0'}`}>
        <HeapVisualizerCanvas />
      </main>

    </div>
  )
}
