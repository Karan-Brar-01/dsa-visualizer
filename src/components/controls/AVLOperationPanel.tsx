'use client'

import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAVLStore, selectors } from '@/stores/avlStore'

type OperationMode = 'insert' | 'search' | 'delete'

const OPERATIONS = [
  { mode: 'insert' as const, label: 'Insert', complexity: 'O(log n)', accent: 'violet' },
  { mode: 'search' as const, label: 'Search', complexity: 'O(log n)', accent: 'cyan' },
  { mode: 'delete' as const, label: 'Delete', complexity: 'O(log n)', accent: 'red' },
]

const ACCENT_BUTTON: Record<string, string> = {
  violet: 'bg-violet-600 hover:bg-violet-500 active:bg-violet-700 shadow-[0_0_12px_hsl(261_82%_65%/0.3)]',
  cyan:   'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 shadow-[0_0_12px_hsl(196_90%_55%/0.3)]',
  red:    'bg-red-700 hover:bg-red-600 active:bg-red-800 shadow-[0_0_12px_hsl(0_72%_55%/0.3)]',
}

function randomValue() {
  return Math.floor(Math.random() * 99) + 1
}

export function AVLOperationPanel() {
  const id = useId()
  const [mode, setMode] = useState<OperationMode>('insert')
  const [value, setValue] = useState('')

  const actions   = useAVLStore(selectors.actions)
  const isPlaying = useAVLStore(selectors.isPlaying)
  const hasSteps  = useAVLStore((s) => s.steps.length > 0)

  const currentOp = OPERATIONS.find((op) => op.mode === mode)!

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (isPlaying || hasSteps) {
      actions.commitOperation()
    }

    const numValue = parseInt(value, 10)
    
    switch (mode) {
      case 'insert': actions.insert(numValue); break
      case 'search': actions.search(numValue); break
      case 'delete': actions.delete(numValue); break
    }
    setValue('')
  }

  function handleRandomize() {
    setValue(String(randomValue()))
  }

  return (
    <form
      id={`${id}-form`}
      onSubmit={handleSubmit}
      className="flex items-center gap-2 flex-wrap"
      aria-label="AVL operation controls"
    >
      <div className="flex items-center gap-1 rounded-xl border border-[hsl(225,12%,20%)] bg-[hsl(225,18%,10%)] p-1">
        {OPERATIONS.map((op) => (
          <button
            key={op.mode}
            type="button"
            onClick={() => setMode(op.mode)}
            className={`
              min-h-[44px] md:min-h-0 md:h-7 px-4 md:px-2.5 rounded-lg text-sm md:text-xs font-medium border transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
              ${mode === op.mode
                ? `${ACCENT_BUTTON[op.accent]} text-white border-transparent`
                : 'border-transparent text-[hsl(210,8%,55%)] hover:text-[hsl(210,12%,75%)]'}
            `}
          >
            {op.label}
            <span className="ml-1 text-[8px] opacity-60">{op.complexity}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
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
            className="
              h-8 w-20 rounded-lg border border-[hsl(225,12%,24%)]
              bg-[hsl(225,16%,12%)] text-[hsl(210,20%,92%)]
              px-2.5 text-xs font-mono
              focus:outline-none focus:ring-1 focus:ring-violet-500/60
              disabled:opacity-40
            "
            aria-label="Node value"
          />
          <button
            id={`${id}-random`}
            type="button"
            onClick={handleRandomize}
            title="Random value"
            className="
              min-h-[44px] w-12 md:min-h-0 md:h-8 md:w-8 rounded-lg border border-[hsl(225,12%,24%)]
              bg-[hsl(225,16%,12%)] text-[hsl(210,8%,50%)]
              hover:text-[hsl(210,12%,75%)] hover:border-[hsl(225,10%,32%)]
              text-sm disabled:opacity-40 transition-colors
            "
          >
            ⚄
          </button>
        </motion.div>
      </AnimatePresence>

      <button
        id={`${id}-run`}
        type="submit"
        className={`
          min-h-[44px] md:min-h-0 md:h-8 px-5 md:px-4 text-sm md:text-xs rounded-lg text-sm font-semibold text-white
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all
          ${ACCENT_BUTTON[currentOp.accent]}
        `}
      >
        Run
      </button>

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
    </form>
  )
}
