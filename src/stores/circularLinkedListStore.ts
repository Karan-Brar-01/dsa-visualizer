// ─────────────────────────────────────────────────────────────────────────────
// src/stores/circularLinkedListStore.ts
//
// Zustand store for the Singly Linked List visualizer.
//
// Stratified into three named slices (enforced by TypeScript interfaces):
//   1. MathematicalState — the ground truth structural state.
//   2. VisualState       — the derived React Flow node/edge arrays.
//   3. AnimationState    — the step sequencer's playback state.
//
// The one-way data flow is:
//
//   Action (insertHead, etc.)
//     → Core engine (CircularLinkedList) returns OperationResult
//       → AnimationState populated with steps
//         → useAnimationSequencer ticks through steps (mutates VisualState only)
//           → on final step: commitOperation atomically updates MathematicalState
//             → _syncVisualState() recomputes rfNodes + rfEdges from nodeMap
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { castDraft } from 'immer'
import type { Node as RFNode, Edge as RFEdge } from 'reactflow'
import { CircularLinkedList } from '@/core/linked-list/CircularLinkedList'
import type { SinglyListSnapshot } from '@/core/linked-list/types'
import type { OperationResult } from '@/core/shared/OperationResult'
import type { AnimationStep, PlaybackSpeed } from '@/types/animation'
import type { ListNodeData, PointerEdgeData } from '@/types/flow'

// ─── Layout constants ─────────────────────────────────────────────────────────

/**
 * Horizontal spacing between node centres on the canvas.
 * React Flow measures in logical pixels; the canvas is zoomed/panned freely.
 */
const NODE_HORIZONTAL_SPACING = 160
const NODE_Y = 220
const NULL_SENTINEL_OFFSET = 120

// ─── Slice interfaces ─────────────────────────────────────────────────────────

/**
 * SLICE 1: Mathematical State
 *
 * Contains the ground-truth structural data.
 * Never modified during animation playback — only updated when
 * commitOperation is called after all animation steps are done.
 */
interface MathematicalState {
  /** Stable reference to the pure engine instance. */
  readonly _engine: CircularLinkedList
  /** Live snapshot of the engine state. Kept in sync with _engine. */
  snapshot: SinglyListSnapshot
}

/**
 * SLICE 2: Visual / Layout State
 *
 * Derived from MathematicalState by _syncVisualState().
 * During step playback, only `data.highlightState` on individual nodes
 * is mutated — the structural arrays (rfNodes, rfEdges) remain stable.
 */
interface VisualState {
  rfNodes: RFNode<ListNodeData>[]
  rfEdges: RFEdge<PointerEdgeData>[]
}

/**
 * SLICE 3: Animation / Step-Sequencer State
 *
 * Drives the visual playback engine (useAnimationSequencer hook).
 * Completely independent of the structural state.
 */
interface AnimationState {
  isPlaying: boolean
  currentStepIndex: number
  steps: AnimationStep[]
  playbackSpeed: PlaybackSpeed
  pendingResult: OperationResult<SinglyListSnapshot> | null
  /** Human-readable log shown in the educational footer. */
  operationLog: string[]
}

// ─── Action interfaces ────────────────────────────────────────────────────────

interface MathActions {
  insertHead: (value: number) => void
  insertTail: (value: number) => void
  deleteHead: () => void
  deleteTail: () => void
  reset: () => void
}

interface AnimationActions {
  /**
   * Called by useAnimationSequencer on each tick.
   * Applies highlight mutations from the current step to rfNodes/rfEdges.
   * Does NOT commit structural state.
   */
  applyStep: (step: AnimationStep) => void

  /**
   * Called by useAnimationSequencer after the final step.
   * Atomically commits the structural snapshot and recomputes visual state.
   */
  commitOperation: () => void

  play: () => void
  pause: () => void
  stepForward: () => void
  stepBack: () => void
  setPlaybackSpeed: (speed: PlaybackSpeed) => void
}

interface InternalActions {
  /**
   * Recomputes rfNodes and rfEdges from the current snapshot.
   * Uses a simple left-to-right horizontal layout.
   * Called only from commitOperation and reset — never during animation.
   */
  _syncVisualState: () => void

  /**
   * Bootstraps an operation: populates steps, sets pendingResult,
   * resets step counter, and starts playback.
   */
  _dispatchOperation: (result: OperationResult<SinglyListSnapshot>) => void

  _appendLog: (message: string) => void
}

// ─── Full store type ──────────────────────────────────────────────────────────

type CircularLinkedListStore =
  MathematicalState &
  VisualState &
  AnimationState &
  MathActions &
  AnimationActions &
  InternalActions

// ─── Layout computation (pure function, not part of the store) ────────────────

/**
 * Computes the React Flow node and edge arrays from a structural snapshot.
 *
 * Layout strategy: left-to-right horizontal chain.
 * Each node gets position { x: index * spacing, y: NODE_Y }.
 * A virtual NULL sentinel node is appended at the tail.
 */
function computeLayout(snapshot: SinglyListSnapshot): {
  nodes: RFNode<ListNodeData>[]
  edges: RFEdge<PointerEdgeData>[]
} {
  const nodes: RFNode<ListNodeData>[] = []
  const edges: RFEdge<PointerEdgeData>[] = []

  if (snapshot.head === null) return { nodes, edges }

  // Walk the chain in order, stopping when we hit the head again (or null just in case)
  const orderedIds: string[] = []
  let currentId: string | null = snapshot.head
  do {
    orderedIds.push(currentId)
    currentId = snapshot.nodeMap.get(currentId)?.next ?? null
  } while (currentId !== null && currentId !== snapshot.head)

  orderedIds.forEach((id, index) => {
    const node = snapshot.nodeMap.get(id)!
    const isHead = index === 0
    const isTail = index === orderedIds.length - 1

    nodes.push({
      id,
      type: 'listNode',
      position: { x: index * NODE_HORIZONTAL_SPACING, y: NODE_Y },
      data: {
        value: node.value,
        isHead,
        isTail,
        highlightState: 'idle',
        isSpawning: false,
        isDespawning: false,
      },
      // Prevent RF from moving nodes — layout is controlled by the store
      draggable: false,
    })

    // Edge to next node
    if (node.next !== null) {
      const isReturnEdge = node.next === snapshot.head && isTail
      edges.push({
        id: `edge-${id}-next-${node.next}`,
        source: id,
        target: node.next,
        sourceHandle: isReturnEdge ? 'bottom' : 'right',
        targetHandle: isReturnEdge ? 'bottom' : 'left',
        type: 'pointerEdge',
        data: { isTraversing: false, isNull: false, isReturn: isReturnEdge },
        animated: false,
      })
    }
  })

  return { nodes, edges }
}

// ─── Initial state ────────────────────────────────────────────────────────────

const engine = new CircularLinkedList()

const initialSnapshot: SinglyListSnapshot = engine.getSnapshot()

const INITIAL_STATE: Omit<
  CircularLinkedListStore,
  | 'insertHead' | 'insertTail' 
  | 'deleteHead' | 'deleteTail' 
   | 'reset'
  | 'applyStep' | 'commitOperation'
  | 'play' | 'pause' | 'stepForward' | 'stepBack' | 'setPlaybackSpeed'
  | '_syncVisualState' | '_dispatchOperation' | '_appendLog'
> = {
  _engine: engine,
  snapshot: initialSnapshot,
  rfNodes: [],
  rfEdges: [],
  isPlaying: false,
  currentStepIndex: 0,
  steps: [],
  playbackSpeed: 'normal',
  pendingResult: null,
  operationLog: ['Linked list initialized. Ready for operations.'],
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCircularLinkedListStore = create<CircularLinkedListStore>()(
  immer((set, get) => ({
    ...INITIAL_STATE,

    // ── Internal helpers ────────────────────────────────────────────────────

    _syncVisualState() {
      const { snapshot, pendingResult } = get()
      const activeSnapshot = pendingResult?.success ? pendingResult.snapshot : snapshot
      const { nodes, edges } = computeLayout(activeSnapshot)
      set((state) => {
        state.rfNodes = nodes
        state.rfEdges = edges
      })
    },

    _dispatchOperation(result) {
      set((state) => {
        state.pendingResult = castDraft(result)
        state.steps = result.steps
        state.currentStepIndex = 0
        state.isPlaying = result.steps.length > 0
      })
      get()._appendLog(result.message)
      get()._syncVisualState()
    },

    _appendLog(message) {
      set((state) => {
        // Keep last 50 log entries
        state.operationLog = [message, ...state.operationLog].slice(0, 50)
      })
    },

    // ── Math actions ─────────────────────────────────────────────────────────

    insertHead(value) {
      const result = get()._engine.insertHead(value)
      get()._dispatchOperation(result)
    },

    insertTail(value) {
      const result = get()._engine.insertTail(value)
      get()._dispatchOperation(result)
    },

    deleteHead() {
      const result = get()._engine.deleteHead()
      get()._dispatchOperation(result)
    },

    deleteTail() {
      const result = get()._engine.deleteTail()
      get()._dispatchOperation(result)
    },

    reset() {
      const emptySnapshot = get()._engine.reset()
      set((state) => {
        state.snapshot = castDraft(emptySnapshot)
        state.steps = []
        state.currentStepIndex = 0
        state.isPlaying = false
        state.pendingResult = null
        state.operationLog = ['List reset.']
      })
      get()._syncVisualState()
    },

    // ── Animation actions ────────────────────────────────────────────────────

    applyStep(step) {
      set((state) => {
        state.currentStepIndex = step.stepIndex

        // Reset all nodes to idle first, then apply this step's highlights
        state.rfNodes = state.rfNodes.map((n) => {
          if (n.type === 'nullSentinel') return n
          return {
            ...n,
            data: { ...n.data, highlightState: 'idle', isSpawning: false, isDespawning: false },
          }
        })

        // Apply highlights from this step
        step.highlights.forEach((h) => {
          const nodeIndex = state.rfNodes.findIndex((n) => n.id === h.nodeId)
          if (nodeIndex !== -1) {
            state.rfNodes[nodeIndex].data.highlightState = h.state
          }
        })

        // Handle spawn animation
        if (step.nodeSpawnId) {
          const nodeIndex = state.rfNodes.findIndex((n) => n.id === step.nodeSpawnId)
          if (nodeIndex !== -1) {
            state.rfNodes[nodeIndex].data.isSpawning = true
          }
        }

        // Handle despawn animation
        if (step.nodeDespawnId) {
          const nodeIndex = state.rfNodes.findIndex((n) => n.id === step.nodeDespawnId)
          if (nodeIndex !== -1) {
            state.rfNodes[nodeIndex].data.isDespawning = true
          }
        }

        // Animate pointer edge traversal
        if (step.pointerMutation) {
          const { sourceId, newTargetId } = step.pointerMutation
          state.rfEdges = state.rfEdges.map((e) => ({
            ...e,
            data: {
              ...e.data,
              isTraversing: e.source === sourceId && e.target === newTargetId,
            } as PointerEdgeData,
            animated: e.source === sourceId && e.target === newTargetId,
          }))
        }
      })
    },

    commitOperation() {
      const { pendingResult } = get()
      if (!pendingResult) return

      set((state) => {
        // Only commit if the operation was structurally successful
        if (pendingResult.success) {
          state.snapshot = castDraft(pendingResult.snapshot)
        }
        state.pendingResult = null
        state.steps = []
        state.currentStepIndex = 0
        state.isPlaying = false
      })

      // Recompute the full visual state from the committed snapshot
      get()._syncVisualState()
    },

    play() {
      set((state) => { state.isPlaying = true })
    },

    pause() {
      set((state) => { state.isPlaying = false })
    },

    stepForward() {
      const { steps, currentStepIndex } = get()
      if (currentStepIndex < steps.length - 1) {
        get().applyStep(steps[currentStepIndex + 1])
      } else if (currentStepIndex === steps.length - 1) {
        get().commitOperation()
      }
    },

    stepBack() {
      const { steps, currentStepIndex } = get()
      if (currentStepIndex > 0) {
        get().applyStep(steps[currentStepIndex - 1])
      }
    },

    setPlaybackSpeed(speed) {
      set((state) => { state.playbackSpeed = speed })
    },
  }))
)

// ─── Selectors (memoization helpers for consumers) ────────────────────────────

/**
 * Use these selectors to avoid subscribing to the entire store.
 * Example: const rfNodes = useCircularLinkedListStore(selectors.rfNodes)
 */
export const selectors = {
  rfNodes: (s: CircularLinkedListStore) => s.rfNodes,
  rfEdges: (s: CircularLinkedListStore) => s.rfEdges,
  snapshot: (s: CircularLinkedListStore) => s.snapshot,
  isPlaying: (s: CircularLinkedListStore) => s.isPlaying,
  currentStep: (s: CircularLinkedListStore) => s.steps[s.currentStepIndex] ?? null,
  steps: (s: CircularLinkedListStore) => s.steps,
  currentStepIndex: (s: CircularLinkedListStore) => s.currentStepIndex,
  playbackSpeed: (s: CircularLinkedListStore) => s.playbackSpeed,
  operationLog: (s: CircularLinkedListStore) => s.operationLog,
  listSize: (s: CircularLinkedListStore) => s.snapshot.size,
  actions: (s: CircularLinkedListStore): MathActions & AnimationActions => ({
    insertHead: s.insertHead,
    insertTail: s.insertTail,
    deleteHead: s.deleteHead,
    deleteTail: s.deleteTail,
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
