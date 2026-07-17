'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/edges/TreeEdge.tsx
//
// Custom React Flow edge for Tree structures.
// ─────────────────────────────────────────────────────────────────────────────

import { memo, type CSSProperties } from 'react'
import {
  BaseEdge,
  getStraightPath,
  type EdgeProps,
} from 'reactflow'
import type { TreeEdgeData } from '@/types/flow'

const TRAVERSAL_ANIMATION = `
  @keyframes treeDashFlow {
    to { stroke-dashoffset: -20; }
  }
`

export const TreeEdgeComponent = memo(function TreeEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<TreeEdgeData>) {
  const isTraversing = data?.isTraversing ?? false
  const isHighlighted = data?.isHighlighted ?? false

  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY })

  const strokeColor = isTraversing || isHighlighted
    ? 'hsl(261,82%,65%)'
    : 'hsl(225,12%,36%)'

  const edgeStyle: CSSProperties = {
    stroke: strokeColor,
    strokeWidth: isTraversing || isHighlighted ? 2.5 : 2,
    strokeDasharray: isTraversing ? '6 4' : 'none',
    animation: isTraversing ? 'treeDashFlow 0.4s linear infinite' : 'none',
  }

  return (
    <>
      {isTraversing && <style>{TRAVERSAL_ANIMATION}</style>}
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
      />
    </>
  )
})

TreeEdgeComponent.displayName = 'TreeEdgeComponent'
