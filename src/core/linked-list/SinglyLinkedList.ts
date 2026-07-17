// ─────────────────────────────────────────────────────────────────────────────
// src/core/linked-list/SinglyLinkedList.ts
//
// Pure TypeScript implementation of a Singly Linked List.
//
// CONTRACT:
//   - Zero imports from React, Next.js, Zustand, or the DOM.
//   - Every public method returns an OperationResult containing:
//       1. The post-mutation structural snapshot (nodeMap + head + size).
//       2. An ordered AnimationStep[] that the visual sequencer plays back.
//   - Internal state is never mutated in place during step construction —
//     we work on a draft, then swap atomically at the end of each method.
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid'
import type { AnimationStep, StepHighlight } from '@/types/animation'
import type { OperationResult } from '@/core/shared/OperationResult'
import type { ListNode, SinglyListSnapshot } from './types'

// ─── Internal working state ───────────────────────────────────────────────────

/** Mutable draft — only used inside method scopes, never exposed directly. */
interface Draft {
  nodeMap: Map<string, ListNode>
  head: string | null
  size: number
}

// ─── Step builder helpers ──────────────────────────────────────────────────────

let _stepCounter = 0

function nextStep(
  description: string,
  highlights: StepHighlight[],
  extras: Partial<Omit<AnimationStep, 'stepIndex' | 'description' | 'highlights'>> = {}
): AnimationStep {
  return { stepIndex: _stepCounter++, description, highlights, ...extras }
}

function highlight(nodeId: string, state: StepHighlight['state']): StepHighlight {
  return { nodeId, state }
}

// ─── Snapshot helper ──────────────────────────────────────────────────────────

function freezeSnapshot(draft: Draft): SinglyListSnapshot {
  // Deep-clone so the store's committed snapshot is immutable
  return {
    nodeMap: new Map(
      Array.from(draft.nodeMap.entries()).map(([k, v]) => [k, { ...v }])
    ),
    head: draft.head,
    size: draft.size,
  }
}

// ─── Main Class ───────────────────────────────────────────────────────────────

export class SinglyLinkedList {
  /** The live structural state. Mutations happen only inside operation methods. */
  private nodeMap: Map<string, ListNode> = new Map()
  private head: string | null = null
  private size: number = 0

  // ── Accessors ────────────────────────────────────────────────────────────────

  get length(): number {
    return this.size
  }

  get isEmpty(): boolean {
    return this.head === null
  }

  /** Returns the current snapshot without triggering an operation. */
  getSnapshot(): SinglyListSnapshot {
    return freezeSnapshot({
      nodeMap: this.nodeMap,
      head: this.head,
      size: this.size,
    })
  }

  // ── INSERT HEAD ──────────────────────────────────────────────────────────────

  /**
   * Inserts a new node at the head.
   *
   * Mathematical transitions:
   *   1. Allocate new node N with value v.
   *   2. N.next ← current head.
   *   3. head ← N.
   *
   * Time complexity: O(1)
   */
  insertHead(value: number): OperationResult<SinglyListSnapshot> {
    _stepCounter = 0
    const steps: AnimationStep[] = []

    const newId = uuidv4()
    const oldHead = this.head

    // Step 1: Announce new node creation
    steps.push(
      nextStep(`Allocating new node [${value}] with id …${newId.slice(-4)}`, [
        highlight(newId, 'mutating'),
      ], { nodeSpawnId: newId })
    )

    // Step 2: Repoint new node's `next` to old head
    if (oldHead !== null) {
      steps.push(
        nextStep(`Setting newNode.next → current head [${this.nodeMap.get(oldHead)?.value}]`, [
          highlight(newId, 'mutating'),
          highlight(oldHead, 'active'),
        ], {
          pointerMutation: {
            sourceId: newId,
            oldTargetId: null,
            newTargetId: oldHead,
          },
        })
      )
    }

    // Step 3: Move head pointer
    steps.push(
      nextStep(`head pointer now points to new node [${value}]`, [
        highlight(newId, 'found'),
        ...(oldHead ? [highlight(oldHead, 'idle')] : []),
      ])
    )

    // Commit structural mutation
    const newNode: ListNode = { id: newId, value, next: oldHead }
    this.nodeMap.set(newId, newNode)
    this.head = newId
    this.size += 1

    return {
      kind: 'LL_INSERT_HEAD',
      success: true,
      message: `Inserted ${value} at head. List size: ${this.size}.`,
      snapshot: freezeSnapshot({ nodeMap: this.nodeMap, head: this.head, size: this.size }),
      steps,
      complexity: { time: 'O(1)', space: 'O(1)' },
    }
  }

  // ── INSERT TAIL ──────────────────────────────────────────────────────────────

  /**
   * Inserts a new node at the tail.
   *
   * Mathematical transitions:
   *   1. If empty: delegate to insertHead.
   *   2. Traverse from head until current.next === null.  O(n)
   *   3. Allocate N. Set current.next ← N.
   *
   * Time complexity: O(n)
   */
  insertTail(value: number): OperationResult<SinglyListSnapshot> {
    _stepCounter = 0

    if (this.isEmpty) {
      return this.insertHead(value)
    }

    const steps: AnimationStep[] = []
    const newId = uuidv4()

    steps.push(
      nextStep(`List is non-empty. Traversing to find tail…`, [
        highlight(this.head!, 'active'),
      ])
    )

    // Traverse to tail, collecting steps at each hop
    let currentId = this.head!
    while (this.nodeMap.get(currentId)!.next !== null) {
      const nextId = this.nodeMap.get(currentId)!.next!
      steps.push(
        nextStep(
          `Visiting node [${this.nodeMap.get(currentId)!.value}] → next is [${this.nodeMap.get(nextId)!.value}]`,
          [
            highlight(currentId, 'comparing'),
            highlight(nextId, 'active'),
          ]
        )
      )
      currentId = nextId
    }

    const tailId = currentId

    // Allocate new node
    steps.push(
      nextStep(`Found tail [${this.nodeMap.get(tailId)!.value}]. Allocating new node [${value}].`, [
        highlight(tailId, 'active'),
        highlight(newId, 'mutating'),
      ], { nodeSpawnId: newId })
    )

    // Repoint tail.next → new node
    steps.push(
      nextStep(`tail.next ← new node [${value}]`, [
        highlight(tailId, 'mutating'),
        highlight(newId, 'mutating'),
      ], {
        pointerMutation: {
          sourceId: tailId,
          oldTargetId: null,
          newTargetId: newId,
        },
      })
    )

    // Done
    steps.push(
      nextStep(`Insertion complete. New tail is [${value}].`, [
        highlight(newId, 'found'),
      ])
    )

    // Commit
    const newNode: ListNode = { id: newId, value, next: null }
    this.nodeMap.set(newId, newNode)
    this.nodeMap.get(tailId)!.next = newId
    this.size += 1

    return {
      kind: 'LL_INSERT_TAIL',
      success: true,
      message: `Inserted ${value} at tail. List size: ${this.size}.`,
      snapshot: freezeSnapshot({ nodeMap: this.nodeMap, head: this.head, size: this.size }),
      steps,
      complexity: { time: 'O(n)', space: 'O(1)' },
    }
  }

  // ── INSERT AT INDEX ───────────────────────────────────────────────────────────

  /**
   * Inserts a new node at a given 0-based index.
   *
   * Mathematical transitions:
   *   - index = 0 → insertHead
   *   - index = size → insertTail
   *   - Otherwise: traverse to predecessor at index-1, splice N between
   *     predecessor and predecessor.next.
   *
   * Time complexity: O(n)
   */
  insertAt(index: number, value: number): OperationResult<SinglyListSnapshot> {
    _stepCounter = 0

    if (index < 0 || index > this.size) {
      return {
        kind: 'LL_INSERT_AT',
        success: false,
        message: `Index ${index} out of bounds (size: ${this.size}).`,
        snapshot: this.getSnapshot(),
        steps: [],
        complexity: { time: 'O(n)', space: 'O(1)' },
      }
    }

    if (index === 0) return this.insertHead(value)
    if (index === this.size) return this.insertTail(value)

    const steps: AnimationStep[] = []
    const newId = uuidv4()

    steps.push(
      nextStep(`Targeting index ${index}. Starting traversal from head.`, [
        highlight(this.head!, 'active'),
      ])
    )

    // Walk to predecessor (index - 1)
    let currentId = this.head!
    for (let i = 0; i < index - 1; i++) {
      const nextId = this.nodeMap.get(currentId)!.next!
      steps.push(
        nextStep(
          `At index ${i} → node [${this.nodeMap.get(currentId)!.value}]. Need index ${index - 1}.`,
          [
            highlight(currentId, 'comparing'),
            highlight(nextId, 'active'),
          ]
        )
      )
      currentId = nextId
    }

    const predecessorId = currentId
    const successorId = this.nodeMap.get(predecessorId)!.next!

    // Allocate new node
    steps.push(
      nextStep(`Found predecessor [${this.nodeMap.get(predecessorId)!.value}] at index ${index - 1}. Allocating new node [${value}].`, [
        highlight(predecessorId, 'active'),
        highlight(successorId, 'active'),
        highlight(newId, 'mutating'),
      ], { nodeSpawnId: newId })
    )

    // new.next ← successor
    steps.push(
      nextStep(`newNode.next ← [${this.nodeMap.get(successorId)!.value}]`, [
        highlight(predecessorId, 'active'),
        highlight(newId, 'mutating'),
        highlight(successorId, 'comparing'),
      ], {
        pointerMutation: {
          sourceId: newId,
          oldTargetId: null,
          newTargetId: successorId,
        },
      })
    )

    // predecessor.next ← new node
    steps.push(
      nextStep(`predecessor.next ← newNode [${value}]`, [
        highlight(predecessorId, 'mutating'),
        highlight(newId, 'found'),
        highlight(successorId, 'idle'),
      ], {
        pointerMutation: {
          sourceId: predecessorId,
          oldTargetId: successorId,
          newTargetId: newId,
        },
      })
    )

    // Commit
    const newNode: ListNode = { id: newId, value, next: successorId }
    this.nodeMap.set(newId, newNode)
    this.nodeMap.get(predecessorId)!.next = newId
    this.size += 1

    return {
      kind: 'LL_INSERT_AT',
      success: true,
      message: `Inserted ${value} at index ${index}. List size: ${this.size}.`,
      snapshot: freezeSnapshot({ nodeMap: this.nodeMap, head: this.head, size: this.size }),
      steps,
      complexity: { time: 'O(n)', space: 'O(1)' },
    }
  }

  // ── DELETE HEAD ──────────────────────────────────────────────────────────────

  /**
   * Removes the head node.
   *
   * Mathematical transitions:
   *   1. Capture old head reference.
   *   2. head ← old_head.next.
   *   3. Deallocate old head (remove from nodeMap).
   *
   * Time complexity: O(1)
   */
  deleteHead(): OperationResult<SinglyListSnapshot> {
    _stepCounter = 0

    if (this.isEmpty) {
      return {
        kind: 'LL_DELETE_HEAD',
        success: false,
        message: 'Cannot delete from an empty list.',
        snapshot: this.getSnapshot(),
        steps: [],
        complexity: { time: 'O(1)', space: 'O(1)' },
      }
    }

    const steps: AnimationStep[] = []
    const oldHeadId = this.head!
    const oldHeadNode = this.nodeMap.get(oldHeadId)!
    const newHeadId = oldHeadNode.next

    // Mark for deletion
    steps.push(
      nextStep(`Marking head node [${oldHeadNode.value}] for deletion.`, [
        highlight(oldHeadId, 'deleted'),
        ...(newHeadId ? [highlight(newHeadId, 'active')] : []),
      ])
    )

    // Move head pointer
    steps.push(
      nextStep(
        `head ← ${newHeadId ? `[${this.nodeMap.get(newHeadId)!.value}]` : 'null'}`,
        [
          highlight(oldHeadId, 'deleted'),
          ...(newHeadId ? [highlight(newHeadId, 'found')] : []),
        ],
        {
          pointerMutation: {
            sourceId: oldHeadId,
            oldTargetId: newHeadId,
            newTargetId: null,
          },
          nodeDespawnId: oldHeadId,
        }
      )
    )

    // Commit
    this.nodeMap.delete(oldHeadId)
    this.head = newHeadId
    this.size -= 1

    return {
      kind: 'LL_DELETE_HEAD',
      success: true,
      message: `Deleted head [${oldHeadNode.value}]. List size: ${this.size}.`,
      snapshot: freezeSnapshot({ nodeMap: this.nodeMap, head: this.head, size: this.size }),
      steps,
      complexity: { time: 'O(1)', space: 'O(1)' },
    }
  }

  // ── DELETE TAIL ──────────────────────────────────────────────────────────────

  /**
   * Removes the tail node.
   *
   * Mathematical transitions:
   *   - size = 1 → deleteHead.
   *   - Otherwise: traverse to the second-to-last node (the new tail).
   *     Set new_tail.next ← null. Deallocate old tail.
   *
   * Time complexity: O(n)
   */
  deleteTail(): OperationResult<SinglyListSnapshot> {
    _stepCounter = 0

    if (this.isEmpty) {
      return {
        kind: 'LL_DELETE_TAIL',
        success: false,
        message: 'Cannot delete from an empty list.',
        snapshot: this.getSnapshot(),
        steps: [],
        complexity: { time: 'O(n)', space: 'O(1)' },
      }
    }

    if (this.size === 1) return this.deleteHead()

    const steps: AnimationStep[] = []

    steps.push(
      nextStep(`Traversing to find node before tail…`, [
        highlight(this.head!, 'active'),
      ])
    )

    // Walk to second-to-last
    let currentId = this.head!
    while (this.nodeMap.get(currentId)!.next !== null &&
           this.nodeMap.get(this.nodeMap.get(currentId)!.next!)!.next !== null) {
      const nextId = this.nodeMap.get(currentId)!.next!
      steps.push(
        nextStep(
          `Node [${this.nodeMap.get(currentId)!.value}].next is not the tail — continuing.`,
          [
            highlight(currentId, 'comparing'),
            highlight(nextId, 'active'),
          ]
        )
      )
      currentId = nextId
    }

    const newTailId = currentId
    const oldTailId = this.nodeMap.get(newTailId)!.next!
    const oldTailValue = this.nodeMap.get(oldTailId)!.value

    // Mark tail for deletion
    steps.push(
      nextStep(`Found tail [${oldTailValue}]. Marking for deletion.`, [
        highlight(newTailId, 'active'),
        highlight(oldTailId, 'deleted'),
      ])
    )

    // Repoint new tail's next to null
    steps.push(
      nextStep(`newTail [${this.nodeMap.get(newTailId)!.value}].next ← null`, [
        highlight(newTailId, 'mutating'),
        highlight(oldTailId, 'deleted'),
      ], {
        pointerMutation: {
          sourceId: newTailId,
          oldTargetId: oldTailId,
          newTargetId: null,
        },
        nodeDespawnId: oldTailId,
      })
    )

    // Commit
    this.nodeMap.get(newTailId)!.next = null
    this.nodeMap.delete(oldTailId)
    this.size -= 1

    return {
      kind: 'LL_DELETE_TAIL',
      success: true,
      message: `Deleted tail [${oldTailValue}]. List size: ${this.size}.`,
      snapshot: freezeSnapshot({ nodeMap: this.nodeMap, head: this.head, size: this.size }),
      steps,
      complexity: { time: 'O(n)', space: 'O(1)' },
    }
  }

  // ── DELETE AT INDEX ───────────────────────────────────────────────────────────

  /**
   * Removes the node at a given 0-based index.
   *
   * Mathematical transitions:
   *   - index = 0 → deleteHead.
   *   - index = size-1 → deleteTail.
   *   - Otherwise: find predecessor at index-1, set predecessor.next ← node.next,
   *     deallocate node.
   *
   * Time complexity: O(n)
   */
  deleteAt(index: number): OperationResult<SinglyListSnapshot> {
    _stepCounter = 0

    if (index < 0 || index >= this.size) {
      return {
        kind: 'LL_DELETE_AT',
        success: false,
        message: `Index ${index} out of bounds (size: ${this.size}).`,
        snapshot: this.getSnapshot(),
        steps: [],
        complexity: { time: 'O(n)', space: 'O(1)' },
      }
    }

    if (index === 0) return this.deleteHead()
    if (index === this.size - 1) return this.deleteTail()

    const steps: AnimationStep[] = []

    steps.push(
      nextStep(`Targeting index ${index} for deletion. Starting traversal.`, [
        highlight(this.head!, 'active'),
      ])
    )

    let currentId = this.head!
    for (let i = 0; i < index - 1; i++) {
      const nextId = this.nodeMap.get(currentId)!.next!
      steps.push(
        nextStep(
          `At index ${i} → [${this.nodeMap.get(currentId)!.value}]. Need predecessor at index ${index - 1}.`,
          [
            highlight(currentId, 'comparing'),
            highlight(nextId, 'active'),
          ]
        )
      )
      currentId = nextId
    }

    const predecessorId = currentId
    const targetId = this.nodeMap.get(predecessorId)!.next!
    const successorId = this.nodeMap.get(targetId)!.next!
    const targetValue = this.nodeMap.get(targetId)!.value

    steps.push(
      nextStep(`Found target [${targetValue}] at index ${index}. Marking for deletion.`, [
        highlight(predecessorId, 'active'),
        highlight(targetId, 'deleted'),
        highlight(successorId, 'active'),
      ])
    )

    steps.push(
      nextStep(`predecessor.next ← [${this.nodeMap.get(successorId)!.value}] (bypassing target)`, [
        highlight(predecessorId, 'mutating'),
        highlight(targetId, 'deleted'),
        highlight(successorId, 'found'),
      ], {
        pointerMutation: {
          sourceId: predecessorId,
          oldTargetId: targetId,
          newTargetId: successorId,
        },
        nodeDespawnId: targetId,
      })
    )

    // Commit
    this.nodeMap.get(predecessorId)!.next = successorId
    this.nodeMap.delete(targetId)
    this.size -= 1

    return {
      kind: 'LL_DELETE_AT',
      success: true,
      message: `Deleted [${targetValue}] at index ${index}. List size: ${this.size}.`,
      snapshot: freezeSnapshot({ nodeMap: this.nodeMap, head: this.head, size: this.size }),
      steps,
      complexity: { time: 'O(n)', space: 'O(1)' },
    }
  }

  // ── SEARCH ────────────────────────────────────────────────────────────────────

  /**
   * Linear search for the first occurrence of `value`.
   *
   * Time complexity: O(n) worst case.
   */
  search(value: number): OperationResult<SinglyListSnapshot> {
    _stepCounter = 0
    const steps: AnimationStep[] = []

    if (this.isEmpty) {
      return {
        kind: 'LL_SEARCH',
        success: false,
        message: `List is empty. Cannot search for ${value}.`,
        snapshot: this.getSnapshot(),
        steps: [],
        complexity: { time: 'O(n)', space: 'O(1)' },
      }
    }

    steps.push(
      nextStep(`Searching for value [${value}]. Starting at head.`, [
        highlight(this.head!, 'active'),
      ])
    )

    let currentId: string | null = this.head
    let index = 0

    while (currentId !== null) {
      const node = this.nodeMap.get(currentId)!
      if (node.value === value) {
        steps.push(
          nextStep(`Found [${value}] at index ${index}! Search complete.`, [
            highlight(currentId, 'found'),
          ])
        )
        return {
          kind: 'LL_SEARCH',
          success: true,
          message: `Found ${value} at index ${index}.`,
          snapshot: this.getSnapshot(),
          steps,
          complexity: { time: 'O(n)', space: 'O(1)' },
        }
      }

      steps.push(
        nextStep(`Index ${index}: [${node.value}] ≠ ${value}. Moving to next.`, [
          highlight(currentId, 'comparing'),
          ...(node.next ? [highlight(node.next, 'active')] : []),
        ])
      )

      currentId = node.next
      index++
    }

    steps.push(
      nextStep(`Reached end of list. Value [${value}] not found.`, [])
    )

    return {
      kind: 'LL_SEARCH',
      success: false,
      message: `Value ${value} not found in the list.`,
      snapshot: this.getSnapshot(),
      steps,
      complexity: { time: 'O(n)', space: 'O(1)' },
    }
  }

  // ── RESET ─────────────────────────────────────────────────────────────────────

  /** Clears the list entirely. Returns a snapshot of the empty state. */
  reset(): SinglyListSnapshot {
    this.nodeMap.clear()
    this.head = null
    this.size = 0
    return this.getSnapshot()
  }
}
