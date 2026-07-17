import { useState, useEffect } from 'react'

export function useVisualViewport() {
  const [viewport, setViewport] = useState({ height: '100dvh', offsetTop: '0px' })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const update = () => {
      setViewport({
        height: `${window.visualViewport?.height || window.innerHeight}px`,
        offsetTop: `${window.visualViewport?.pageTop || 0}px`
      })
      
      // We no longer forcefully scrollTo(0, 0) on resize/scroll because we are tracking the offsetTop instead!
    }

    // We must listen to both resize AND scroll on the visualViewport,
    // as iOS Safari triggers 'scroll' when shifting the page for the keyboard.
    window.visualViewport.addEventListener('resize', update)
    window.visualViewport.addEventListener('scroll', update)
    update()

    return () => {
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [])

  return viewport
}
