import { create } from 'zustand'

interface UIState {
  isFullscreen: boolean
  toggleFullscreen: () => void
  setFullscreen: (val: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isFullscreen: false,
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  setFullscreen: (val) => set({ isFullscreen: val }),
}))
