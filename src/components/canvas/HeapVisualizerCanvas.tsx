'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/canvas/HeapVisualizerCanvas.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { selectors, useHeapStore } from '@/stores/heapStore'
import { TreeNodeComponent } from './nodes/TreeNode'
import { TreeEdgeComponent } from './edges/TreeEdge'

const NODE_TYPES: NodeTypes = { treeNode: TreeNodeComponent }
const EDGE_TYPES: EdgeTypes = { treeEdge: TreeEdgeComponent }

function AutoFitView({ count }: { count: number }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.2, duration: 600 }), 50)
    return () => clearTimeout(t)
  }, [count, fitView])
  return null
}

export function HeapVisualizerCanvas() {
  const rfNodes = useHeapStore(selectors.rfNodes)
  const rfEdges = useHeapStore(selectors.rfEdges)

  return (
    <div className="h-full w-full canvas-grid">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
      >
        <AutoFitView count={rfNodes.length} />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap
          position="bottom-left"
          maskColor="hsl(225,20%,6%,0.7)"
          style={{ background: 'hsl(225,18%,9%)', border: '1px solid hsl(225,12%,18%)', borderRadius: 12 }}
        />
        <Background variant={BackgroundVariant.Dots} color="hsl(225,14%,15%)" gap={32} size={1.5} />
      </ReactFlow>
    </div>
  )
}
