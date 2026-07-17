// ─────────────────────────────────────────────────────────────────────────────
// src/stores/sortingStore.ts
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { mergeSort, quickSort, type SortingStep } from '@/core/sorting/SortingEngine'
import type { PlaybackSpeed } from '@/types/animation'

export type SortAlgorithm = 'merge' | 'quick'

type SortingStore = {
  algorithm: SortAlgorithm
  originalArray: number[]
  currentArray: number[]
  steps: SortingStep[]
  currentStepIndex: number
  currentStep: SortingStep | null
  isPlaying: boolean
  playbackSpeed: PlaybackSpeed
  operationLog: string[]
  arraySize: number

  setAlgorithm: (alg: SortAlgorithm) => void
  setArraySize: (size: number) => void
  generateArray: () => void
  runSort: () => void
  applyStep: (step: SortingStep) => void
  commitOperation: () => void
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBack: () => void
  setPlaybackSpeed: (speed: PlaybackSpeed) => void
  reset: () => void
}

function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5)
}

const DEFAULT_SIZE = 20
// Use a fixed initial array to prevent Next.js hydration mismatch (server/client mismatch from Math.random)
const defaultArr = [
  64, 34, 25, 12, 22, 11, 90, 45, 78, 56,
  89, 43, 67, 23, 91, 54, 76, 88, 32, 99
]

export const useSortingStore = create<SortingStore>()(
  immer((set, get) => ({
    algorithm: 'merge',
    originalArray: defaultArr,
    currentArray: [...defaultArr],
    steps: [],
    currentStepIndex: -1,
    currentStep: null,
    isPlaying: false,
    playbackSpeed: 'normal',
    operationLog: [],
    arraySize: DEFAULT_SIZE,

    setAlgorithm: (alg) => {
      set({ algorithm: alg })
      get().reset()
    },

    setArraySize: (size) => {
      set({ arraySize: size })
      const arr = generateRandomArray(size)
      set((state) => {
        state.originalArray = arr
        state.currentArray = [...arr]
        state.steps = []
        state.currentStepIndex = -1
        state.currentStep = null
        state.isPlaying = false
      })
    },

    generateArray: () => {
      const { arraySize } = get()
      const arr = generateRandomArray(arraySize)
      set((state) => {
        state.originalArray = arr
        state.currentArray = [...arr]
        state.steps = []
        state.currentStepIndex = -1
        state.currentStep = null
        state.isPlaying = false
      })
    },

    runSort: () => {
      const { algorithm, originalArray, steps: existingSteps } = get()
      // If already ran, commit and restart
      if (existingSteps.length > 0) {
        get().commitOperation()
      }
      const { steps, sorted } = algorithm === 'merge'
        ? mergeSort([...originalArray])
        : quickSort([...originalArray])
      set((state) => {
        state.steps = steps as any
        state.currentStepIndex = 0
        state.currentStep = steps[0] as any
        state.currentArray = [...originalArray]
        state.isPlaying = true
        state.operationLog.unshift(`${algorithm === 'merge' ? 'Merge' : 'Quick'} Sort started`)
      })
    },

    applyStep: (step) => {
      set((state) => {
        state.currentStepIndex = step.stepIndex
        state.currentStep = step as any
        state.currentArray = [...step.array]
      })
    },

    commitOperation: () => {
      const { steps } = get()
      if (steps.length === 0) return
      const lastStep = steps[steps.length - 1]
      set((state) => {
        state.currentArray = [...lastStep.array]
        state.currentStep = null
        state.steps = []
        state.currentStepIndex = -1
        state.isPlaying = false
      })
    },

    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    stepForward: () => {
      const { currentStepIndex, steps, applyStep, commitOperation } = get()
      if (currentStepIndex < steps.length - 1) {
        applyStep(steps[currentStepIndex + 1])
      } else {
        commitOperation()
      }
    },
    stepBack: () => {
      const { currentStepIndex, steps, applyStep } = get()
      if (currentStepIndex > 0) applyStep(steps[currentStepIndex - 1])
    },
    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

    reset: () => {
      const arr = generateRandomArray(get().arraySize)
      set((state) => {
        state.originalArray = arr
        state.currentArray = [...arr]
        state.steps = []
        state.currentStepIndex = -1
        state.currentStep = null
        state.isPlaying = false
      })
    },
  }))
)

export const selectors = {
  algorithm:   (s: SortingStore) => s.algorithm,
  currentArray: (s: SortingStore) => s.currentArray,
  currentStep: (s: SortingStore) => s.currentStep,
  currentStepIndex: (s: SortingStore) => s.currentStepIndex,
  isPlaying:   (s: SortingStore) => s.isPlaying,
  playbackSpeed: (s: SortingStore) => s.playbackSpeed,
  operationLog: (s: SortingStore) => s.operationLog,
  arraySize:   (s: SortingStore) => s.arraySize,
  actions: (s: SortingStore) => ({
    setAlgorithm: s.setAlgorithm,
    generateArray: s.generateArray,
    setArraySize: s.setArraySize,
    runSort: s.runSort,
    applyStep: s.applyStep,
    commitOperation: s.commitOperation,
    play: s.play,
    pause: s.pause,
    stepForward: s.stepForward,
    stepBack: s.stepBack,
    setPlaybackSpeed: s.setPlaybackSpeed,
    reset: s.reset,
  }),
}
