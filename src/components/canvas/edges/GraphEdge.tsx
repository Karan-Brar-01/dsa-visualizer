'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/edges/GraphEdge.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from 'reactflow'
import { motion } from 'framer-motion'
import type { GraphEdgeData } from '@/types/flow'

export const GraphEdgeComponent = memo(function GraphEdgeComponent({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<GraphEdgeData>) {
  const isTraversed = data?.isTraversed ?? false

  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const color = isTraversed ? 'hsl(261,82%,65%)' : 'hsl(225,12%,28%)'

  return (
    <>
      <motion.path
        d={edgePath}
        fill="none"
        animate={{ stroke: color, strokeWidth: isTraversed ? 2.5 : 1.5 }}
        transition={{ duration: 0.3 }}
      />
    </>
  )
})

GraphEdgeComponent.displayName = 'GraphEdgeComponent'
