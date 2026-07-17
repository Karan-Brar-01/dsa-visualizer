'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/pages/BSTPage.tsx
//
// Assembles the complete BST visualizer page.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { BSTVisualizerCanvas } from '@/components/canvas/BSTVisualizerCanvas'
import { BSTOperationPanel } from '@/components/controls/BSTOperationPanel'
import { BSTStepController } from '@/components/controls/BSTStepController'
import { BSTEducationalFooter } from '@/components/educational/BSTEducationalFooter'
import { useBSTStore, selectors } from '@/stores/bstStore'
import { useAnimationSequencer } from '@/hooks/useAnimationSequencer'

export function BSTPage() {
  const isFullscreen = useUIStore((s) => s.isFullscreen)
  const isPlaying     = useBSTStore(selectors.isPlaying)
  const playbackSpeed = useBSTStore(selectors.playbackSpeed)
  const currentStep   = useBSTStore(selectors.currentStep)
  const steps         = useBSTStore(state => state.steps)
  
  const { applyStep, commitOperation, play, pause, stepForward, stepBack } =
    useBSTStore(selectors.actions)

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
      // Don't trigger if user is typing in an input field
      if (document.activeElement?.tagName === 'INPUT') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (steps.length > 0) {
            isPlaying ? pause() : play()
          }
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
    <div className={`flex flex-col ${isFullscreen ? 'flex-1 h-full w-full relative' : 'h-[calc(100dvh-3.5rem)] md:h-full overflow-y-auto md:overflow-hidden'}`}>
      {/* Top Controls Bar */}
      <header
        className={
          isFullscreen
            ? 'absolute bottom-4 pb-[env(safe-area-inset-bottom)] left-0 right-0 z-50 flex flex-col items-center justify-center px-2 pointer-events-none'
            : 'flex-shrink-0 border-b border-[hsl(225,12%,18%)] bg-[hsl(225,18%,10%)] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10'
        }
      >
        <div className={isFullscreen ? 'flex flex-col md:flex-row items-center justify-center gap-1.5 bg-[hsl(225,18%,10%)]/95 backdrop-blur-md rounded-xl p-2 shadow-2xl border border-[hsl(225,12%,25%)] w-full max-w-[95vw] max-h-[30vh] overflow-y-auto pointer-events-auto' : 'w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4'}>
          <BSTOperationPanel />
          <BSTStepController />
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className={`relative bg-[hsl(225,20%,6%)] ${isFullscreen ? 'flex-1 h-full' : 'h-[60vh] min-h-[60vh] md:h-auto md:min-h-0 md:flex-1 flex-shrink-0'}`}>
        <BSTVisualizerCanvas />
      </main>

      {/* Footer */}
      {!isFullscreen && <BSTEducationalFooter />}
    </div>
  )
}
