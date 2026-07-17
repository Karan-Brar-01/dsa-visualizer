// ─────────────────────────────────────────────────────────────────────────────
// src/types/animation.ts
//
// Shared animation and step-sequencer types.
// These are the "protocol" between the mathematical core and the visual layer.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single discrete moment during an operation's execution.
 * The step sequencer (useAnimationSequencer) ticks through these in order,
 * mutating only highlight/animation state — never the structural state.
 */
export interface AnimationStep {
  /** Monotonically increasing index within an operation's step sequence. */
  stepIndex: number

  /** Human-readable narration for the educational footer log. */
  description: string

  /** Node IDs whose visual highlight state should change at this step. */
  highlights: StepHighlight[]

  /**
   * If this step involves a pointer reassignment (next/prev pointer change),
   * describe the mutation so the edge layer can animate accordingly.
   */
  pointerMutation?: PointerMutation

  /**
   * If a new node is being born at this step, include its ID.
   * The visual layer will play an entry animation on this node.
   */
  nodeSpawnId?: string

  /**
   * If a node is being destroyed at this step, include its ID.
   * The visual layer will play an exit animation before structural commit.
   */
  nodeDespawnId?: string
}

export interface StepHighlight {
  nodeId: string
  state: NodeHighlightState
}

/**
 * Describes a change to a directional pointer between two nodes.
 * Used by the edge layer to animate arrow repointing.
 */
export interface PointerMutation {
  /** The node whose `next` (or `prev`) pointer is changing. */
  sourceId: string
  /** The previous target (null = was pointing to NULL). */
  oldTargetId: string | null
  /** The new target (null = now pointing to NULL). */
  newTargetId: string | null
  /** Which pointer is mutating? Defaults to 'next' if omitted. */
  pointerType?: 'next' | 'prev'
}

/**
 * Semantic visual states for a rendered node.
 * Maps 1-to-1 to Tailwind's `node.*` color tokens.
 */
export type NodeHighlightState =
  | 'idle'       // default — no activity
  | 'active'     // currently being traversed / visited
  | 'comparing'  // being compared against a target value
  | 'mutating'   // currently being inserted or modified
  | 'deleted'    // marked for removal (exit animation pending)
  | 'found'      // search target located

/** Playback speed: maps to millisecond delays in the sequencer. */
export type PlaybackSpeed = 'slow' | 'normal' | 'fast'

export const PLAYBACK_SPEED_MS: Record<PlaybackSpeed, number> = {
  slow: 1200,
  normal: 650,
  fast: 250,
}
