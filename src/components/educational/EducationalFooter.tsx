'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/educational/EducationalFooter.tsx  (Phase 2 upgrade)
//
// Three-column panel:
//   Col 1 — Operation log (last 6 entries, newest on top)
//   Col 2 — Current step narration + pointer mutation display
//   Col 3 — Full complexity reference table + live list stats
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from 'framer-motion'
import { useSinglyLinkedListStore, selectors } from '@/stores/singlyLinkedListStore'

const COMPLEXITY_TABLE = [
  { op: 'Insert Head', time: 'O(1)', space: 'O(1)', accent: 'text-green-400' },
  { op: 'Insert Tail', time: 'O(n)', space: 'O(1)', accent: 'text-amber-400' },
  { op: 'Insert At',   time: 'O(n)', space: 'O(1)', accent: 'text-amber-400' },
  { op: 'Delete Head', time: 'O(1)', space: 'O(1)', accent: 'text-green-400' },
  { op: 'Delete Tail', time: 'O(n)', space: 'O(1)', accent: 'text-amber-400' },
  { op: 'Search',      time: 'O(n)', space: 'O(1)', accent: 'text-amber-400' },
]

const STATE_LEGEND = [
  { state: 'active',    color: 'hsl(261,82%,65%)', label: 'Traversing' },
  { state: 'comparing', color: 'hsl(38,92%,60%)',  label: 'Comparing'  },
  { state: 'mutating',  color: 'hsl(142,72%,52%)', label: 'Mutating'   },
  { state: 'deleted',   color: 'hsl(0,72%,55%)',   label: 'Deleting'   },
  { state: 'found',     color: 'hsl(196,90%,55%)', label: 'Found'      },
]

export function EducationalFooter() {
  const operationLog     = useSinglyLinkedListStore(selectors.operationLog)
  const currentStep      = useSinglyLinkedListStore(selectors.currentStep)
  const listSize         = useSinglyLinkedListStore(selectors.listSize)
  const snapshot         = useSinglyLinkedListStore(selectors.snapshot)
  const isPlaying        = useSinglyLinkedListStore(selectors.isPlaying)
  const currentStepIndex = useSinglyLinkedListStore(selectors.currentStepIndex)
  const totalSteps       = useSinglyLinkedListStore((s) => s.steps.length)

  const headValue = snapshot.head
    ? String(snapshot.nodeMap.get(snapshot.head)?.value ?? '—')
    : 'null'

  // Tail value — walk to last node
  let tailValue = 'null'
  if (snapshot.head) {
    let cur: string | null = snapshot.head
    while (cur) {
      const node = snapshot.nodeMap.get(cur)
      if (!node?.next) { tailValue = String(node?.value ?? '—'); break }
      cur = node.next
    }
  }

  return (
    <footer
      className="
        flex-shrink-0 border-t border-[hsl(225,12%,18%)]
        bg-[hsl(225,18%,9%)]
        grid grid-cols-3 divide-x divide-[hsl(225,12%,18%)]
      "
      style={{ height: 168 }}
      aria-label="Educational information"
    >
      {/* ── Column 1: Operation Log ─────────────────────────────────────────── */}
      <div className="px-5 py-4 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[hsl(210,8%,40%)]">
            Operation Log
          </h3>
          <div className="flex items-center gap-1.5">
            {isPlaying && (
              <span className="flex items-center gap-1 text-[9px] text-violet-400 font-mono">
                <span className="h-1 w-1 rounded-full bg-violet-400 animate-pulse" />
                animating
              </span>
            )}
            <span className="text-[9px] font-mono text-[hsl(210,8%,35%)]">
              size: {listSize}
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-1 overflow-hidden" aria-label="Recent operations">
          <AnimatePresence initial={false}>
            {operationLog.slice(0, 5).map((entry, i) => (
              <motion.li
                key={`${entry}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className={`text-xs font-mono truncate leading-snug ${
                  i === 0 ? 'text-[hsl(210,16%,82%)]' : 'text-[hsl(210,8%,40%)]'
                }`}
              >
                <span className="mr-1.5" style={{ color: 'hsl(225,12%,32%)' }}>›</span>
                {entry}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      {/* ── Column 2: Current Step ──────────────────────────────────────────── */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[hsl(210,8%,40%)]">
            Current Step
          </h3>
          {totalSteps > 0 && (
            <span className="text-[9px] font-mono text-[hsl(210,8%,35%)]">
              {currentStepIndex + 1} / {totalSteps}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {currentStep ? (
            <motion.div
              key={currentStep.stepIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2"
            >
              {/* Description */}
              <p className="text-xs font-mono text-violet-300 leading-relaxed">
                {currentStep.description}
              </p>

              {/* Pointer mutation display */}
              {currentStep.pointerMutation && (
                <div className="rounded-lg border border-[hsl(225,12%,22%)] bg-[hsl(225,16%,12%)] px-3 py-1.5">
                  <p className="text-[10px] font-mono text-[hsl(210,8%,50%)]">
                    <span className="text-amber-400">ptr</span>
                    {' '}[…{currentStep.pointerMutation.sourceId.slice(-4)}]
                    {' '}<span className="text-[hsl(210,8%,35%)]">→</span>
                    {' '}{currentStep.pointerMutation.newTargetId
                      ? <span className="text-violet-400">…{currentStep.pointerMutation.newTargetId.slice(-4)}</span>
                      : <span className="text-red-400">NULL</span>
                    }
                  </p>
                </div>
              )}

              {/* Highlight legend for active highlights */}
              {currentStep.highlights.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {STATE_LEGEND.filter((l) =>
                    currentStep.highlights.some((h) => h.state === l.state)
                  ).map((l) => (
                    <span
                      key={l.state}
                      className="flex items-center gap-1 text-[9px] font-mono"
                      style={{ color: l.color }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ background: l.color }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-[hsl(210,8%,38%)]"
            >
              Select an operation and press <span className="text-[hsl(210,12%,55%)] font-mono">Run</span> to see step-by-step narration.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Column 3: Complexity + Stats ────────────────────────────────────── */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[hsl(210,8%,40%)]">
            Complexity
          </h3>
          {/* Live pointer stats */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono">
              <span className="text-[hsl(210,8%,40%)]">head </span>
              <span className="text-violet-400">{headValue}</span>
            </span>
            <span className="text-[9px] font-mono">
              <span className="text-[hsl(210,8%,40%)]">tail </span>
              <span className="text-cyan-400">{tailValue}</span>
            </span>
          </div>
        </div>

        {/* Complexity table */}
        <div className="grid grid-cols-3 gap-x-3 gap-y-0.5">
          {/* Header */}
          <span className="text-[9px] text-[hsl(210,8%,32%)] font-semibold">Operation</span>
          <span className="text-[9px] text-[hsl(210,8%,32%)] font-semibold text-right">Time</span>
          <span className="text-[9px] text-[hsl(210,8%,32%)] font-semibold text-right">Space</span>
          {/* Rows */}
          {COMPLEXITY_TABLE.map((row) => (
            <>
              <span key={`${row.op}-op`} className="text-[9px] text-[hsl(210,8%,45%)] truncate">{row.op}</span>
              <span key={`${row.op}-t`}  className={`text-[9px] font-mono font-bold ${row.accent} text-right`}>{row.time}</span>
              <span key={`${row.op}-s`}  className="text-[9px] font-mono text-[hsl(210,8%,40%)] text-right">{row.space}</span>
            </>
          ))}
        </div>
      </div>
    </footer>
  )
}
