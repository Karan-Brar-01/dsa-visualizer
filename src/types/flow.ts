// ─────────────────────────────────────────────────────────────────────────────
// src/types/flow.ts
//
// React Flow node and edge type extensions.
// Keeps all RF-specific type augmentations in one place so components
// import from here rather than re-declaring inline.
// ─────────────────────────────────────────────────────────────────────────────

import type { Node, Edge } from 'reactflow'
import type { NodeHighlightState } from './animation'

// ─── Node Data Shapes ─────────────────────────────────────────────────────────

/**
 * Data payload attached to a React Flow node representing a singly linked list node.
 * The canvas reads this to decide colours, labels, and animation class names.
 */
export interface ListNodeData {
  value: number | string
  isHead: boolean
  isTail: boolean
  highlightState: NodeHighlightState
  /** Used by Framer Motion to animate entry/exit without full RF re-mount. */
  isSpawning: boolean
  isDespawning: boolean
}

/**
 * Data payload for a BST / AVL tree node rendered in React Flow.
 */
export interface TreeNodeData {
  value: number
  height: number         // AVL balance factor source
  balanceFactor: number  // AVL: height(left) - height(right)
  isRoot: boolean
  highlightState: NodeHighlightState
  isSpawning: boolean
  isDespawning: boolean
}

/**
 * Data payload for a generic graph node.
 */
export interface GraphNodeData {
  label: string
  highlightState: NodeHighlightState
  visited: boolean
  inQueue: boolean   // BFS queue state
  inStack: boolean   // DFS stack state
}

// ─── Edge Data Shapes ─────────────────────────────────────────────────────────

/**
 * Data payload for an edge representing a `next` pointer in a linked list.
 */
export interface PointerEdgeData {
  /** True while the sequencer is animating pointer traversal through this edge. */
  isTraversing: boolean
  /** True for the terminal edge pointing to the conceptual NULL sentinel. */
  isNull: boolean
  /** True if this is a 'prev' pointer in a doubly linked list. */
  isPrev?: boolean
  /** True if this is a 'tail.next -> head' pointer in a circular linked list. */
  isReturn?: boolean
}

/**
 * Data payload for a tree edge (parent → child pointer).
 */
export interface TreeEdgeData {
  isHighlighted: boolean
  isTraversing: boolean
}

/**
 * Data payload for a graph edge (weighted or unweighted).
 */
export interface GraphEdgeData {
  weight?: number
  isTraversed: boolean
  directed: boolean
}

// ─── Typed RF Node/Edge aliases ───────────────────────────────────────────────

export type ListFlowNode = Node<ListNodeData>
export type ListFlowEdge = Edge<PointerEdgeData>
export type TreeFlowNode = Node<TreeNodeData>
export type TreeFlowEdge = Edge<TreeEdgeData>
export type GraphFlowNode = Node<GraphNodeData>
export type GraphFlowEdge = Edge<GraphEdgeData>
