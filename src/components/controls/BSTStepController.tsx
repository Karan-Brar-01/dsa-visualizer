'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useBSTStore, selectors } from '@/stores/bstStore'
import type { PlaybackSpeed } from '@/types/animation'

const SPEED_OPTIONS: { value: PlaybackSpeed; label: string }[] = [
  { value: 'slow', label: '0.5×' },
  { value: 'normal', label: '1×' },
  { value: 'fast', label: '2×' },
]

export function BSTStepController() {
  const isPlaying        = useBSTStore(selectors.isPlaying)
  const currentStepIndex = useBSTStore(selectors.currentStepIndex)
  const totalSteps       = useBSTStore((s) => s.steps.length)
  const playbackSpeed    = useBSTStore(selectors.playbackSpeed)
  const currentStep      = useBSTStore(selectors.currentStep)

  const { play, pause, stepForward, stepBack, setPlaybackSpeed } =
    useBSTStore(selectors.actions)

  const hasSteps    = totalSteps > 0
  const progress    = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0

  return (
    <div
      className="flex items-center gap-3 ml-auto"
      role="group"
      aria-label="Animation playback controls"
    >
      <AnimatePresence mode="wait">
        {hasSteps && currentStep && (
          <motion.p
            key={currentStep.stepIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="hidden xl:block max-w-xs text-xs font-mono text-violet-300 truncate"
          >
            {currentStep.description}
          </motion.p>
        )}
      </AnimatePresence>

      {hasSteps && (
        <div className="flex items-center gap-2">
          <div className="relative w-20 h-1.5 rounded-full bg-[hsl(225,14%,20%)] overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-violet-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className="text-xs font-mono tabular-nums text-[hsl(210,8%,45%)] w-12 text-right">
            {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>
      )}

      <button
        onClick={stepBack}
        disabled={!hasSteps || currentStepIndex === 0}
        aria-label="Step backward"
        className="
          min-h-[44px] w-12 md:min-h-0 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-sm
          border border-[hsl(225,12%,22%)] bg-[hsl(225,16%,11%)]
          text-[hsl(210,12%,60%)] hover:text-white hover:border-[hsl(225,10%,32%)]
          disabled:opacity-30 disabled:cursor-not-allowed transition-all
        "
      >
        ←
      </button>

      <motion.button
        onClick={isPlaying ? pause : play}
        disabled={!hasSteps && !isPlaying}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        whileTap={{ scale: 0.92 }}
        className={`
          min-h-[44px] md:min-h-0 md:h-8 px-5 md:px-4 text-sm md:text-xs rounded-lg text-sm font-semibold flex items-center gap-2
          border transition-all
          disabled:opacity-30 disabled:cursor-not-allowed
          ${isPlaying
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
            : 'bg-violet-500/15 border-violet-500/40 text-violet-300 hover:bg-violet-500/25'}
        `}
      >
        <motion.span
          key={isPlaying ? 'pause' : 'play'}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.1 }}
        >
          {isPlaying ? '⏸' : '▶'}
        </motion.span>
        {isPlaying ? 'Pause' : 'Play'}
      </motion.button>

      <button
        onClick={stepForward}
        disabled={!hasSteps}
        aria-label="Step forward"
        className="
          min-h-[44px] w-12 md:min-h-0 md:h-8 md:w-8 rounded-lg flex items-center justify-center text-sm
          border border-[hsl(225,12%,22%)] bg-[hsl(225,16%,11%)]
          text-[hsl(210,12%,60%)] hover:text-white hover:border-[hsl(225,10%,32%)]
          disabled:opacity-30 disabled:cursor-not-allowed transition-all
        "
      >
        →
      </button>

      <div className="h-4 w-px bg-[hsl(225,12%,22%)]" />

      <div className="flex items-center gap-0.5 rounded-lg border border-[hsl(225,12%,20%)] bg-[hsl(225,18%,10%)] p-0.5">
        {SPEED_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPlaybackSpeed(opt.value)}
            aria-pressed={playbackSpeed === opt.value}
            className={`
              h-6 px-2 rounded-md text-[10px] font-mono transition-all
              ${playbackSpeed === opt.value
                ? 'bg-violet-500/25 text-violet-300'
                : 'text-[hsl(210,8%,45%)] hover:text-[hsl(210,12%,65%)]'}
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
