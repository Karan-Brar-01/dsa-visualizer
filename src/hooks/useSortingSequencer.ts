'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useSortingSequencer.ts
//
// Drives step-by-step sorting playback, consuming SortingStep[] from sortingStore.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { useSortingStore, selectors } from '@/stores/sortingStore'
import { PLAYBACK_SPEED_MS } from '@/types/animation'
import type { SortingStep } from '@/core/sorting/SortingEngine'

export function useSortingSequencer(): void {
  const isPlaying   = useSortingStore(selectors.isPlaying)
  const playbackSpeed = useSortingStore(selectors.playbackSpeed)
  const steps       = useSortingStore((s) => s.steps)
  const currentStepIndex = useSortingStore(selectors.currentStepIndex)
  const { applyStep, commitOperation, pause } = useSortingStore(selectors.actions)

  const stateRef = useRef({ isPlaying, steps, currentStepIndex, applyStep, commitOperation, pause })
  useEffect(() => {
    stateRef.current = { isPlaying, steps, currentStepIndex, applyStep, commitOperation, pause }
  })

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return

    const intervalMs = PLAYBACK_SPEED_MS[playbackSpeed]
    const interval = setInterval(() => {
      const { steps: s, currentStepIndex: idx, applyStep: apply, commitOperation: commit, pause: stop } =
        stateRef.current

      if (idx < s.length) {
        apply(s[idx] as SortingStep)
      } else {
        commit()
        stop()
        clearInterval(interval)
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [isPlaying, steps, playbackSpeed])
}
