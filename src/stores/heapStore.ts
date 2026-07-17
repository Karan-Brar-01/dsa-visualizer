// ─────────────────────────────────────────────────────────────────────────────
// src/stores/heapStore.ts
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { castDraft } from 'immer'
import type { Node as RFNode, Edge as RFEdge } from 'reactflow'
import { Heap } from '@/core/trees/heap/Heap'
import type { HeapSnapshot, HeapType } from '@/core/trees/heap/types'
import type { OperationResult } from '@/core/shared/OperationResult'
import type { AnimationStep, PlaybackSpeed } from '@/types/animation'
import type { TreeNodeData, TreeEdgeData } from '@/types/flow'

// ─── Layout ───────────────────────────────────────────────────────────────────

const NODE_W = 64
const LEVEL_H = 100
const BASE_X_GAP = 280

function computeHeapLayout(snapshot: HeapSnapshot): {
  nodes: RFNode<TreeNodeData>[]
  edges: RFEdge<TreeEdgeData>[]
} {
  const nodes: RFNode<TreeNodeData>[] = []
  const edges: RFEdge<TreeEdgeData>[] = []
  const { data } = snapshot

  if (data.length === 0) return { nodes, edges }

  for (let i = 0; i < data.length; i++) {
    const depth = Math.floor(Math.log2(i + 1))
    const posInLevel = i - (Math.pow(2, depth) - 1)
    const levelWidth = Math.pow(2, depth)
    const xGap = Math.max(BASE_X_GAP / Math.pow(2, depth - 1), NODE_W + 16)
    const totalWidth = (levelWidth - 1) * xGap
    const x = posInLevel * xGap - totalWidth / 2

    nodes.push({
      id: `heap-${i}`,
      type: 'treeNode',
      position: { x, y: depth * LEVEL_H + 50 },
      data: {
        value: data[i],
        height: 0,
        balanceFactor: 0,
        isRoot: i === 0,
        highlightState: 'idle',
        isSpawning: false,
        isDespawning: false,
      },
      draggable: false,
    })

    if (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      edges.push({
        id: `e-heap-${parent}-${i}`,
        source: `heap-${parent}`,
        target: `heap-${i}`,
        type: 'treeEdge',
        data: { isHighlighted: false, isTraversing: false },
        animated: false,
      })
    }
  }

  return { nodes, edges }
}

// ─── Store types ──────────────────────────────────────────────────────────────

type HeapStore = {
  _engine: Heap
  snapshot: HeapSnapshot
  heapType: HeapType
  rfNodes: RFNode<TreeNodeData>[]
  rfEdges: RFEdge<TreeEdgeData>[]
  isPlaying: boolean
  currentStepIndex: number
  steps: AnimationStep[]
  playbackSpeed: PlaybackSpeed
  pendingResult: OperationResult<HeapSnapshot> | null
  operationLog: string[]
  currentStep: AnimationStep | null

  insert: (value: number) => void
  extractRoot: () => void
  reset: () => void
  setHeapType: (type: HeapType) => void

  applyStep: (step: AnimationStep) => void
  commitOperation: () => void
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBack: () => void
  setPlaybackSpeed: (speed: PlaybackSpeed) => void

  _syncVisualState: () => void
  _dispatchOperation: (result: OperationResult<HeapSnapshot>, log: string) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

const eng = new Heap('min')
const snap = eng.reset()

export const useHeapStore = create<HeapStore>()(
  immer((set, get) => ({
    _engine: eng,
    snapshot: castDraft(snap),
    heapType: 'min',
    rfNodes: [],
    rfEdges: [],
    isPlaying: false,
    currentStepIndex: 0,
    steps: [],
    playbackSpeed: 'normal',
    pendingResult: null,
    operationLog: [],
    currentStep: null,

    insert: (value) => {
      const result = get()._engine.insert(value)
      get()._dispatchOperation(result, `Insert(${value})`)
    },
    extractRoot: () => {
      const { heapType } = get()
      const result = get()._engine.extractRoot()
      get()._dispatchOperation(result, `Extract${heapType === 'min' ? 'Min' : 'Max'}()`)
    },
    reset: () => {
      const { heapType } = get()
      get()._engine.setType(heapType)
      const s = get()._engine.reset()
      set((state) => {
        state.snapshot = castDraft(s)
        state.steps = []
        state.currentStepIndex = 0
        state.isPlaying = false
        state.pendingResult = null
        state.operationLog = []
        state.currentStep = null
      })
      get()._syncVisualState()
    },
    setHeapType: (type) => {
      get()._engine.setType(type)
      set({ heapType: type })
      get().reset()
    },

    applyStep: (step) => {
      set((state) => {
        state.currentStepIndex = step.stepIndex
        state.currentStep = step
        state.rfNodes.forEach((n) => { n.data.highlightState = 'idle' })
        state.rfEdges.forEach((e) => { if (e.data) e.data.isTraversing = false })
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
        if (pendingResult.success) state.snapshot = castDraft(pendingResult.snapshot)
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
      if (currentStepIndex < steps.length - 1) applyStep(steps[currentStepIndex + 1])
      else commitOperation()
    },
    stepBack: () => {
      const { currentStepIndex, steps, applyStep } = get()
      if (currentStepIndex > 0) applyStep(steps[currentStepIndex - 1])
    },
    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

    _syncVisualState: () => {
      const { snapshot, pendingResult } = get()
      const active = pendingResult?.success ? pendingResult.snapshot : snapshot
      set((state) => {
        const { nodes, edges } = computeHeapLayout(active)
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
        if (result.steps.length > 0) state.currentStep = result.steps[0]
        state.operationLog.unshift(`${logMessage} ${result.success ? '(Success)' : '(Failed)'}`)
      })
      get()._syncVisualState()
    },
  }))
)

export const selectors = {
  rfNodes:    (s: HeapStore) => s.rfNodes,
  rfEdges:    (s: HeapStore) => s.rfEdges,
  isPlaying:  (s: HeapStore) => s.isPlaying,
  currentStepIndex: (s: HeapStore) => s.currentStepIndex,
  playbackSpeed: (s: HeapStore) => s.playbackSpeed,
  snapshot:   (s: HeapStore) => s.snapshot,
  heapType:   (s: HeapStore) => s.heapType,
  operationLog: (s: HeapStore) => s.operationLog,
  currentStep: (s: HeapStore) => s.currentStep,
  actions: (s: HeapStore) => ({
    insert: s.insert,
    extractRoot: s.extractRoot,
    reset: s.reset,
    setHeapType: s.setHeapType,
    applyStep: s.applyStep,
    commitOperation: s.commitOperation,
    play: s.play,
    pause: s.pause,
    stepForward: s.stepForward,
    stepBack: s.stepBack,
    setPlaybackSpeed: s.setPlaybackSpeed,
  }),
}
