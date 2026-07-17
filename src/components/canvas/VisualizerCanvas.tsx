'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/VisualizerCanvas.tsx
//
// Phase 2: Full custom node/edge types with Framer Motion animations.
// nodeTypes and edgeTypes are defined outside the component to prevent
// React Flow from re-mounting nodes on every render (official RF guideline).
// ─────────────────────────────────────────────────────────────────────────────

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useEffect } from 'react'

import { useVisualizerLayout } from '@/hooks/useVisualizerLayout'
import { ListNodeComponent } from './nodes/ListNode'
import { NullSentinelComponent } from './nodes/NullSentinel'
import { PointerEdgeComponent } from './edges/PointerEdge'

// ─── Type registries — defined OUTSIDE the component ─────────────────────────

const NODE_TYPES: NodeTypes = {
  listNode: ListNodeComponent,
  nullSentinel: NullSentinelComponent,
}

const EDGE_TYPES: EdgeTypes = {
  pointerEdge: PointerEdgeComponent,
}

// ─── MiniMap node colours ─────────────────────────────────────────────────────

const STATE_MINIMAP_COLOURS: Record<string, string> = {
  idle:      'hsl(225,16%,18%)',
  active:    'hsl(261,82%,65%)',
  comparing: 'hsl(38,92%,60%)',
  mutating:  'hsl(142,72%,52%)',
  deleted:   'hsl(0,72%,55%)',
  found:     'hsl(196,90%,55%)',
}

function AutoFitView({ nodeCount, padding }: { nodeCount: number, padding: number }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding, duration: 800 })
    }, 50)
    return () => clearTimeout(timer)
  }, [nodeCount, fitView, padding])
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VisualizerCanvas() {
  const { rfNodes, rfEdges, fitViewPadding, defaultEdgeOptions } = useVisualizerLayout()

  // Attach markerEnd to all edges (cannot be set in nodeMap because RF merges styles)
  const edgesWithMarkers = rfEdges.map((edge) => ({
    ...edge,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: edge.data?.isTraversing
        ? 'hsl(261,82%,65%)'
        : edge.data?.isNull
        ? 'hsl(225,12%,28%)'
        : 'hsl(225,12%,36%)',
      width: 18,
      height: 18,
    },
  }))

  return (
    <div className="h-full w-full canvas-grid">
      <ReactFlow
        nodes={rfNodes}
        edges={edgesWithMarkers}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: fitViewPadding }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
      >
        <AutoFitView nodeCount={rfNodes.length} padding={fitViewPadding} />
        <Controls
          position="bottom-right"
          showInteractive={false}
        />
        <MiniMap
          position="bottom-left"
          nodeColor={(node) => {
            const state = (node.data as { highlightState?: string })?.highlightState ?? 'idle'
            return STATE_MINIMAP_COLOURS[state] ?? STATE_MINIMAP_COLOURS.idle
          }}
          maskColor="hsl(225,20%,6%,0.7)"
          style={{
            background: 'hsl(225,18%,9%)',
            border: '1px solid hsl(225,12%,18%)',
            borderRadius: 12,
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          color="hsl(225,14%,15%)"
          gap={32}
          size={1.5}
        />
      </ReactFlow>
    </div>
  )
}
