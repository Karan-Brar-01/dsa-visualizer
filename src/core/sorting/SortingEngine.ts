// ─────────────────────────────────────────────────────────────────────────────
// src/core/sorting/SortingEngine.ts
//
// Merge Sort + Quick Sort with step-by-step animation output.
// Each step carries the full array state + highlighted indices.
// ─────────────────────────────────────────────────────────────────────────────

import type { AnimationStep } from '@/types/animation'

export interface SortingStep extends AnimationStep {
  array: number[]          // Full array snapshot at this step
  comparingIndices: number[]
  swappingIndices: number[]
  sortedIndices: number[]
  pivotIndex?: number
}

export interface SortingResult {
  steps: SortingStep[]
  sorted: number[]
}

// ─── Merge Sort ───────────────────────────────────────────────────────────────

export function mergeSort(input: number[]): SortingResult {
  const arr = [...input]
  const steps: SortingStep[] = []
  let stepIndex = 0
  const sortedSet = new Set<number>()

  function merge(arr: number[], left: number, mid: number, right: number) {
    const L = arr.slice(left, mid + 1)
    const R = arr.slice(mid + 1, right + 1)
    let i = 0, j = 0, k = left

    steps.push({
      stepIndex: stepIndex++,
      description: `Merging subarrays [${left}..${mid}] and [${mid + 1}..${right}]`,
      highlights: Array.from({ length: right - left + 1 }, (_, idx) => ({
        nodeId: String(left + idx),
        state: 'active' as const,
      })),
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: Array.from(sortedSet),
    })

    while (i < L.length && j < R.length) {
      steps.push({
        stepIndex: stepIndex++,
        description: `Comparing L[${i}]=${L[i]} and R[${j}]=${R[j]}`,
        highlights: [
          { nodeId: String(left + i), state: 'comparing' },
          { nodeId: String(mid + 1 + j), state: 'comparing' },
        ],
        array: [...arr],
        comparingIndices: [left + i, mid + 1 + j],
        swappingIndices: [],
        sortedIndices: Array.from(sortedSet),
      })

      if (L[i] <= R[j]) {
        arr[k++] = L[i++]
      } else {
        arr[k++] = R[j++]
      }
    }

    while (i < L.length) arr[k++] = L[i++]
    while (j < R.length) arr[k++] = R[j++]

    // Mark merged range as placed
    for (let x = left; x <= right; x++) sortedSet.add(x)

    steps.push({
      stepIndex: stepIndex++,
      description: `Merged [${left}..${right}]: [${arr.slice(left, right + 1).join(', ')}]`,
      highlights: Array.from({ length: right - left + 1 }, (_, idx) => ({
        nodeId: String(left + idx),
        state: 'mutating' as const,
      })),
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: Array.from(sortedSet),
    })
  }

  function sortRecursive(arr: number[], left: number, right: number) {
    if (left >= right) return
    const mid = Math.floor((left + right) / 2)

    steps.push({
      stepIndex: stepIndex++,
      description: `Dividing [${left}..${right}] at mid=${mid}`,
      highlights: [{ nodeId: String(mid), state: 'active' }],
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: Array.from(sortedSet),
    })

    sortRecursive(arr, left, mid)
    sortRecursive(arr, mid + 1, right)
    merge(arr, left, mid, right)
  }

  steps.push({
    stepIndex: stepIndex++,
    description: `Starting Merge Sort on [${arr.join(', ')}]`,
    highlights: [],
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: [],
  })

  sortRecursive(arr, 0, arr.length - 1)

  // All sorted
  steps.push({
    stepIndex: stepIndex++,
    description: `Array fully sorted: [${arr.join(', ')}]`,
    highlights: arr.map((_, i) => ({ nodeId: String(i), state: 'found' as const })),
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: arr.map((_, i) => i),
  })

  return { steps, sorted: arr }
}

// ─── Quick Sort ───────────────────────────────────────────────────────────────

export function quickSort(input: number[]): SortingResult {
  const arr = [...input]
  const steps: SortingStep[] = []
  let stepIndex = 0
  const sortedSet = new Set<number>()

  function partition(arr: number[], low: number, high: number): number {
    const pivotVal = arr[high]
    let i = low - 1

    steps.push({
      stepIndex: stepIndex++,
      description: `Pivot = ${pivotVal} (index ${high}). Partitioning [${low}..${high}]`,
      highlights: [{ nodeId: String(high), state: 'active' }],
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: Array.from(sortedSet),
      pivotIndex: high,
    })

    for (let j = low; j < high; j++) {
      steps.push({
        stepIndex: stepIndex++,
        description: `Comparing arr[${j}]=${arr[j]} with pivot ${pivotVal}`,
        highlights: [
          { nodeId: String(j), state: 'comparing' },
          { nodeId: String(high), state: 'active' },
        ],
        array: [...arr],
        comparingIndices: [j, high],
        swappingIndices: [],
        sortedIndices: Array.from(sortedSet),
        pivotIndex: high,
      })

      if (arr[j] <= pivotVal) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]]
        if (i !== j) {
          steps.push({
            stepIndex: stepIndex++,
            description: `${arr[j]} ≤ pivot → Swapping arr[${i}]=${arr[i]} ↔ arr[${j}]=${arr[j]}`,
            highlights: [
              { nodeId: String(i), state: 'mutating' },
              { nodeId: String(j), state: 'mutating' },
            ],
            array: [...arr],
            comparingIndices: [],
            swappingIndices: [i, j],
            sortedIndices: Array.from(sortedSet),
            pivotIndex: high,
          })
        }
      }
    }

    // Place pivot in correct position
    ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
    const pivotPos = i + 1
    sortedSet.add(pivotPos)

    steps.push({
      stepIndex: stepIndex++,
      description: `Pivot ${pivotVal} placed at index ${pivotPos} (its final position)`,
      highlights: [{ nodeId: String(pivotPos), state: 'found' }],
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: Array.from(sortedSet),
      pivotIndex: pivotPos,
    })

    return pivotPos
  }

  function sortRecursive(arr: number[], low: number, high: number) {
    if (low >= high) {
      if (low === high) sortedSet.add(low)
      return
    }
    const pi = partition(arr, low, high)
    sortRecursive(arr, low, pi - 1)
    sortRecursive(arr, pi + 1, high)
  }

  steps.push({
    stepIndex: stepIndex++,
    description: `Starting Quick Sort on [${arr.join(', ')}]`,
    highlights: [],
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: [],
  })

  sortRecursive(arr, 0, arr.length - 1)

  steps.push({
    stepIndex: stepIndex++,
    description: `Array fully sorted: [${arr.join(', ')}]`,
    highlights: arr.map((_, i) => ({ nodeId: String(i), state: 'found' as const })),
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: arr.map((_, i) => i),
  })

  return { steps, sorted: arr }
}
