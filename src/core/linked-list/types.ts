// ─────────────────────────────────────────────────────────────────────────────
// src/core/linked-list/types.ts
//
// Mathematical types for the linked list family.
// These types describe pure structural state — no coordinates, no colours.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The atomic unit of a linked list.
 *
 * `next` stores the **ID** of the successor node (not a JS object reference).
 * This makes the structure serializable, diffable, and directly mappable to
 * React Flow's edge `{source, target}` schema without any translation overhead.
 */
export interface ListNode<T = number> {
  /** Stable UUID that persists across mutations — bridges core ↔ visual layer. */
  id: string
  value: T
  /** ID of the next node, or null if this is the tail. */
  next: string | null
}

/**
 * The complete serializable state snapshot of a singly linked list.
 * This is what `OperationResult<SinglyListSnapshot>` carries as `snapshot`.
 */
export interface SinglyListSnapshot {
  /** Adjacency map: id → ListNode. O(1) lookup by ID. */
  nodeMap: ReadonlyMap<string, ListNode>
  /** ID of the head node, or null if list is empty. */
  head: string | null
  /** Cached size for O(1) length reporting. */
  size: number
}

/**
 * Doubly-linked list node extends the singly node with a `prev` pointer.
 */
export interface DoublyListNode<T = number> extends ListNode<T> {
  /** ID of the predecessor node, or null if this is the head. */
  prev: string | null
}

export interface DoublyListSnapshot {
  nodeMap: ReadonlyMap<string, DoublyListNode>
  head: string | null
  tail: string | null
  size: number
}
