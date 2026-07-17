'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/SortingCanvas.tsx
//
// Premium animated bar-chart visualization for sorting algorithms.
// Each bar's color is driven by comparingIndices / swappingIndices / sortedIndices.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion'
import { useSortingStore, selectors } from '@/stores/sortingStore'
import type { SortingStep } from '@/core/sorting/SortingEngine'

function getBarColor(
  index: number,
  step: SortingStep | null,
): { bg: string; glow: string } {
  if (!step) return { bg: 'hsl(225,16%,22%)', glow: 'transparent' }

  if (step.sortedIndices.includes(index)) {
    return { bg: 'hsl(142,72%,38%)', glow: 'hsl(142,72%,52%,0.4)' }
  }
  if (step.swappingIndices.includes(index)) {
    return { bg: 'hsl(142,72%,45%)', glow: 'hsl(142,72%,52%,0.6)' }
  }
  if (step.comparingIndices.includes(index)) {
    return { bg: 'hsl(38,92%,50%)', glow: 'hsl(38,92%,60%,0.5)' }
  }
  if ((step as any).pivotIndex === index) {
    return { bg: 'hsl(261,82%,65%)', glow: 'hsl(261,82%,65%,0.5)' }
  }
  const highlighted = step.highlights.find(h => h.nodeId === String(index))
  if (highlighted?.state === 'mutating') return { bg: 'hsl(142,55%,35%)', glow: 'transparent' }
  if (highlighted?.state === 'active')   return { bg: 'hsl(261,60%,45%)', glow: 'transparent' }
  return { bg: 'hsl(225,16%,22%)', glow: 'transparent' }
}

export function SortingCanvas() {
  const arr = useSortingStore(selectors.currentArray)
  const currentStep = useSortingStore(selectors.currentStep) as SortingStep | null

  const maxVal = Math.max(...arr, 1)
  const barCount = arr.length

  return (
    <div className="h-full w-full flex flex-col items-center justify-end px-4 pb-8 pt-6 bg-[hsl(225,20%,6%)] canvas-grid">
      {/* Bars */}
      <div
        className="w-full flex items-end gap-[2px] h-full max-h-[420px]"
        style={{ maxWidth: Math.min(barCount * 40, 1100) }}
        aria-label="Sorting visualization bars"
      >
        {arr.map((val, i) => {
          const { bg, glow } = getBarColor(i, currentStep)
          const heightPct = (val / maxVal) * 100

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <motion.div
                layoutId={`bar-${i}`}
                className="w-full rounded-t-sm relative"
                animate={{
                  height: `${heightPct}%`,
                  backgroundColor: bg,
                  boxShadow: glow !== 'transparent' ? `0 0 10px ${glow}` : 'none',
                }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                title={`${val}`}
              />
              {barCount <= 25 && (
                <span className="text-[8px] font-mono text-[hsl(210,8%,40%)] tabular-nums">
                  {val}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Array index ruler */}
      {barCount <= 25 && (
        <div
          className="w-full flex mt-1 gap-[2px]"
          style={{ maxWidth: Math.min(barCount * 40, 1100) }}
        >
          {arr.map((_, i) => (
            <div key={i} className="flex-1 text-center text-[7px] font-mono text-[hsl(210,8%,30%)]">
              {i}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
