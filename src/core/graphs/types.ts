// ─────────────────────────────────────────────────────────────────────────────
// src/core/graphs/types.ts
// ─────────────────────────────────────────────────────────────────────────────

export interface GraphVertex {
  id: string
  label: string
  x: number  // Fixed layout position (user-defined or circle-arranged)
  y: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
}

export interface GraphSnapshot {
  vertices: Map<string, GraphVertex>
  adjacency: Map<string, Set<string>>   // adjacency list (undirected: both directions stored)
  edges: Map<string, GraphEdge>
  vertexCount: number
}
