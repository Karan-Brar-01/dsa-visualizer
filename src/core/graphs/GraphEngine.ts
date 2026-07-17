// ─────────────────────────────────────────────────────────────────────────────
// src/core/graphs/GraphEngine.ts
//
// Undirected graph engine supporting BFS, DFS, addVertex, addEdge, removeEdge.
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid'
import type { OperationResult } from '../shared/OperationResult'
import type { AnimationStep } from '@/types/animation'
import type { GraphVertex, GraphEdge, GraphSnapshot } from './types'

export class GraphEngine {
  private vertices: Map<string, GraphVertex> = new Map()
  private adjacency: Map<string, Set<string>> = new Map()
  private edges: Map<string, GraphEdge> = new Map()

  private getSnapshot(): GraphSnapshot {
    const vertsCopy = new Map<string, GraphVertex>()
    this.vertices.forEach((v, k) => vertsCopy.set(k, { ...v }))
    const adjCopy = new Map<string, Set<string>>()
    this.adjacency.forEach((s, k) => adjCopy.set(k, new Set(s)))
    const edgesCopy = new Map<string, GraphEdge>()
    this.edges.forEach((e, k) => edgesCopy.set(k, { ...e }))
    return {
      vertices: vertsCopy,
      adjacency: adjCopy,
      edges: edgesCopy,
      vertexCount: this.vertices.size,
    }
  }

  // ─── Compute circular layout ──────────────────────────────────────────────

  private computeCircleLayout() {
    const ids = Array.from(this.vertices.keys())
    const count = ids.length
    if (count === 0) return
    const r = 180 + count * 12     // Radius grows with node count
    const cx = 0
    const cy = 0
    ids.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2
      const v = this.vertices.get(id)!
      v.x = Math.round(cx + r * Math.cos(angle))
      v.y = Math.round(cy + r * Math.sin(angle))
    })
  }

  // ─── Initialise with a preset graph ──────────────────────────────────────

  public loadPreset(preset: 'default'): GraphSnapshot {
    this.vertices.clear()
    this.adjacency.clear()
    this.edges.clear()

    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    const edgePairs: [string, string][] = [
      ['A','B'], ['A','C'], ['B','D'], ['B','E'], ['C','F'], ['D','E']
    ]

    // Create vertices
    labels.forEach((label) => {
      const id = label   // use label as id for preset graphs
      this.vertices.set(id, { id, label, x: 0, y: 0 })
      this.adjacency.set(id, new Set())
    })

    // Create edges
    edgePairs.forEach(([srcLabel, tgtLabel]) => {
      const eid = `${srcLabel}-${tgtLabel}`
      this.edges.set(eid, { id: eid, source: srcLabel, target: tgtLabel })
      this.adjacency.get(srcLabel)!.add(tgtLabel)
      this.adjacency.get(tgtLabel)!.add(srcLabel)
    })

    this.computeCircleLayout()
    return this.getSnapshot()
  }

  public reset(): GraphSnapshot {
    return this.loadPreset('default')
  }

  // ─── BFS ──────────────────────────────────────────────────────────────────

  public bfs(startId: string): OperationResult<GraphSnapshot> {
    const steps: AnimationStep[] = []
    let stepIndex = 0

    if (!this.vertices.has(startId)) {
      steps.push({
        stepIndex: stepIndex++,
        description: `Vertex ${startId} not found.`,
        highlights: [],
      })
      return {
        kind: 'GRAPH_BFS',
        success: false,
        message: `Start vertex not found`,
        complexity: { time: 'O(V + E)', space: 'O(V)' },
        snapshot: this.getSnapshot(),
        steps,
      }
    }

    const visited = new Set<string>()
    const queue: string[] = [startId]
    visited.add(startId)
    const visitOrder: string[] = []

    steps.push({
      stepIndex: stepIndex++,
      description: `BFS starting from vertex ${this.vertices.get(startId)!.label}. Adding to queue.`,
      highlights: [{ nodeId: startId, state: 'active' }],
    })

    while (queue.length > 0) {
      const currentId = queue.shift()!
      const current = this.vertices.get(currentId)!
      visitOrder.push(currentId)

      steps.push({
        stepIndex: stepIndex++,
        description: `Visiting vertex ${current.label}. Queue: [${queue.map(id => this.vertices.get(id)!.label).join(', ')}]`,
        highlights: [
          { nodeId: currentId, state: 'mutating' },
          ...queue.map(id => ({ nodeId: id, state: 'active' as const })),
          ...visitOrder.slice(0, -1).map(id => ({ nodeId: id, state: 'found' as const })),
        ],
      })

      const neighbors = Array.from(this.adjacency.get(currentId) ?? []).sort()
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          queue.push(neighborId)
          const neighbor = this.vertices.get(neighborId)!
          steps.push({
            stepIndex: stepIndex++,
            description: `Discovering neighbor ${neighbor.label}. Adding to queue.`,
            highlights: [
              { nodeId: currentId, state: 'comparing' },
              { nodeId: neighborId, state: 'active' },
              ...visitOrder.map(id => ({ nodeId: id, state: 'found' as const })),
            ],
          })
        }
      }
    }

    steps.push({
      stepIndex: stepIndex++,
      description: `BFS complete! Visited: ${visitOrder.map(id => this.vertices.get(id)!.label).join(' → ')}`,
      highlights: visitOrder.map(id => ({ nodeId: id, state: 'found' as const })),
    })

    return {
      kind: 'GRAPH_BFS',
      success: true,
      message: `BFS from ${this.vertices.get(startId)!.label}`,
      complexity: { time: 'O(V + E)', space: 'O(V)' },
      snapshot: this.getSnapshot(),
      steps,
    }
  }

  // ─── DFS ──────────────────────────────────────────────────────────────────

  public dfs(startId: string): OperationResult<GraphSnapshot> {
    const steps: AnimationStep[] = []
    let stepIndex = 0

    if (!this.vertices.has(startId)) {
      steps.push({
        stepIndex: stepIndex++,
        description: `Vertex ${startId} not found.`,
        highlights: [],
      })
      return {
        kind: 'GRAPH_DFS',
        success: false,
        message: `Start vertex not found`,
        complexity: { time: 'O(V + E)', space: 'O(V)' },
        snapshot: this.getSnapshot(),
        steps,
      }
    }

    const visited = new Set<string>()
    const visitOrder: string[] = []

    const dfsRecurse = (nodeId: string, depth: number) => {
      visited.add(nodeId)
      visitOrder.push(nodeId)
      const node = this.vertices.get(nodeId)!

      steps.push({
        stepIndex: stepIndex++,
        description: `DFS visiting ${node.label} (depth ${depth}). Stack: [${visitOrder.map(id => this.vertices.get(id)!.label).join(', ')}]`,
        highlights: [
          { nodeId: nodeId, state: 'mutating' },
          ...visitOrder.slice(0, -1).map(id => ({ nodeId: id, state: 'found' as const })),
        ],
      })

      const neighbors = Array.from(this.adjacency.get(nodeId) ?? []).sort()
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          const neighbor = this.vertices.get(neighborId)!
          steps.push({
            stepIndex: stepIndex++,
            description: `Exploring edge ${node.label} → ${neighbor.label}`,
            highlights: [
              { nodeId: nodeId, state: 'comparing' },
              { nodeId: neighborId, state: 'active' },
              ...visitOrder.map(id => ({ nodeId: id, state: 'found' as const })),
            ],
          })
          dfsRecurse(neighborId, depth + 1)
        }
      }
    }

    steps.push({
      stepIndex: stepIndex++,
      description: `DFS starting from vertex ${this.vertices.get(startId)!.label}.`,
      highlights: [{ nodeId: startId, state: 'active' }],
    })

    dfsRecurse(startId, 0)

    steps.push({
      stepIndex: stepIndex++,
      description: `DFS complete! Visited: ${visitOrder.map(id => this.vertices.get(id)!.label).join(' → ')}`,
      highlights: visitOrder.map(id => ({ nodeId: id, state: 'found' as const })),
    })

    return {
      kind: 'GRAPH_DFS',
      success: true,
      message: `DFS from ${this.vertices.get(startId)!.label}`,
      complexity: { time: 'O(V + E)', space: 'O(V)' },
      snapshot: this.getSnapshot(),
      steps,
    }
  }
}
