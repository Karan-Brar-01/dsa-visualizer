// ─────────────────────────────────────────────────────────────────────────────
// src/stores/avlStore.ts
//
// Zustand store for the AVL Tree visualizer.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { castDraft } from 'immer'
import type { Node as RFNode, Edge as RFEdge } from 'reactflow'
import { AVLTree } from '@/core/trees/avl/AVLTree'
import type { AVLSnapshot } from '@/core/trees/avl/types'
import type { OperationResult } from '@/core/shared/OperationResult'
import type { AnimationStep, PlaybackSpeed } from '@/types/animation'
import type { TreeNodeData, TreeEdgeData } from '@/types/flow'

// ─── Layout constants ─────────────────────────────────────────────────────────

const NODE_WIDTH = 64
const NODE_HEIGHT = 64
const LEVEL_HEIGHT = 100
const BASE_OFFSET = 300 // Horizontal distance from parent to child at depth 1

// ─── Slice interfaces ─────────────────────────────────────────────────────────

interface MathematicalState {
  readonly _engine: AVLTree
  snapshot: AVLSnapshot
}

interface VisualState {
  rfNodes: RFNode<TreeNodeData>[]
  rfEdges: RFEdge<TreeEdgeData>[]
}

interface AnimationState {
  isPlaying: boolean
  currentStepIndex: number
  steps: AnimationStep[]
  playbackSpeed: PlaybackSpeed
  pendingResult: OperationResult<AVLSnapshot> | null
  operationLog: string[]
  currentStep: AnimationStep | null
  listSize: number
}

// ─── Action interfaces ────────────────────────────────────────────────────────

interface MathActions {
  insert: (value: number) => void
  search: (value: number) => void
  delete: (value: number) => void
  reset: () => void
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
  _dispatchOperation: (result: OperationResult<AVLSnapshot>, logMessage: string) => void
  _appendLog: (message: string) => void
}

type AVLStore =
  MathematicalState &
  VisualState &
  AnimationState &
  MathActions &
  AnimationActions &
  InternalActions

// ─── Layout computation ───────────────────────────────────────────────────────

function computeLayout(snapshot: AVLSnapshot): {
  nodes: RFNode<TreeNodeData>[]
  edges: RFEdge<TreeEdgeData>[]
} {
  const nodes: RFNode<TreeNodeData>[] = []
  const edges: RFEdge<TreeEdgeData>[] = []

  if (!snapshot.root) return { nodes, edges }

  // Recursive layout
  function traverse(
    nodeId: string,
    depth: number,
    x: number,
    y: number
  ) {
    const node = snapshot.nodeMap.get(nodeId)
    if (!node) return

    nodes.push({
      id: node.id,
      type: 'treeNode',
      position: { x, y },
      data: {
        value: node.value,
        height: node.height,
        balanceFactor: 0,
        isRoot: nodeId === snapshot.root,
        highlightState: 'idle',
        isSpawning: false,
        isDespawning: false,
      },
      draggable: false,
    })

    const xOffset = Math.max(BASE_OFFSET / Math.pow(2, depth), NODE_WIDTH + 20)
    const childY = y + LEVEL_HEIGHT

    if (node.left) {
      edges.push({
        id: `e-${node.id}-${node.left}`,
        source: node.id,
        target: node.left,
        type: 'treeEdge',
        data: { isHighlighted: false, isTraversing: false },
        animated: false,
      })
      traverse(node.left, depth + 1, x - xOffset, childY)
    }

    if (node.right) {
      edges.push({
        id: `e-${node.id}-${node.right}`,
        source: node.id,
        target: node.right,
        type: 'treeEdge',
        data: { isHighlighted: false, isTraversing: false },
        animated: false,
      })
      traverse(node.right, depth + 1, x + xOffset, childY)
    }
  }

  // Root starts at x=0, y=50. The React Flow fitView will center it.
  traverse(snapshot.root, 1, 0, 50)

  return { nodes, edges }
}

// ─── Store implementation ─────────────────────────────────────────────────────

const initialEngine = new AVLTree()
const initialSnapshot = initialEngine.reset()

export const useAVLStore = create<AVLStore>()(
  immer((set, get) => ({
    // MathematicalState
    _engine: initialEngine,
    snapshot: castDraft(initialSnapshot),

    // VisualState
    rfNodes: [],
    rfEdges: [],

    // AnimationState
    isPlaying: false,
    currentStepIndex: 0,
    steps: [],
    playbackSpeed: 'normal',
    pendingResult: null,
    operationLog: [],
    currentStep: null,
    listSize: 0,

    // MathActions
    insert: (value) => {
      const result = get()._engine.insert(value)
      get()._dispatchOperation(result, `Insert(${value})`)
    },
    search: (value) => {
      const result = get()._engine.search(value)
      get()._dispatchOperation(result, `Search(${value})`)
    },
    delete: (value) => {
      const result = get()._engine.delete(value)
      get()._dispatchOperation(result, `Delete(${value})`)
    },
    reset: () => {
      const emptySnapshot = get()._engine.reset()
      set((state) => {
        state.snapshot = castDraft(emptySnapshot)
        state.steps = []
        state.currentStepIndex = 0
        state.isPlaying = false
        state.pendingResult = null
        state.operationLog = []
        state.currentStep = null
        state.listSize = 0
      })
      get()._syncVisualState()
    },

    // AnimationActions
    applyStep: (step) => {
      set((state) => {
        state.currentStepIndex = step.stepIndex
        state.currentStep = step

        // Reset all highlights
        state.rfNodes.forEach((n) => { n.data.highlightState = 'idle' })
        state.rfEdges.forEach((e) => { if (e.data) e.data.isTraversing = false })

        // Apply new highlights
        step.highlights.forEach(({ nodeId, state: hState }) => {
          const node = state.rfNodes.find((n) => n.id === nodeId)
          if (node) node.data.highlightState = hState
        })

        // Edge traversal animations
        if (step.pointerMutation) {
          const { sourceId, newTargetId } = step.pointerMutation
          if (newTargetId) {
             const edgeId = `e-${sourceId}-${newTargetId}`
             const edge = state.rfEdges.find(e => e.id === edgeId)
             if (edge && edge.data) edge.data.isTraversing = true
          }
        } else {
           // If we just traversed (active), we want to highlight the edge we came down on.
           const activeNodes = step.highlights.filter(h => h.state === 'active' || h.state === 'comparing').map(h => h.nodeId)
           if (activeNodes.length > 0) {
               activeNodes.forEach(activeId => {
                   // Find the edge pointing TO this node
                   const edge = state.rfEdges.find(e => e.target === activeId)
                   if (edge && edge.data) {
                       edge.data.isTraversing = true
                   }
               })
           }
        }
      })
    },

    commitOperation: () => {
      const { pendingResult } = get()
      if (!pendingResult) return

      set((state) => {
        if (pendingResult.success) {
          state.snapshot = castDraft(pendingResult.snapshot)
          state.listSize = pendingResult.snapshot.size
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

    // InternalActions
    _syncVisualState: () => {
      const { snapshot, pendingResult } = get()
      const activeSnapshot = pendingResult?.success ? pendingResult.snapshot : snapshot
      
      const isDelete = pendingResult?.kind === 'AVL_DELETE'
      
      set((state) => {
        const { nodes, edges } = computeLayout(activeSnapshot)
        
        // Handle spawn/despawn transitions based on step nodeSpawnId
        if (pendingResult && pendingResult.success) {
            if (pendingResult.kind === 'AVL_INSERT') {
                const insertedId = pendingResult.steps.find(s => s.nodeSpawnId)?.nodeSpawnId
                if (insertedId) {
                   const insertedNode = nodes.find(n => n.id === insertedId)
                   if (insertedNode) insertedNode.data.isSpawning = true
                }
            }
        }
        
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
        
        state.operationLog.unshift(
          `${logMessage} ${result.success ? '(Success)' : '(Failed)'}`
        )
      })
      get()._syncVisualState()
    },
    _appendLog: (message) => {
      set((state) => {
        state.operationLog.unshift(message)
      })
    },
  }))
)

// Selectors
export const selectors = {
  rfNodes: (s: AVLStore) => s.rfNodes,
  rfEdges: (s: AVLStore) => s.rfEdges,
  isPlaying: (s: AVLStore) => s.isPlaying,
  currentStepIndex: (s: AVLStore) => s.currentStepIndex,
  playbackSpeed: (s: AVLStore) => s.playbackSpeed,
  snapshot: (s: AVLStore) => s.snapshot,
  operationLog: (s: AVLStore) => s.operationLog,
  currentStep: (s: AVLStore) => s.currentStep,
  listSize: (s: AVLStore) => s.listSize,
  actions: (s: AVLStore) => ({
    insert: s.insert,
    search: s.search,
    delete: s.delete,
    reset: s.reset,
    applyStep: s.applyStep,
    commitOperation: s.commitOperation,
    play: s.play,
    pause: s.pause,
    stepForward: s.stepForward,
    stepBack: s.stepBack,
    setPlaybackSpeed: s.setPlaybackSpeed,
  }),
}
