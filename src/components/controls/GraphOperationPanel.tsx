'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/controls/GraphOperationPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useId } from 'react'
import { useGraphStore, selectors } from '@/stores/graphStore'

const VERTICES = ['A', 'B', 'C', 'D', 'E', 'F']

const ACCENT_BUTTON: Record<string, string> = {
  bfs: 'bg-violet-600 hover:bg-violet-500 active:bg-violet-700 shadow-[0_0_12px_hsl(261_82%_65%/0.3)]',
  dfs: 'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 shadow-[0_0_12px_hsl(196_90%_55%/0.3)]',
}

export function GraphOperationPanel({ algorithm }: { algorithm: 'bfs' | 'dfs' }) {
  const id = useId()
  const actions    = useGraphStore(selectors.actions)
  const isPlaying  = useGraphStore(selectors.isPlaying)
  const hasSteps   = useGraphStore((s) => s.steps.length > 0)
  const startVertex = useGraphStore(selectors.startVertex)

  function handleRun() {
    if (isPlaying || hasSteps) {
      actions.commitOperation()
    }
    if (algorithm === 'bfs') {
      actions.runBFS(startVertex)
    } else {
      actions.runDFS(startVertex)
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap" aria-label="Graph traversal controls">
      {/* Vertex selector */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-[hsl(210,8%,50%)] font-mono">Start:</span>
        <div className="flex items-center gap-0.5 rounded-xl border border-[hsl(225,12%,20%)] bg-[hsl(225,18%,10%)] p-1">
          {VERTICES.map((v) => (
            <button
              key={v}
              id={`${id}-vertex-${v}`}
              type="button"
              onClick={() => actions.setStartVertex(v)}
              className={`
                h-7 w-7 rounded-lg text-xs font-bold font-mono transition-all
                ${startVertex === v
                  ? `${ACCENT_BUTTON[algorithm]} text-white border-transparent`
                  : 'text-[hsl(210,8%,55%)] hover:text-[hsl(210,12%,75%)]'}
              `}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Run */}
      <button
        id={`${id}-run`}
        type="button"
        onClick={handleRun}
        className={`
          min-h-[44px] md:min-h-0 md:h-8 px-5 md:px-4 text-sm md:text-xs rounded-lg text-sm font-semibold text-white
          transition-all
          ${ACCENT_BUTTON[algorithm]}
        `}
      >
        Run {algorithm.toUpperCase()}
      </button>

      {/* Reset */}
      <button
        id={`${id}-reset`}
        type="button"
        onClick={actions.reset}
        disabled={isPlaying}
        className="
          min-h-[44px] md:min-h-0 md:h-8 px-4 md:px-3 text-sm md:text-xs rounded-lg text-xs text-[hsl(210,8%,50%)]
          border border-[hsl(225,12%,22%)] bg-[hsl(225,16%,11%)]
          hover:text-[hsl(210,12%,70%)] hover:border-[hsl(225,10%,30%)]
          disabled:opacity-40 transition-colors
        "
      >
        Reset
      </button>
    </div>
  )
}
