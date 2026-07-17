// ─────────────────────────────────────────────────────────────────────────────
// src/core/trees/heap/Heap.ts
//
// Array-backed Min-Heap / Max-Heap implementation.
// insert → sift-up, extractRoot → sift-down.
// Emits animation steps at each comparison / swap.
// ─────────────────────────────────────────────────────────────────────────────

import type { OperationResult } from '../../shared/OperationResult'
import type { AnimationStep } from '@/types/animation'
import type { HeapSnapshot, HeapType } from './types'

export class Heap {
  private data: number[] = []
  private heapType: HeapType = 'min'

  constructor(heapType: HeapType = 'min') {
    this.heapType = heapType
  }

  private getSnapshot(): HeapSnapshot {
    return {
      data: [...this.data],
      size: this.data.length,
      heapType: this.heapType,
    }
  }

  // Build node IDs from array indices for React Flow
  private nodeId(index: number): string {
    return `heap-${index}`
  }

  private compare(a: number, b: number): boolean {
    return this.heapType === 'min' ? a < b : a > b
  }

  public reset(): HeapSnapshot {
    this.data = []
    return this.getSnapshot()
  }

  public setType(type: HeapType): void {
    this.heapType = type
  }

  public insert(value: number): OperationResult<HeapSnapshot> {
    const steps: AnimationStep[] = []
    let stepIndex = 0

    // Insert at end
    this.data.push(value)
    let i = this.data.length - 1

    steps.push({
      stepIndex: stepIndex++,
      description: `Inserting ${value} at position ${i} (end of array)`,
      highlights: [{ nodeId: this.nodeId(i), state: 'mutating' }],
      nodeSpawnId: this.nodeId(i),
    })

    // Sift up
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      steps.push({
        stepIndex: stepIndex++,
        description: `Comparing ${this.data[i]} with parent ${this.data[parent]}`,
        highlights: [
          { nodeId: this.nodeId(i), state: 'comparing' },
          { nodeId: this.nodeId(parent), state: 'active' },
        ],
      })

      if (this.compare(this.data[i], this.data[parent])) {
        steps.push({
          stepIndex: stepIndex++,
          description: `${this.data[i]} ${this.heapType === 'min' ? '<' : '>'} parent ${this.data[parent]} → Swapping!`,
          highlights: [
            { nodeId: this.nodeId(i), state: 'mutating' },
            { nodeId: this.nodeId(parent), state: 'mutating' },
          ],
        });
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]]
        i = parent
      } else {
        steps.push({
          stepIndex: stepIndex++,
          description: `${this.data[i]} satisfies heap property. Heap order restored.`,
          highlights: [{ nodeId: this.nodeId(i), state: 'found' }],
        })
        break
      }
    }

    if (i === 0) {
      steps.push({
        stepIndex: stepIndex++,
        description: `${value} reached the root. Insertion complete!`,
        highlights: [{ nodeId: this.nodeId(0), state: 'found' }],
      })
    }

    return {
      kind: 'BST_INSERT', // reuse for now - tree operation
      success: true,
      message: `Inserted ${value}`,
      complexity: { time: 'O(log n)', space: 'O(1)' },
      snapshot: this.getSnapshot(),
      steps,
    }
  }

  public extractRoot(): OperationResult<HeapSnapshot> {
    const steps: AnimationStep[] = []
    let stepIndex = 0

    if (this.data.length === 0) {
      steps.push({ stepIndex: stepIndex++, description: 'Heap is empty.', highlights: [] })
      return {
        kind: 'BST_DELETE',
        success: false,
        message: 'Heap is empty',
        complexity: { time: 'O(1)', space: 'O(1)' },
        snapshot: this.getSnapshot(),
        steps,
      }
    }

    const rootVal = this.data[0]
    const lastIdx = this.data.length - 1

    steps.push({
      stepIndex: stepIndex++,
      description: `Extracting ${this.heapType === 'min' ? 'minimum' : 'maximum'} = ${rootVal} from root`,
      highlights: [{ nodeId: this.nodeId(0), state: 'deleted' }],
      nodeDespawnId: this.nodeId(0),
    })

    // Move last element to root
    if (lastIdx > 0) {
      this.data[0] = this.data[lastIdx]
      steps.push({
        stepIndex: stepIndex++,
        description: `Moving last element ${this.data[0]} to root position`,
        highlights: [{ nodeId: this.nodeId(0), state: 'mutating' }],
      })
    }
    this.data.pop()

    // Sift down
    let i = 0
    while (true) {
      const left = 2 * i + 1
      const right = 2 * i + 2
      let best = i

      if (left < this.data.length && this.compare(this.data[left], this.data[best])) {
        best = left
      }
      if (right < this.data.length && this.compare(this.data[right], this.data[best])) {
        best = right
      }

      if (best === i) {
        steps.push({
          stepIndex: stepIndex++,
          description: `Node ${this.data[i]} satisfies heap property. Done!`,
          highlights: [{ nodeId: this.nodeId(i), state: 'found' }],
        })
        break
      }

      steps.push({
        stepIndex: stepIndex++,
        description: `Comparing ${this.data[i]} with children. ${this.data[best]} is the ${this.heapType === 'min' ? 'smaller' : 'larger'} child → Swapping`,
        highlights: [
          { nodeId: this.nodeId(i), state: 'comparing' },
          { nodeId: this.nodeId(best), state: 'active' },
        ],
      });

      [this.data[i], this.data[best]] = [this.data[best], this.data[i]]
      steps.push({
        stepIndex: stepIndex++,
        description: `Swapped ${this.data[best]} ↔ ${this.data[i]}. Continuing sift-down...`,
        highlights: [
          { nodeId: this.nodeId(i), state: 'mutating' },
          { nodeId: this.nodeId(best), state: 'mutating' },
        ],
      })
      i = best
    }

    return {
      kind: 'BST_DELETE',
      success: true,
      message: `Extracted ${rootVal}`,
      complexity: { time: 'O(log n)', space: 'O(1)' },
      snapshot: this.getSnapshot(),
      steps,
    }
  }
}
