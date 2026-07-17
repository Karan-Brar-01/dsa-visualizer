'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/pages/GraphPage.tsx
// Shared page component for BFS and DFS traversal visualizers.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { GraphVisualizerCanvas } from '@/components/canvas/GraphVisualizerCanvas'
import { GraphOperationPanel } from '@/components/controls/GraphOperationPanel'
import { GraphStepController } from '@/components/controls/GraphStepController'
import { useGraphStore, selectors } from '@/stores/graphStore'
import { useAnimationSequencer } from '@/hooks/useAnimationSequencer'

interface GraphPageProps {
  algorithm: 'bfs' | 'dfs'
  title: string
  icon: string
  accentColor: string
}

export function GraphPage({ algorithm, title, icon, accentColor }: GraphPageProps) {
  const isPlaying     = useGraphStore(selectors.isPlaying)
  const playbackSpeed = useGraphStore(selectors.playbackSpeed)
  const currentStep   = useGraphStore(selectors.currentStep)
  const steps         = useGraphStore(state => state.steps)
  const log           = useGraphStore(selectors.operationLog)
  const currentStepIndex = useGraphStore(selectors.currentStepIndex)
  
  const isFullscreen = useUIStore((s) => s.isFullscreen)

  const { applyStep, commitOperation, play, pause, stepForward, stepBack } =
    useGraphStore(selectors.actions)

  // Init visual state on mount (load preset graph)
  const syncVisual = useGraphStore((s) => s._syncVisualState)
  useEffect(() => {
    syncVisual()
  }, [syncVisual])

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
    <div className={`flex flex-col ${isFullscreen ? 'flex-1 relative' : 'h-[calc(100dvh-3.5rem)] md:h-full overflow-y-auto md:overflow-hidden'}`}>
      {/* Top Controls Bar */}
      <header
        className={
          isFullscreen
            ? 'absolute bottom-4 pb-[env(safe-area-inset-bottom)] left-0 right-0 z-50 flex flex-col items-center justify-center px-4 pointer-events-none'
            : 'flex-shrink-0 border-b border-[hsl(225,12%,18%)] bg-[hsl(225,18%,10%)] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10'
        }
      >
        <div className={isFullscreen ? 'flex flex-col md:flex-row items-center justify-center gap-2 bg-[hsl(225,18%,10%)]/80 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-[hsl(225,12%,25%)] pointer-events-auto max-h-[250px] overflow-y-auto w-full max-w-[90vw]' : 'w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4'}>
          <GraphOperationPanel algorithm={algorithm} />
          <GraphStepController />
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className={`relative bg-[hsl(225,20%,6%)] ${isFullscreen ? 'flex-1 h-full' : 'h-[60vh] min-h-[60vh] md:h-auto md:min-h-0 md:flex-1 flex-shrink-0'}`}>
        <GraphVisualizerCanvas />
      </main>

    </div>
  )
}
