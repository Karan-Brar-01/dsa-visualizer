// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useVisualizerLayout.ts
//
// Provides layout metadata consumed by VisualizerCanvas.
// Encapsulates React Flow configuration so the canvas component
// doesn't need to know about node types, edge types, or RF defaults.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import type { NodeTypes, EdgeTypes, DefaultEdgeOptions } from 'reactflow'
import { useSinglyLinkedListStore, selectors } from '@/stores/singlyLinkedListStore'

// These are imported lazily by VisualizerCanvas to keep this hook pure.
// The hook just returns the type maps — components provide the actual components.

export interface VisualizerLayoutConfig {
  rfNodes: ReturnType<typeof selectors.rfNodes>
  rfEdges: ReturnType<typeof selectors.rfEdges>
  /**
   * Suggested RF viewport fit padding.
   * Increases with list size so nodes don't hug the canvas edges.
   */
  fitViewPadding: number
  /**
   * Suggested initial zoom level based on node count.
   */
  initialZoom: number
  /**
   * React Flow defaultEdgeOptions — applied to all edges unless overridden.
   */
  defaultEdgeOptions: DefaultEdgeOptions
}

/**
 * Returns layout configuration for the React Flow canvas.
 * Consumed exclusively by VisualizerCanvas.
 */
export function useVisualizerLayout(): VisualizerLayoutConfig {
  const rfNodes = useSinglyLinkedListStore(selectors.rfNodes)
  const rfEdges = useSinglyLinkedListStore(selectors.rfEdges)
  const listSize = useSinglyLinkedListStore(selectors.listSize)

  const fitViewPadding = useMemo(() => {
    // More nodes → need more viewport padding to avoid clipping
    return Math.max(0.15, 0.4 - listSize * 0.015)
  }, [listSize])

  const initialZoom = useMemo(() => {
    if (listSize === 0) return 1
    if (listSize <= 4) return 0.9
    if (listSize <= 8) return 0.75
    return 0.6
  }, [listSize])

  const defaultEdgeOptions: DefaultEdgeOptions = useMemo(
    () => ({
      type: 'pointerEdge',
      animated: false,
      style: { strokeWidth: 2 },
    }),
    []
  )

  return {
    rfNodes,
    rfEdges,
    fitViewPadding,
    initialZoom,
    defaultEdgeOptions,
  }
}
