'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/controls/OperationPanel.tsx  (Phase 2 upgrade)
//
// Redesigned with tabbed operation groups, randomize, and better UX.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCircularLinkedListStore, selectors } from '@/stores/circularLinkedListStore'

type OperationMode =
  | 'insertHead' | 'insertTail' | 'insertAt'
  | 'deleteHead' | 'deleteTail' | 'deleteAt'
  | 'search'

interface OpDef {
  mode: OperationMode
  label: string
  shortLabel: string
  needsValue: boolean
  needsIndex: boolean
  group: 'insert' | 'delete' | 'search'
  complexity: string
  accent: string
}

const OPERATIONS: OpDef[] = [
  { mode: 'insertHead', label: 'Insert Head', shortLabel: 'Head', needsValue: true,  needsIndex: false, group: 'insert', complexity: 'O(1)', accent: 'violet' },
  { mode: 'insertTail', label: 'Insert Tail', shortLabel: 'Tail', needsValue: true,  needsIndex: false, group: 'insert', complexity: 'O(n)', accent: 'violet' },  { mode: 'deleteHead', label: 'Delete Head', shortLabel: 'Head', needsValue: false, needsIndex: false, group: 'delete', complexity: 'O(1)', accent: 'red' },
  { mode: 'deleteTail', label: 'Delete Tail', shortLabel: 'Tail', needsValue: false, needsIndex: false, group: 'delete', complexity: 'O(n)', accent: 'red' },]

const GROUP_LABELS = {
  insert: { label: 'Insert', color: 'text-violet-400', active: 'bg-violet-500/20 border-violet-500/40 text-violet-300', inactive: 'text-[hsl(210,8%,50%)] hover:text-[hsl(210,12%,70%)]' },
  delete: { label: 'Delete', color: 'text-red-400',    active: 'bg-red-500/20 border-red-500/40 text-red-300',          inactive: 'text-[hsl(210,8%,50%)] hover:text-[hsl(210,12%,70%)]' },}

const ACCENT_BUTTON: Record<string, string> = {
  violet: 'bg-violet-600 hover:bg-violet-500 active:bg-violet-700 shadow-[0_0_12px_hsl(261_82%_65%/0.3)]',
  red:    'bg-red-700 hover:bg-red-600 active:bg-red-800 shadow-[0_0_12px_hsl(0_72%_55%/0.3)]',
  cyan:   'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 shadow-[0_0_12px_hsl(196_90%_55%/0.3)]',
}

function randomValue() {
  return Math.floor(Math.random() * 99) + 1
}

export function CircularListOperationPanel() {
  const id = useId()
  const [group, setGroup] = useState<'insert' | 'delete' | 'search'>('insert')
  const [mode, setMode] = useState<OperationMode>('insertHead')
  const [value, setValue] = useState('')
  const [index, setIndex] = useState('')

  const actions   = useCircularLinkedListStore(selectors.actions)
  const isPlaying = useCircularLinkedListStore(selectors.isPlaying)
  const hasSteps  = useCircularLinkedListStore((s) => s.steps.length > 0)
  const listSize  = useCircularLinkedListStore(selectors.listSize)

  const groupOps  = OPERATIONS.filter((op) => op.group === group)
  const currentOp = OPERATIONS.find((op) => op.mode === mode) ?? groupOps[0]

  function switchGroup(g: typeof group) {
    setGroup(g)
    // Default to first op in the new group
    const first = OPERATIONS.find((op) => op.group === g)!
    setMode(first.mode)
    setValue('')
    setIndex('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isPlaying || hasSteps) {
      actions.commitOperation()
    }
    const numValue = parseInt(value, 10)
    const numIndex = parseInt(index, 10)
    switch (mode) {
      case 'insertHead': actions.insertHead(numValue); break
      case 'insertTail': actions.insertTail(numValue); break
      case 'deleteHead': actions.deleteHead(); break
      case 'deleteTail': actions.deleteTail(); break
    }
    setValue('')
    setIndex('')
  }

  function handleRandomize() {
    setValue(String(randomValue()))
  }

  return (
    <form
      id={`${id}-form`}
      onSubmit={handleSubmit}
      className="flex items-center gap-2 flex-wrap"
      aria-label="Linked list operation controls"
    >
      {/* Group tabs */}
      <div
        className="flex items-center gap-1 rounded-xl border border-[hsl(225,12%,20%)] bg-[hsl(225,18%,10%)] p-1"
        role="tablist"
        aria-label="Operation group"
      >
        {(Object.keys(GROUP_LABELS) as Array<keyof typeof GROUP_LABELS>).map((g) => (
          <button
            key={g}
            id={`${id}-tab-${g}`}
            type="button"
            role="tab"
            aria-selected={group === g}
            onClick={() => switchGroup(g)}
            className={`
              h-7 px-3 rounded-lg text-xs font-semibold border transition-all
              ${group === g ? GROUP_LABELS[g].active : `border-transparent ${GROUP_LABELS[g].inactive}`}
            `}
          >
            {GROUP_LABELS[g].label}
          </button>
        ))}
      </div>

      {/* Sub-operation selector */}
      <AnimatePresence mode="wait">
        <motion.div
          key={group}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 6 }}
          transition={{ duration: 0.12 }}
          className="flex items-center gap-1 rounded-xl border border-[hsl(225,12%,20%)] bg-[hsl(225,18%,10%)] p-1"
        >
          {groupOps.map((op) => (
            <button
              key={op.mode}
              id={`${id}-op-${op.mode}`}
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
              {op.shortLabel}
              <span className="ml-1 text-[8px] opacity-60">{op.complexity}</span>
            </button>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Inputs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="flex items-center gap-2"
        >
          {currentOp?.needsIndex && (
            <input
              id={`${id}-index`}
              type="number"
              min={0}
              max={listSize}
              placeholder="index"
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              required
              className="
                min-h-[44px] md:min-h-0 md:h-8 w-20 md:w-16 text-sm md:text-xs rounded-lg border border-[hsl(225,12%,24%)]
                bg-[hsl(225,16%,12%)] text-[hsl(210,20%,92%)]
                px-2.5 text-xs font-mono
                focus:outline-none focus:ring-1 focus:ring-violet-500/60
                disabled:opacity-40
              "
              aria-label="Target index"
            />
          )}

          {currentOp?.needsValue && (
            <div className="flex items-center gap-1">
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
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Run button */}
      <button
        id={`${id}-run`}
        type="submit"
        className={`
          min-h-[44px] md:min-h-0 md:h-8 px-5 md:px-4 text-sm md:text-xs rounded-lg text-sm font-semibold text-white
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all
          ${ACCENT_BUTTON[currentOp?.accent ?? 'violet']}
        `}
      >
        Run
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
    </form>
  )
}
