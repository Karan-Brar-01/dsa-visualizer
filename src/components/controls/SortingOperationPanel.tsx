'use client'

import { useId } from 'react'
import { useSortingStore, selectors } from '@/stores/sortingStore'
import type { SortAlgorithm } from '@/stores/sortingStore'

const SIZE_OPTIONS = [10, 15, 20, 30, 50]

export function SortingOperationPanel({ algorithm }: { algorithm: SortAlgorithm }) {
  const id = useId()
  const actions    = useSortingStore(selectors.actions)
  const isPlaying  = useSortingStore(selectors.isPlaying)
  const arraySize  = useSortingStore(selectors.arraySize)
  const hasSteps   = useSortingStore((s) => s.steps.length > 0)

  const accentClass = algorithm === 'merge'
    ? 'bg-violet-600 hover:bg-violet-500 shadow-[0_0_12px_hsl(261_82%_65%/0.3)]'
    : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_12px_hsl(196_90%_55%/0.3)]'

  return (
    <div className="flex items-center gap-3 flex-wrap" aria-label="Sorting controls">
      {/* Array size picker */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-[hsl(210,8%,50%)] font-mono">n =</span>
        <div className="flex items-center gap-0.5 rounded-xl border border-[hsl(225,12%,20%)] bg-[hsl(225,18%,10%)] p-1">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              id={`${id}-size-${s}`}
              type="button"
              onClick={() => actions.setArraySize(s)}
              disabled={isPlaying}
              className={`min-h-[44px] md:min-h-0 md:h-7 px-4 md:px-2.5 rounded-lg text-sm md:text-xs font-mono font-medium transition-all disabled:opacity-40 ${
                arraySize === s
                  ? `${accentClass} text-white border-transparent`
                  : 'text-[hsl(210,8%,55%)] hover:text-[hsl(210,12%,75%)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Shuffle new array */}
      <button
        id={`${id}-shuffle`}
        type="button"
        onClick={actions.generateArray}
        disabled={isPlaying}
        className="min-h-[44px] md:min-h-0 md:h-8 px-4 md:px-3 text-sm md:text-xs rounded-lg text-xs text-[hsl(210,8%,50%)] border border-[hsl(225,12%,22%)] bg-[hsl(225,16%,11%)] hover:text-[hsl(210,12%,70%)] hover:border-[hsl(225,10%,30%)] disabled:opacity-40 transition-colors"
      >
        ⚄ Shuffle
      </button>

      {/* Sort! */}
      <button
        id={`${id}-run`}
        type="button"
        onClick={actions.runSort}
        className={`min-h-[44px] md:min-h-0 md:h-8 px-5 md:px-4 text-sm md:text-xs rounded-lg text-sm font-semibold text-white transition-all ${accentClass}`}
      >
        Sort!
      </button>

      {/* Reset */}
      <button
        id={`${id}-reset`}
        type="button"
        onClick={actions.reset}
        disabled={isPlaying}
        className="min-h-[44px] md:min-h-0 md:h-8 px-4 md:px-3 text-sm md:text-xs rounded-lg text-xs text-[hsl(210,8%,50%)] border border-[hsl(225,12%,22%)] bg-[hsl(225,16%,11%)] hover:text-[hsl(210,12%,70%)] hover:border-[hsl(225,10%,30%)] disabled:opacity-40 transition-colors"
      >
        Reset
      </button>
    </div>
  )
}
