// ─────────────────────────────────────────────────────────────────────────────
// src/stores/graphStore.ts
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { castDraft } from 'immer'
import type { Node as RFNode, Edge as RFEdge } from 'reactflow'
import { GraphEngine } from '@/core/graphs/GraphEngine'
import type { GraphSnapshot } from '@/core/graphs/types'
import type { OperationResult } from '@/core/shared/OperationResult'
import type { AnimationStep, PlaybackSpeed } from '@/types/animation'
import type { GraphNodeData, GraphEdgeData } from '@/types/flow'

// ─── Layout computation ───────────────────────────────────────────────────────

function computeLayout(snapshot: GraphSnapshot): {
  nodes: RFNode<GraphNodeData>[]
  edges: RFEdge<GraphEdgeData>[]
} {
  const nodes: RFNode<GraphNodeData>[] = []
  const edges: RFEdge<GraphEdgeData>[] = []

  snapshot.vertices.forEach((vertex) => {
    nodes.push({
      id: vertex.id,
      type: 'graphNode',
      position: { x: vertex.x, y: vertex.y },
      data: {
        label: vertex.label,
        highlightState: 'idle',
        visited: false,
        inQueue: false,
        inStack: false,
      },
      draggable: false,
    })
  })

  // Only emit each undirected edge once (source < target lexicographically)
  const seen = new Set<string>()
  snapshot.edges.forEach((edge) => {
    const key = [edge.source, edge.target].sort().join('-')
    if (!seen.has(key)) {
      seen.add(key)
      edges.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'graphEdge',
        data: { isTraversed: false, directed: false },
        animated: false,
      })
    }
  })

  return { nodes, edges }
}

// ─── Store types ──────────────────────────────────────────────────────────────

interface MathematicalState {
  readonly _engine: GraphEngine
  snapshot: GraphSnapshot
}

interface VisualState {
  rfNodes: RFNode<GraphNodeData>[]
  rfEdges: RFEdge<GraphEdgeData>[]
  traversalAlgorithm: 'bfs' | 'dfs'
  startVertex: string
}

interface AnimationState {
  isPlaying: boolean
  currentStepIndex: number
  steps: AnimationStep[]
  playbackSpeed: PlaybackSpeed
  pendingResult: OperationResult<GraphSnapshot> | null
  operationLog: string[]
  currentStep: AnimationStep | null
}

interface MathActions {
  runBFS: (startId: string) => void
  runDFS: (startId: string) => void
  reset: () => void
  setStartVertex: (id: string) => void
  setAlgorithm: (alg: 'bfs' | 'dfs') => void
}

interface AnimationActions {
  applyStep: (step: AnimationStep) => void
  commitOperation: () => void
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBack: () => void
  setPlaybackSpeed: (speed: PlaybackSpeed) => void
}

interface InternalActions {
  _syncVisualState: () => void
  _dispatchOperation: (result: OperationResult<GraphSnapshot>, logMessage: string) => void
}

type GraphStore = MathematicalState & VisualState & AnimationState & MathActions & AnimationActions & InternalActions

// ─── Store ────────────────────────────────────────────────────────────────────

const initialEngine = new GraphEngine()
const initialSnapshot = initialEngine.reset()

export const useGraphStore = create<GraphStore>()(
  immer((set, get) => ({
    // Math
    _engine: initialEngine,
    snapshot: castDraft(initialSnapshot),

    // Visual
    rfNodes: [],
    rfEdges: [],
    traversalAlgorithm: 'bfs',
    startVertex: 'A',

    // Animation
    isPlaying: false,
    currentStepIndex: 0,
    steps: [],
    playbackSpeed: 'normal',
    pendingResult: null,
    operationLog: [],
    currentStep: null,

    // MathActions
    runBFS: (startId) => {
      const result = get()._engine.bfs(startId)
      get()._dispatchOperation(result, `BFS(${startId})`)
    },
    runDFS: (startId) => {
      const result = get()._engine.dfs(startId)
      get()._dispatchOperation(result, `DFS(${startId})`)
    },
    reset: () => {
      const snap = get()._engine.reset()
      set((state) => {
        state.snapshot = castDraft(snap)
        state.steps = []
        state.currentStepIndex = 0
        state.isPlaying = false
        state.pendingResult = null
        state.operationLog = []
        state.currentStep = null
      })
      get()._syncVisualState()
    },
    setStartVertex: (id) => set({ startVertex: id }),
    setAlgorithm: (alg) => set({ traversalAlgorithm: alg }),

    // AnimationActions
    applyStep: (step) => {
      set((state) => {
        state.currentStepIndex = step.stepIndex
        state.currentStep = step

        // Reset all highlights
        state.rfNodes.forEach((n) => { n.data.highlightState = 'idle' })
        state.rfEdges.forEach((e) => { if (e.data) e.data.isTraversed = false })

        // Apply highlights
        step.highlights.forEach(({ nodeId, state: hState }) => {
          const node = state.rfNodes.find((n) => n.id === nodeId)
          if (node) node.data.highlightState = hState
        })
      })
    },

    commitOperation: () => {
      const { pendingResult } = get()
      if (!pendingResult) return
      set((state) => {
        if (pendingResult.success) {
          state.snapshot = castDraft(pendingResult.snapshot)
        }
        state.pendingResult = null
        state.steps = []
        state.currentStepIndex = 0
        state.isPlaying = false
        state.currentStep = null
      })
      get()._syncVisualState()
    },

    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    stepForward: () => {
      const { currentStepIndex, steps, applyStep, commitOperation } = get()
      if (currentStepIndex < steps.length - 1) {
        applyStep(steps[currentStepIndex + 1])
      } else {
        commitOperation()
      }
    },
    stepBack: () => {
      const { currentStepIndex, steps, applyStep } = get()
      if (currentStepIndex > 0) {
        applyStep(steps[currentStepIndex - 1])
      }
    },
    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

    // Internal
    _syncVisualState: () => {
      const { snapshot } = get()
      set((state) => {
        const { nodes, edges } = computeLayout(snapshot)
        state.rfNodes = castDraft(nodes)
        state.rfEdges = castDraft(edges)
      })
    },

    _dispatchOperation: (result, logMessage) => {
      set((state) => {
        state.pendingResult = castDraft(result)
        state.steps = result.steps
        state.currentStepIndex = 0
        state.isPlaying = result.steps.length > 0
        if (result.steps.length > 0) {
          state.currentStep = result.steps[0]
        }
        state.operationLog.unshift(`${logMessage} ${result.success ? '(Success)' : '(Failed)'}`)
      })
      // Sync visual state BEFORE animation starts - keep existing layout
    },
  }))
)

// Selectors
export const selectors = {
  rfNodes: (s: GraphStore) => s.rfNodes,
  rfEdges: (s: GraphStore) => s.rfEdges,
  isPlaying: (s: GraphStore) => s.isPlaying,
  currentStepIndex: (s: GraphStore) => s.currentStepIndex,
  playbackSpeed: (s: GraphStore) => s.playbackSpeed,
  snapshot: (s: GraphStore) => s.snapshot,
  operationLog: (s: GraphStore) => s.operationLog,
  currentStep: (s: GraphStore) => s.currentStep,
  traversalAlgorithm: (s: GraphStore) => s.traversalAlgorithm,
  startVertex: (s: GraphStore) => s.startVertex,
  actions: (s: GraphStore) => ({
    runBFS: s.runBFS,
    runDFS: s.runDFS,
    reset: s.reset,
    setStartVertex: s.setStartVertex,
    setAlgorithm: s.setAlgorithm,
    applyStep: s.applyStep,
    commitOperation: s.commitOperation,
    play: s.play,
    pause: s.pause,
    stepForward: s.stepForward,
    stepBack: s.stepBack,
    setPlaybackSpeed: s.setPlaybackSpeed,
  }),
}
