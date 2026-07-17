'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/nodes/NullSentinel.tsx
//
// The virtual NULL terminal node rendered at the end of the list.
// Not a real data node — just a visual marker indicating `next === null`.
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { motion } from 'framer-motion'

export const NullSentinelComponent = memo(function NullSentinelComponent(_: NodeProps) {
  return (
    <div style={{ width: 52, height: 36 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="
          w-full h-full rounded-lg
          flex items-center justify-center
          font-mono text-[11px] font-semibold
          select-none
        "
        style={{
          background: 'hsl(225,16%,10%)',
          border: '1px dashed hsl(225,12%,28%)',
          color: 'hsl(210,8%,40%)',
        }}
      >
        NULL
      </motion.div>

      {/* Only needs a target handle — nothing points out from NULL */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
    </div>
  )
})

NullSentinelComponent.displayName = 'NullSentinelComponent'
