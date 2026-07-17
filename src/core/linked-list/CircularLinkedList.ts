// ─────────────────────────────────────────────────────────────────────────────
// src/core/linked-list/CircularLinkedList.ts
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid'
import type { AnimationStep, StepHighlight } from '@/types/animation'
import type { OperationResult } from '@/core/shared/OperationResult'
import type { ListNode, SinglyListSnapshot } from './types'

interface Draft {
  nodeMap: Map<string, ListNode>
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

function freezeSnapshot(draft: Draft): SinglyListSnapshot {
  return {
    nodeMap: new Map(
      Array.from(draft.nodeMap.entries()).map(([k, v]) => [k, { ...v }])
    ),
    head: draft.head,
    size: draft.size,
  }
}

export class CircularLinkedList {
  private nodeMap: Map<string, ListNode> = new Map()
  private head: string | null = null
  private tail: string | null = null
  private size: number = 0

  get length(): number { return this.size }
  get isEmpty(): boolean { return this.head === null }
  getSnapshot(): SinglyListSnapshot {
    return freezeSnapshot({ nodeMap: this.nodeMap, head: this.head, tail: this.tail, size: this.size })
  }

  // ── INSERT HEAD ──────────────────────────────────────────────────────────────

  insertHead(value: number): OperationResult<SinglyListSnapshot> {
    _stepCounter = 0
    const steps: AnimationStep[] = []
    const newId = uuidv4()
    const oldHead = this.head

    steps.push(
      nextStep(`Allocating new node [${value}]`, [highlight(newId, 'mutating')], { nodeSpawnId: newId })
    )

    if (oldHead !== null) {
      steps.push(
        nextStep(`Setting newNode.next → current head`, [
          highlight(newId, 'mutating'), highlight(oldHead, 'active')
        ], { pointerMutation: { sourceId: newId, oldTargetId: null, newTargetId: oldHead, pointerType: 'next' } })
      )
      steps.push(
        nextStep(`Setting tail.next → new node`, [
          highlight(this.tail!, 'mutating'), highlight(newId, 'active')
        ], { pointerMutation: { sourceId: this.tail!, oldTargetId: oldHead, newTargetId: newId, pointerType: 'next' } })
      )
    } else {
      steps.push(
        nextStep(`List is empty. newNode.next → itself`, [
          highlight(newId, 'mutating')
        ], { pointerMutation: { sourceId: newId, oldTargetId: null, newTargetId: newId, pointerType: 'next' } })
      )
    }

    steps.push(
      nextStep(`head pointer now points to new node`, [highlight(newId, 'found')])
    )

    const newNode: ListNode = { id: newId, value, next: oldHead ?? newId }
    this.nodeMap.set(newId, newNode)
    if (oldHead !== null) {
      this.nodeMap.get(this.tail!)!.next = newId
    } else {
      this.tail = newId
    }
    this.head = newId
    this.size += 1

    return {
      kind: 'CLL_INSERT_HEAD',
      success: true,
      message: `Inserted ${value} at head.`,
      snapshot: this.getSnapshot(),
      steps,
      complexity: { time: 'O(1)', space: 'O(1)' }
    }
  }

  // ── INSERT TAIL ──────────────────────────────────────────────────────────────

  insertTail(value: number): OperationResult<SinglyListSnapshot> {
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
    const headId = this.head
    steps.push(
      nextStep(`Found tail node [${this.nodeMap.get(oldTail)?.value}]`, [highlight(oldTail, 'active')])
    )

    steps.push(
      nextStep(`Setting newNode.next → head`, [highlight(newId, 'mutating'), highlight(headId, 'active')],
      { pointerMutation: { sourceId: newId, oldTargetId: null, newTargetId: headId, pointerType: 'next' } })
    )

    steps.push(
      nextStep(`Setting tail.next → new node`, [highlight(oldTail, 'mutating'), highlight(newId, 'active')],
      { pointerMutation: { sourceId: oldTail, oldTargetId: headId, newTargetId: newId, pointerType: 'next' } })
    )

    steps.push(
      nextStep(`tail pointer now points to new node`, [highlight(newId, 'found')])
    )

    const newNode: ListNode = { id: newId, value, next: headId }
    this.nodeMap.set(newId, newNode)
    this.nodeMap.get(oldTail)!.next = newId
    this.tail = newId
    this.size += 1

    return {
      kind: 'CLL_INSERT_TAIL',
      success: true,
      message: `Inserted ${value} at tail.`,
      snapshot: this.getSnapshot(),
      steps,
      complexity: { time: 'O(1)', space: 'O(1)' }
    }
  }

  // ── DELETE HEAD ──────────────────────────────────────────────────────────────

  deleteHead(): OperationResult<SinglyListSnapshot> {
    _stepCounter = 0
    const steps: AnimationStep[] = []

    if (!this.head) {
      return { kind: 'CLL_DELETE_HEAD', success: false, message: 'List is empty.', snapshot: this.getSnapshot(), steps, complexity: { time: 'O(1)', space: 'O(1)' } }
    }

    const oldHeadId = this.head
    const oldHeadNode = this.nodeMap.get(oldHeadId)!
    const newHeadId = oldHeadNode.next === oldHeadId ? null : oldHeadNode.next
    const tailId = this.tail!

    steps.push(
      nextStep(`Targeting head node [${oldHeadNode.value}] for deletion`, [highlight(oldHeadId, 'deleted')])
    )

    if (newHeadId) {
      steps.push(
        nextStep(`Moving head pointer to next node`, [highlight(oldHeadId, 'deleted'), highlight(newHeadId, 'active')])
      )
      steps.push(
        nextStep(`Setting tail.next → new head`, [highlight(tailId, 'mutating'), highlight(newHeadId, 'active')], { pointerMutation: { sourceId: tailId, oldTargetId: oldHeadId, newTargetId: newHeadId, pointerType: 'next' } })
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
      this.nodeMap.get(tailId)!.next = newHeadId
    } else {
      this.tail = null
    }
    this.size -= 1

    return {
      kind: 'CLL_DELETE_HEAD',
      success: true,
      message: `Deleted head node.`,
      snapshot: this.getSnapshot(),
      steps,
      complexity: { time: 'O(1)', space: 'O(1)' }
    }
  }

  // ── DELETE TAIL ──────────────────────────────────────────────────────────────

  deleteTail(): OperationResult<SinglyListSnapshot> {
    _stepCounter = 0
    const steps: AnimationStep[] = []

    if (!this.head || !this.tail) {
      return { kind: 'CLL_DELETE_TAIL', success: false, message: 'List is empty.', snapshot: this.getSnapshot(), steps, complexity: { time: 'O(1)', space: 'O(n)' } }
    }

    if (this.head === this.tail) {
      return this.deleteHead()
    }

    const oldTailId = this.tail
    const oldTailNode = this.nodeMap.get(oldTailId)!

    steps.push(
      nextStep(`Targeting tail node [${oldTailNode.value}] in O(n)`, [highlight(oldTailId, 'deleted')])
    )

    let curr: string = this.head
    let prev: string | null = null
    while (curr !== this.tail) {
      prev = curr
      curr = this.nodeMap.get(curr)!.next as string
    }
    const newTailId = prev!

    steps.push(
      nextStep(`Found new tail [${this.nodeMap.get(newTailId)?.value}]`, [highlight(newTailId, 'active')])
    )

    steps.push(
      nextStep(`Setting newTail.next → head`, [highlight(newTailId, 'mutating')], { pointerMutation: { sourceId: newTailId, oldTargetId: oldTailId, newTargetId: this.head, pointerType: 'next' } })
    )

    steps.push(
      nextStep(`Destroying node [${oldTailNode.value}]`, [highlight(newTailId, 'idle')], { nodeDespawnId: oldTailId })
    )

    this.nodeMap.delete(oldTailId)
    this.tail = newTailId
    this.nodeMap.get(newTailId)!.next = this.head
    this.size -= 1

    return {
      kind: 'CLL_DELETE_TAIL',
      success: true,
      message: `Deleted tail node.`,
      snapshot: this.getSnapshot(),
      steps,
      complexity: { time: 'O(n)', space: 'O(1)' }
    }
  }

  reset(): SinglyListSnapshot {
    this.nodeMap.clear()
    this.head = null
    this.tail = null
    this.size = 0
    return this.getSnapshot()
  }
}
