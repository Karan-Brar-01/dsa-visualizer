'use client'

import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHeapStore, selectors } from '@/stores/heapStore'
import type { HeapType } from '@/core/trees/heap/types'

function randomValue() { return Math.floor(Math.random() * 90) + 5 }

export function HeapOperationPanel() {
  const id = useId()
  const [value, setValue] = useState('')
  const [mode, setMode] = useState<'insert' | 'extract'>('insert')

  const actions  = useHeapStore(selectors.actions)
  const heapType = useHeapStore(selectors.heapType)
  const isPlaying = useHeapStore((s) => s.isPlaying)
  const hasSteps  = useHeapStore((s) => s.steps.length > 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isPlaying || hasSteps) actions.commitOperation()
    if (mode === 'insert') {
      const n = parseInt(value, 10)
      if (!isNaN(n)) actions.insert(n)
    } else {
      actions.extractRoot()
    }
    setValue('')
  }

  return (
    <form id={`${id}-form`} onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap" aria-label="Heap controls">
      {/* Heap type toggle */}
      <div className="flex items-center gap-1 rounded-xl border border-[hsl(225,12%,20%)] bg-[hsl(225,18%,10%)] p-1">
        {(['min', 'max'] as HeapType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => actions.setHeapType(t)}
            className={`h-7 px-3 rounded-lg text-xs font-bold transition-all ${
              heapType === t
                ? 'bg-violet-600 text-white'
                : 'text-[hsl(210,8%,55%)] hover:text-[hsl(210,12%,75%)]'
            }`}
          >
            {t.toUpperCase()}-HEAP
          </button>
        ))}
      </div>

      {/* Mode tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-[hsl(225,12%,20%)] bg-[hsl(225,18%,10%)] p-1">
        <button
          type="button"
          onClick={() => setMode('insert')}
          className={`min-h-[44px] md:min-h-0 md:h-7 px-4 md:px-2.5 rounded-lg text-sm md:text-xs font-medium border transition-all ${
            mode === 'insert'
              ? 'bg-violet-600 text-white border-transparent shadow-[0_0_12px_hsl(261_82%_65%/0.3)]'
              : 'border-transparent text-[hsl(210,8%,55%)] hover:text-[hsl(210,12%,75%)]'
          }`}
        >
          Insert <span className="ml-1 text-[8px] opacity-60">O(log n)</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('extract')}
          className={`min-h-[44px] md:min-h-0 md:h-7 px-4 md:px-2.5 rounded-lg text-sm md:text-xs font-medium border transition-all ${
            mode === 'extract'
              ? 'bg-red-700 text-white border-transparent shadow-[0_0_12px_hsl(0_72%_55%/0.3)]'
              : 'border-transparent text-[hsl(210,8%,55%)] hover:text-[hsl(210,12%,75%)]'
          }`}
        >
          Extract {heapType === 'min' ? 'Min' : 'Max'} <span className="ml-1 text-[8px] opacity-60">O(log n)</span>
        </button>
      </div>

      {/* Value input */}
      <AnimatePresence mode="wait">
        {mode === 'insert' && (
          <motion.div
            key="insert-input"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="flex items-center gap-1"
          >
            <input
              id={`${id}-value`}
              type="number"
              placeholder="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              className="h-8 w-20 rounded-lg border border-[hsl(225,12%,24%)] bg-[hsl(225,16%,12%)] text-[hsl(210,20%,92%)] px-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500/60"
            />
            <button
              type="button"
              onClick={() => setValue(String(randomValue()))}
              title="Random"
              className="min-h-[44px] w-12 md:min-h-0 md:h-8 md:w-8 rounded-lg border border-[hsl(225,12%,24%)] bg-[hsl(225,16%,12%)] text-[hsl(210,8%,50%)] hover:text-[hsl(210,12%,75%)] text-sm transition-colors"
            >⚄</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Run */}
      <button
        id={`${id}-run`}
        type="submit"
        className={`min-h-[44px] md:min-h-0 md:h-8 px-5 md:px-4 text-sm md:text-xs rounded-lg text-sm font-semibold text-white transition-all ${
          mode === 'insert'
            ? 'bg-violet-600 hover:bg-violet-500 shadow-[0_0_12px_hsl(261_82%_65%/0.3)]'
            : 'bg-red-700 hover:bg-red-600 shadow-[0_0_12px_hsl(0_72%_55%/0.3)]'
        }`}
      >
        Run
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
    </form>
  )
}
