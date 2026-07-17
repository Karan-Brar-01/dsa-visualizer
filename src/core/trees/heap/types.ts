// ─────────────────────────────────────────────────────────────────────────────
// src/core/trees/heap/types.ts
// ─────────────────────────────────────────────────────────────────────────────

export type HeapType = 'min' | 'max'

export interface HeapSnapshot {
  data: number[]          // flat array representation
  size: number
  heapType: HeapType
}
