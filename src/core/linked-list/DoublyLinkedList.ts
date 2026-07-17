// ─────────────────────────────────────────────────────────────────────────────
// src/core/linked-list/DoublyLinkedList.ts
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid'
import type { AnimationStep, StepHighlight } from '@/types/animation'
import type { OperationResult } from '@/core/shared/OperationResult'
import type { DoublyListNode, DoublyListSnapshot } from './types'

// ─── Internal working state ───────────────────────────────────────────────────

interface Draft {
  nodeMap: Map<string, DoublyListNode>
  head: string | null
  tail: string | null
  size: number
}

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

function freezeSnapshot(draft: Draft): DoublyListSnapshot {
  return {
    nodeMap: new Map(
      Array.from(draft.nodeMap.entries()).map(([k, v]) => [k, { ...v }])
    ),
    head: draft.head,
    tail: draft.tail,
    size: draft.size,
  }
}

export class DoublyLinkedList {
  private nodeMap: Map<string, DoublyListNode> = new Map()
  private head: string | null = null
  private tail: string | null = null
  private size: number = 0

  get length(): number { return this.size }
  get isEmpty(): boolean { return this.head === null }
  getSnapshot(): DoublyListSnapshot {
    return freezeSnapshot({ nodeMap: this.nodeMap, head: this.head, tail: this.tail, size: this.size })
  }

  // ── INSERT HEAD ──────────────────────────────────────────────────────────────

  insertHead(value: number): OperationResult<DoublyListSnapshot> {
    _stepCounter = 0
    const steps: AnimationStep[] = []
    const newId = uuidv4()
    const oldHead = this.head

    steps.push(
      nextStep(`Allocating new node [${value}] with id …${newId.slice(-4)}`, [highlight(newId, 'mutating')], { nodeSpawnId: newId })
    )

    if (oldHead !== null) {
      steps.push(
        nextStep(`Setting newNode.next → current head [${this.nodeMap.get(oldHead)?.value}]`, [
          highlight(newId, 'mutating'), highlight(oldHead, 'active')
        ], { pointerMutation: { sourceId: newId, oldTargetId: null, newTargetId: oldHead, pointerType: 'next' } })
      )
      steps.push(
        nextStep(`Setting head.prev → new node [${value}]`, [
          highlight(oldHead, 'mutating'), highlight(newId, 'active')
        ], { pointerMutation: { sourceId: oldHead, oldTargetId: null, newTargetId: newId, pointerType: 'prev' } })
      )
    }

    steps.push(
      nextStep(`head pointer now points to new node [${value}]`, [highlight(newId, 'found'), ...(oldHead ? [highlight(oldHead, 'idle')] : [])])
    )

    const newNode: DoublyListNode = { id: newId, value, next: oldHead, prev: null }
    this.nodeMap.set(newId, newNode)
    if (oldHead !== null) {
      this.nodeMap.get(oldHead)!.prev = newId
    }
    this.head = newId
    if (this.tail === null) this.tail = newId
    this.size += 1

    return {
      kind: 'DLL_INSERT_HEAD',
      success: true,
      message: `Inserted ${value} at head.`,
      snapshot: this.getSnapshot(),
      steps,
      complexity: { time: 'O(1)', space: 'O(1)' }
    }
  }

  // ── INSERT TAIL ──────────────────────────────────────────────────────────────

  insertTail(value: number): OperationResult<DoublyListSnapshot> {
    _stepCounter = 0
    const steps: AnimationStep[] = []
    const newId = uuidv4()

    if (this.head === null || this.tail === null) {
      return this.insertHead(value)
    }

    steps.push(
      nextStep(`Allocating new node [${value}]`, [highlight(newId, 'mutating')], { nodeSpawnId: newId })
    )

    const oldTail = this.tail
    steps.push(
      nextStep(`Found tail node [${this.nodeMap.get(oldTail)?.value}] in O(1)`, [highlight(oldTail, 'active')])
    )

    steps.push(
      nextStep(`Setting tail.next → new node`, [highlight(oldTail, 'mutating'), highlight(newId, 'active')],
      { pointerMutation: { sourceId: oldTail, oldTargetId: null, newTargetId: newId, pointerType: 'next' } })
    )
    
    steps.push(
      nextStep(`Setting newNode.prev → tail`, [highlight(newId, 'mutating'), highlight(oldTail, 'active')],
      { pointerMutation: { sourceId: newId, oldTargetId: null, newTargetId: oldTail, pointerType: 'prev' } })
    )

    steps.push(
      nextStep(`tail pointer now points to new node`, [highlight(newId, 'found'), highlight(oldTail, 'idle')])
    )

    const newNode: DoublyListNode = { id: newId, value, next: null, prev: oldTail }
    this.nodeMap.set(newId, newNode)
    this.nodeMap.get(oldTail)!.next = newId
    this.tail = newId
    this.size += 1

    return {
      kind: 'DLL_INSERT_TAIL',
      success: true,
      message: `Inserted ${value} at tail.`,
      snapshot: this.getSnapshot(),
      steps,
      complexity: { time: 'O(1)', space: 'O(1)' }
    }
  }

  // ── DELETE HEAD ──────────────────────────────────────────────────────────────

  deleteHead(): OperationResult<DoublyListSnapshot> {
    _stepCounter = 0
    const steps: AnimationStep[] = []

    if (!this.head) {
      return { kind: 'DLL_DELETE_HEAD', success: false, message: 'List is empty.', snapshot: this.getSnapshot(), steps, complexity: { time: 'O(1)', space: 'O(1)' } }
    }

    const oldHeadId = this.head
    const oldHeadNode = this.nodeMap.get(oldHeadId)!
    const newHeadId = oldHeadNode.next

    steps.push(
      nextStep(`Targeting head node [${oldHeadNode.value}] for deletion`, [highlight(oldHeadId, 'deleted')])
    )

    if (newHeadId) {
      steps.push(
        nextStep(`Moving head pointer to next node [${this.nodeMap.get(newHeadId)?.value}]`, [highlight(oldHeadId, 'deleted'), highlight(newHeadId, 'active')])
      )
      steps.push(
        nextStep(`Setting new head's prev → null`, [highlight(newHeadId, 'mutating')], { pointerMutation: { sourceId: newHeadId, oldTargetId: oldHeadId, newTargetId: null, pointerType: 'prev' } })
      )
    } else {
      steps.push(
        nextStep(`List will be empty`, [highlight(oldHeadId, 'deleted')])
      )
    }

    steps.push(
      nextStep(`Destroying node [${oldHeadNode.value}]`, [], { nodeDespawnId: oldHeadId })
    )

    this.nodeMap.delete(oldHeadId)
    this.head = newHeadId
    if (newHeadId) {
      this.nodeMap.get(newHeadId)!.prev = null
    } else {
      this.tail = null
    }
    this.size -= 1

    return {
      kind: 'DLL_DELETE_HEAD',
      success: true,
      message: `Deleted head node.`,
      snapshot: this.getSnapshot(),
      steps,
      complexity: { time: 'O(1)', space: 'O(1)' }
    }
  }

  // ── DELETE TAIL ──────────────────────────────────────────────────────────────

  deleteTail(): OperationResult<DoublyListSnapshot> {
    _stepCounter = 0
    const steps: AnimationStep[] = []

    if (!this.head || !this.tail) {
      return { kind: 'DLL_DELETE_TAIL', success: false, message: 'List is empty.', snapshot: this.getSnapshot(), steps, complexity: { time: 'O(1)', space: 'O(1)' } }
    }

    if (this.head === this.tail) {
      return this.deleteHead()
    }

    const oldTailId = this.tail
    const oldTailNode = this.nodeMap.get(oldTailId)!
    const newTailId = oldTailNode.prev!
    const newTailNode = this.nodeMap.get(newTailId)!

    steps.push(
      nextStep(`Targeting tail node [${oldTailNode.value}] in O(1)`, [highlight(oldTailId, 'deleted')])
    )

    steps.push(
      nextStep(`Moving tail pointer to prev node [${newTailNode.value}]`, [highlight(oldTailId, 'deleted'), highlight(newTailId, 'active')])
    )

    steps.push(
      nextStep(`Setting new tail's next → null`, [highlight(newTailId, 'mutating')], { pointerMutation: { sourceId: newTailId, oldTargetId: oldTailId, newTargetId: null, pointerType: 'next' } })
    )

    steps.push(
      nextStep(`Destroying node [${oldTailNode.value}]`, [highlight(newTailId, 'idle')], { nodeDespawnId: oldTailId })
    )

    this.nodeMap.delete(oldTailId)
    this.tail = newTailId
    this.nodeMap.get(newTailId)!.next = null
    this.size -= 1

    return {
      kind: 'DLL_DELETE_TAIL',
      success: true,
      message: `Deleted tail node.`,
      snapshot: this.getSnapshot(),
      steps,
      complexity: { time: 'O(1)', space: 'O(1)' }
    }
  }

  reset(): DoublyListSnapshot {
    this.nodeMap.clear()
    this.head = null
    this.tail = null
    this.size = 0
    return this.getSnapshot()
  }
}
