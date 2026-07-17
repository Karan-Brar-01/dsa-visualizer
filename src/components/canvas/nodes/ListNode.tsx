'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/nodes/ListNode.tsx
//
// Custom React Flow node for a singly linked list node.
//
// Visual anatomy:
//   ┌──────────────────────────────┐
//   │  [HEAD]                      │  ← badge (conditional)
//   │                              │
//   │       [ value ]              │  ← primary display
//   │                              │
//   │  id: …xxxx                   │  ← subtle ID suffix
//   └──────────────────────────────┘
//      ↓ next pointer (edge)
//
// Framer Motion handles:
//   - Entry: scale + fade in from 0 when isSpawning = true
//   - Exit:  scale + fade out when isDespawning = true
//   - Highlight: background + ring pulse when highlightState changes
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { motion, AnimatePresence } from 'framer-motion'
import type { ListNodeData } from '@/types/flow'

// ─── Colour mapping ────────────────────────────────────────────────────────────

const STATE_STYLES: Record<
  ListNodeData['highlightState'],
  { bg: string; ring: string; text: string; glow: string }
> = {
  idle:      { bg: 'hsl(225,16%,14%)', ring: 'hsl(225,12%,26%)',  text: 'hsl(210,16%,80%)',  glow: 'transparent' },
  active:    { bg: 'hsl(261,60%,22%)', ring: 'hsl(261,82%,65%)',  text: 'hsl(261,90%,88%)',  glow: 'hsl(261,82%,65%,0.35)' },
  comparing: { bg: 'hsl(38,70%,18%)',  ring: 'hsl(38,92%,60%)',   text: 'hsl(38,90%,85%)',   glow: 'hsl(38,92%,60%,0.35)' },
  mutating:  { bg: 'hsl(142,55%,15%)', ring: 'hsl(142,72%,52%)',  text: 'hsl(142,72%,82%)',  glow: 'hsl(142,72%,52%,0.35)' },
  deleted:   { bg: 'hsl(0,55%,18%)',   ring: 'hsl(0,72%,55%)',    text: 'hsl(0,80%,80%)',    glow: 'hsl(0,72%,55%,0.35)' },
  found:     { bg: 'hsl(196,65%,14%)', ring: 'hsl(196,90%,55%)',  text: 'hsl(196,85%,82%)',  glow: 'hsl(196,90%,55%,0.35)' },
}

const BADGE_STYLES = {
  head: 'bg-violet-500/20 text-violet-300 border border-violet-500/40',
  tail: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ListNodeComponent = memo(function ListNodeComponent({
  id,
  data,
}: NodeProps<ListNodeData>) {
  const { value, isHead, isTail, highlightState, isSpawning, isDespawning } = data
  const s = STATE_STYLES[highlightState]

  return (
    // RF requires the outer element to be a plain div without transforms —
    // we apply Framer Motion to an inner div so RF's position system stays intact.
    <div className="relative" style={{ width: 80, height: 80 }}>
      {/* Spawn / Despawn animation wrapper */}
      <AnimatePresence>
        <motion.div
          key={id}
          initial={isSpawning ? { scale: 0.4, opacity: 0 } : false}
          animate={
            isDespawning
              ? { scale: 0.4, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Glow ring (rendered behind the card) */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow:
                highlightState !== 'idle'
                  ? `0 0 0 2px ${s.ring}, 0 0 28px ${s.glow}`
                  : '0 0 0 1px hsl(225,12%,26%)',
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Card body */}
          <motion.div
            className="
              relative w-full h-full rounded-2xl
              flex flex-col items-center justify-center gap-0.5
              select-none overflow-hidden
              border
            "
            animate={{
              backgroundColor: s.bg,
              borderColor: s.ring,
            }}
            transition={{ duration: 0.2 }}
          >
            {/* HEAD / TAIL badges */}
            <AnimatePresence>
              {(isHead || isTail) && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-1.5 left-0 right-0 flex justify-center gap-1"
                >
                  {isHead && (
                    <span className={`text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-full ${BADGE_STYLES.head}`}>
                      HEAD
                    </span>
                  )}
                  {isTail && (
                    <span className={`text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-full ${BADGE_STYLES.tail}`}>
                      TAIL
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Value */}
            <motion.span
              className="font-mono font-bold text-xl leading-none"
              animate={{ color: s.text }}
              transition={{ duration: 0.2 }}
            >
              {String(value)}
            </motion.span>

            {/* Node ID suffix */}
            <span className="font-mono text-[9px]" style={{ color: 'hsl(210,8%,38%)' }}>
              …{id.slice(-4)}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* React Flow connection handles — hidden visually, required for edges */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
    </div>
  )
})

ListNodeComponent.displayName = 'ListNodeComponent'
