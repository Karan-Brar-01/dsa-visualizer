'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/edges/PointerEdge.tsx
//
// Custom React Flow edge representing a `next` pointer in a linked list.
//
// States:
//   - isNull = false, isTraversing = false → static grey arrow
//   - isNull = false, isTraversing = true  → animated violet dashed arrow
//   - isNull = true                        → dashed grey arrow to NULL sentinel
// ─────────────────────────────────────────────────────────────────────────────

import { memo, type CSSProperties } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  getBezierPath,
  Position,
  type EdgeProps,
} from 'reactflow'
import type { PointerEdgeData } from '@/types/flow'

// SVG animation for the dashed traversal effect
const TRAVERSAL_ANIMATION = `
  @keyframes dashFlow {
    to { stroke-dashoffset: -20; }
  }
`

export const PointerEdgeComponent = memo(function PointerEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
}: EdgeProps<PointerEdgeData>) {
  const isTraversing = data?.isTraversing ?? false
  const isNull = data?.isNull ?? false
  const isPrev = data?.isPrev ?? false
  const isReturn = data?.isReturn ?? false

  let edgePath = ''
  if (isReturn) {
    // Tail to Head (Circular) -> curve underneath
    [edgePath] = getBezierPath({
      sourceX, sourceY, targetX, targetY,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Bottom,
    })
  } else if (isPrev) {
    // Doubly linked prev pointer -> slight curve to avoid overlapping next
    [edgePath] = getBezierPath({
      sourceX, sourceY, targetX, targetY,
      sourcePosition: Position.Top,
      targetPosition: Position.Top,
    })
  } else {
    // Standard next pointer
    [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  }

  const strokeColor = isTraversing
    ? 'hsl(261,82%,65%)'
    : isNull
    ? 'hsl(225,12%,28%)'
    : 'hsl(225,12%,36%)'

  const edgeStyle: CSSProperties = {
    stroke: strokeColor,
    strokeWidth: isTraversing ? 2.5 : isNull ? 1.5 : 2,
    strokeDasharray: isNull ? '4 4' : isTraversing ? '6 4' : 'none',
    animation: isTraversing ? 'dashFlow 0.4s linear infinite' : 'none',
  }

  return (
    <>
      {/* Inject the keyframe animation once into the SVG */}
      {isTraversing && <style>{TRAVERSAL_ANIMATION}</style>}

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
      />

      {/* Traversal pulse label */}
      {isTraversing && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2 - 14}px)`,
              pointerEvents: 'none',
            }}
            className="
              flex items-center gap-1 rounded-full px-2 py-0.5
              bg-violet-500/20 border border-violet-500/40
              text-violet-300 text-[9px] font-mono font-semibold
              animate-pulse
            "
          >
            <span className="h-1 w-1 rounded-full bg-violet-400" />
            next
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

PointerEdgeComponent.displayName = 'PointerEdgeComponent'
