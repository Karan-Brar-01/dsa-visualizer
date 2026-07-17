// ─────────────────────────────────────────────────────────────────────────────
// src/core/shared/OperationResult.ts
//
// The typed return contract for every data structure operation.
// The Zustand store only consumes OperationResult — it never inspects
// the internals of the data structure class directly.
// ─────────────────────────────────────────────────────────────────────────────

import type { AnimationStep } from '@/types/animation'

/**
 * Every mutating or searching operation on any data structure must return
 * an OperationResult. This is the single boundary between the math core
 * and the visual/store layer.
 */
export interface OperationResult<TState = unknown> {
  /** The kind of operation that produced this result. */
  kind: OperationKind

  /** Whether the operation succeeded (e.g. false if delete on empty list). */
  success: boolean

  /** Human-readable summary for the educational log. */
  message: string

  /**
   * A complete snapshot of the data structure's state AFTER the operation.
   * This is what gets committed to the store on animation completion.
   * Using a snapshot (not a reference) keeps the store/core boundary clean.
   */
  snapshot: TState

  /**
   * Ordered sequence of animation steps.
   * The sequencer plays these in order before committing the snapshot.
   */
  steps: AnimationStep[]

  /** Measured time complexity label for this operation. */
  complexity: {
    time: string
    space: string
  }
}

/**
 * All operation kinds across all data structures.
 * Kept in one place so the educational footer can pattern-match.
 */
export type OperationKind =
  // Linked List
  | 'LL_INSERT_HEAD'
  | 'LL_INSERT_TAIL'
  | 'LL_INSERT_AT'
  | 'LL_DELETE_HEAD'
  | 'LL_DELETE_TAIL'
  | 'LL_DELETE_AT'
  | 'LL_SEARCH'
  | 'DLL_INSERT_HEAD'
  | 'DLL_INSERT_TAIL'
  | 'DLL_DELETE_HEAD'
  | 'DLL_DELETE_TAIL'
  | 'CLL_INSERT_HEAD'
  | 'CLL_INSERT_TAIL'
  | 'CLL_DELETE_HEAD'
  | 'CLL_DELETE_TAIL'
  // Tree
  | 'BST_INSERT'
  | 'BST_DELETE'
  | 'BST_SEARCH'
  | 'AVL_INSERT'
  | 'AVL_DELETE'
  | 'AVL_SEARCH'
  | 'TREE_ROTATE_LEFT'
  | 'TREE_ROTATE_RIGHT'
  // Graph
  | 'GRAPH_BFS'
  | 'GRAPH_DFS'
  | 'GRAPH_ADD_VERTEX'
  | 'GRAPH_ADD_EDGE'
