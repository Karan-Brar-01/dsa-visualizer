import { useState, useEffect } from 'react'

export function useVisualViewport() {
  const [height, setHeight] = useState('100dvh')

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const updateHeight = () => {
      // Use visualViewport.height to get the exact height available above the keyboard
      setHeight(`${window.visualViewport?.height || window.innerHeight}px`)
      // Also reset scroll just in case iOS tried to scroll the layout viewport
      window.scrollTo(0, 0)
    }

    window.visualViewport.addEventListener('resize', updateHeight)
    // Initial set
    updateHeight()

    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight)
    }
  }, [])

  return height
}
