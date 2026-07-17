'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/pages/AVLPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { AVLVisualizerCanvas } from '@/components/canvas/AVLVisualizerCanvas'
import { AVLOperationPanel } from '@/components/controls/AVLOperationPanel'
import { AVLStepController } from '@/components/controls/AVLStepController'
import { AVLEducationalFooter } from '@/components/educational/AVLEducationalFooter'
import { useAVLStore, selectors } from '@/stores/avlStore'
import { useAnimationSequencer } from '@/hooks/useAnimationSequencer'

export function AVLPage() {
  const isFullscreen = useUIStore((s) => s.isFullscreen)
  const isPlaying     = useAVLStore(selectors.isPlaying)
  const playbackSpeed = useAVLStore(selectors.playbackSpeed)
  const currentStep   = useAVLStore(selectors.currentStep)
  const steps         = useAVLStore(state => state.steps)

  const { applyStep, commitOperation, play, pause, stepForward, stepBack } =
    useAVLStore(selectors.actions)

  useAnimationSequencer({
    isPlaying,
    playbackSpeed,
    steps,
    currentStepIndex: currentStep?.stepIndex ?? -1,
    applyStep,
    commitOperation,
    pause,
  })

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (steps.length > 0) { isPlaying ? pause() : play() }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (!isPlaying && steps.length > 0) stepForward()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (!isPlaying && steps.length > 0) stepBack()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, play, pause, stepForward, stepBack, steps])

  return (
    <div className={`flex flex-col ${isFullscreen ? 'flex-1 min-h-0 w-full relative' : 'h-[calc(100dvh-3.5rem)] md:h-full overflow-y-auto md:overflow-hidden'}`}>
      {/* Top Controls Bar */}
      <header
        className={
          isFullscreen
            ? 'flex-shrink-0 z-50 flex flex-col items-center justify-center px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 w-full'
            : 'flex-shrink-0 border-b border-[hsl(225,12%,18%)] bg-[hsl(225,18%,10%)] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10'
        }
      >
        <div className={isFullscreen ? 'flex flex-col md:flex-row items-center justify-center gap-1.5 bg-[hsl(225,18%,10%)]/95 backdrop-blur-md rounded-xl p-2 shadow-2xl border border-[hsl(225,12%,25%)] w-full max-w-[95vw] max-h-[30vh] overflow-y-auto' : 'w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4'}>
          <AVLOperationPanel />
          <AVLStepController />
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className={`relative bg-[hsl(225,20%,6%)] ${isFullscreen ? 'flex-1 h-full' : 'h-[60vh] min-h-[60vh] md:h-auto md:min-h-0 md:flex-1 flex-shrink-0'}`}>
        <AVLVisualizerCanvas />
      </main>

      {/* Footer */}
      {!isFullscreen && <AVLEducationalFooter />}
    </div>
  )
}
