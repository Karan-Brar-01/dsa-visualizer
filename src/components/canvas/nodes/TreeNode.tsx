'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/nodes/TreeNode.tsx
//
// Custom React Flow node for a Binary Search Tree node.
// Circular design, Framer Motion animations.
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { motion, AnimatePresence } from 'framer-motion'
import type { TreeNodeData } from '@/types/flow'

const STATE_STYLES: Record<
  TreeNodeData['highlightState'],
  { bg: string; ring: string; text: string; glow: string }
> = {
  idle:      { bg: 'hsl(225,16%,14%)', ring: 'hsl(225,12%,26%)',  text: 'hsl(210,16%,80%)',  glow: 'transparent' },
  active:    { bg: 'hsl(261,60%,22%)', ring: 'hsl(261,82%,65%)',  text: 'hsl(261,90%,88%)',  glow: 'hsl(261,82%,65%,0.35)' },
  comparing: { bg: 'hsl(38,70%,18%)',  ring: 'hsl(38,92%,60%)',   text: 'hsl(38,90%,85%)',   glow: 'hsl(38,92%,60%,0.35)' },
  mutating:  { bg: 'hsl(142,55%,15%)', ring: 'hsl(142,72%,52%)',  text: 'hsl(142,72%,82%)',  glow: 'hsl(142,72%,52%,0.35)' },
  deleted:   { bg: 'hsl(0,55%,18%)',   ring: 'hsl(0,72%,55%)',    text: 'hsl(0,80%,80%)',    glow: 'hsl(0,72%,55%,0.35)' },
  found:     { bg: 'hsl(196,65%,14%)', ring: 'hsl(196,90%,55%)',  text: 'hsl(196,85%,82%)',  glow: 'hsl(196,90%,55%,0.35)' },
}

export const TreeNodeComponent = memo(function TreeNodeComponent({
  id,
  data,
}: NodeProps<TreeNodeData>) {
  const { value, isRoot, highlightState, isSpawning, isDespawning } = data
  const s = STATE_STYLES[highlightState]

  return (
    <div className="relative" style={{ width: 64, height: 64 }}>
      <AnimatePresence>
        <motion.div
          key={id}
          initial={isSpawning ? { scale: 0, opacity: 0 } : false}
          animate={
            isDespawning
              ? { scale: 0, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow:
                highlightState !== 'idle'
                  ? `0 0 0 3px ${s.ring}, 0 0 24px ${s.glow}`
                  : '0 0 0 2px hsl(225,12%,26%)',
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Node body */}
          <motion.div
            className="
              relative w-full h-full rounded-full
              flex items-center justify-center
              select-none overflow-hidden
            "
            animate={{
              backgroundColor: s.bg,
            }}
            transition={{ duration: 0.2 }}
          >
            {isRoot && (
              <span className="absolute top-1 text-[8px] font-bold text-violet-300 tracking-wider">
                ROOT
              </span>
            )}
            
            <motion.span
              className="font-mono font-bold text-xl"
              animate={{ color: s.text }}
              transition={{ duration: 0.2 }}
            >
              {String(value)}
            </motion.span>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Target handle (Top) - incoming edges from parent */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
      {/* Source handle (Bottom) - outgoing edges to children */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
    </div>
  )
})

TreeNodeComponent.displayName = 'TreeNodeComponent'
