'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/nodes/GraphNode.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import type { GraphNodeData } from '@/types/flow'

const STATE_STYLES: Record<
  GraphNodeData['highlightState'],
  { bg: string; ring: string; text: string; glow: string }
> = {
  idle:      { bg: 'hsl(225,16%,14%)', ring: 'hsl(225,12%,26%)',  text: 'hsl(210,16%,80%)',  glow: 'transparent' },
  active:    { bg: 'hsl(261,60%,22%)', ring: 'hsl(261,82%,65%)',  text: 'hsl(261,90%,88%)',  glow: 'hsl(261,82%,65%,0.35)' },
  comparing: { bg: 'hsl(38,70%,18%)',  ring: 'hsl(38,92%,60%)',   text: 'hsl(38,90%,85%)',   glow: 'hsl(38,92%,60%,0.35)' },
  mutating:  { bg: 'hsl(142,55%,15%)', ring: 'hsl(142,72%,52%)',  text: 'hsl(142,72%,82%)',  glow: 'hsl(142,72%,52%,0.35)' },
  deleted:   { bg: 'hsl(0,55%,18%)',   ring: 'hsl(0,72%,55%)',    text: 'hsl(0,80%,80%)',    glow: 'hsl(0,72%,55%,0.35)' },
  found:     { bg: 'hsl(196,65%,14%)', ring: 'hsl(196,90%,55%)',  text: 'hsl(196,85%,82%)',  glow: 'hsl(196,90%,55%,0.35)' },
}

export const GraphNodeComponent = memo(function GraphNodeComponent({
  id,
  data,
}: NodeProps<GraphNodeData>) {
  const { label, highlightState } = data
  const s = STATE_STYLES[highlightState]

  return (
    <div className="relative" style={{ width: 56, height: 56 }}>
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
          select-none
        "
        animate={{ backgroundColor: s.bg }}
        transition={{ duration: 0.2 }}
      >
        <motion.span
          className="font-mono font-bold text-lg"
          animate={{ color: s.text }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      </motion.div>

      {/* Handles - all sides for an undirected graph */}
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, width: 1, height: 1 }} id="left-target" />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, width: 1, height: 1 }} id="right-source" />
    </div>
  )
})

GraphNodeComponent.displayName = 'GraphNodeComponent'
