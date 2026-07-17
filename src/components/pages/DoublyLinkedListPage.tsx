'use client'

/**
 * DoublyLinkedListPage — Client component that mounts the full visualizer.
 *
 * Responsibilities:
 *   1. Mounts 
  const { applyStep, commitOperation, play, pause, stepForward, stepBack } = useDoublyLinkedListStore(selectors.actions)
useAnimationSequencer (the side-effect sequencer hook).
 *   2. Composes OperationPanel + VisualizerCanvas + EducationalFooter.
 *   3. Wires keyboard shortcuts (Space, ←, →) to store actions.
 */

import { useEffect, useCallback } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useAnimationSequencer } from '@/hooks/useAnimationSequencer'
import { useDoublyLinkedListStore, selectors } from '@/stores/doublyLinkedListStore'

// Placeholder panels (will be replaced in Phase 2)
// Using lightweight inline placeholders to verify the wiring compiles.
import { DoublyListOperationPanel } from '@/components/controls/DoublyListOperationPanel'
import { DoublyListStepController } from '@/components/controls/DoublyListStepController'
import { VisualizerCanvas } from '@/components/canvas/VisualizerCanvas'
import { EducationalFooter } from '@/components/educational/EducationalFooter'

export function DoublyLinkedListPage() {
  
  const isFullscreen = useUIStore((s) => s.isFullscreen)
  const isPlaying = useDoublyLinkedListStore(selectors.isPlaying)
  const steps = useDoublyLinkedListStore(selectors.steps)
  const currentStepIndex = useDoublyLinkedListStore(selectors.currentStepIndex)
  const playbackSpeed = useDoublyLinkedListStore(selectors.playbackSpeed)
  const { applyStep, commitOperation, play, pause, stepForward, stepBack } = useDoublyLinkedListStore(selectors.actions)

  useAnimationSequencer({
    isPlaying,
    steps,
    currentStepIndex,
    playbackSpeed,
    applyStep,
    commitOperation,
    pause,
  })

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      if (e.code === 'Space') {
        e.preventDefault()
        isPlaying ? pause() : play()
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault()
        stepForward()
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        stepBack()
      }
    },
    [isPlaying, play, pause, stepForward, stepBack]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, play, pause, stepForward, stepBack, steps])

  return (
    <div className={`flex flex-col ${isFullscreen ? 'h-screen' : 'h-[calc(100dvh-3.5rem)] md:h-full overflow-y-auto md:overflow-hidden'}`}>
      {/* Top Controls Bar */}
      <header
        className={
          isFullscreen
            ? 'fixed bottom-6 left-0 right-0 z-50 flex flex-col items-center justify-center px-4 pointer-events-none'
            : 'flex-shrink-0 border-b border-[hsl(225,12%,18%)] bg-[hsl(225,18%,10%)] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10'
        }
      >
        <div className={isFullscreen ? 'flex flex-col md:flex-row items-center justify-center gap-2 bg-[hsl(225,18%,10%)]/80 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-[hsl(225,12%,25%)] pointer-events-auto' : 'w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4'}>
          <DoublyListOperationPanel />
          <DoublyListStepController />
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className={`relative bg-[hsl(225,20%,6%)] ${isFullscreen ? 'flex-1 h-full' : 'h-[60vh] min-h-[60vh] md:h-auto md:min-h-0 md:flex-1 flex-shrink-0'}`}>
        <VisualizerCanvas />
      </main>

      {/* Footer */}
      {!isFullscreen && <EducationalFooter />}
    </div>
  )
}
