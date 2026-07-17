// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useAnimationSequencer.ts
//
// Drives step-by-step playback of an operation's AnimationStep[].
//
// Design:
//   - Uses setInterval (via useEffect) ticking at `playbackSpeed` ms.
//   - On each tick: calls store.applyStep(steps[currentStepIndex]).
//   - When all steps are exhausted: calls store.commitOperation().
//   - Paused when isPlaying = false or steps = [].
//
// This hook is the ONLY consumer that calls applyStep and commitOperation.
// Components call play/pause/stepForward/stepBack instead.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { PlaybackSpeed, PLAYBACK_SPEED_MS, AnimationStep } from '@/types/animation'

interface SequencerProps {
  isPlaying: boolean
  steps: AnimationStep[]
  currentStepIndex: number
  playbackSpeed: PlaybackSpeed
  applyStep: (step: AnimationStep) => void
  commitOperation: () => void
  pause: () => void
}

/**
 * Must be mounted once at the visualizer page level.
 * Has no return value — it acts as a side-effect driver.
 */
export function useAnimationSequencer({
  isPlaying,
  steps,
  currentStepIndex,
  playbackSpeed,
  applyStep,
  commitOperation,
  pause
}: SequencerProps): void {

  // Use a ref to always have the latest values inside the interval closure
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
        apply(s[idx])
      } else {
        // All steps consumed — commit the structural mutation
        commit()
        stop() // Pause the sequencer
        clearInterval(interval)
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [isPlaying, steps, playbackSpeed])
  // currentStepIndex is intentionally NOT in the deps array —
  // we read it from stateRef to avoid restarting the interval on every tick.
}
