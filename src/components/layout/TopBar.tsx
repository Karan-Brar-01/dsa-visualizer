'use client'

import { usePathname } from 'next/navigation'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

// Map route segments to display labels
const ROUTE_LABELS: Record<string, string> = {
  'singly': 'Singly Linked List',
  'doubly': 'Doubly Linked List',
  'circular': 'Circular Linked List',
  'bst': 'Binary Search Tree',
  'avl': 'AVL Tree',
  'heap': 'Binary Heap',
  'bfs': 'Breadth-First Search',
  'dfs': 'Depth-First Search',
  'merge': 'Merge Sort',
  'quick': 'Quick Sort',
}

export function TopBar() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1] ?? ''
  const label = ROUTE_LABELS[lastSegment] ?? 'Visualizer'

  const { isFullscreen, toggleFullscreen } = useUIStore()

  return (
    <header
      className="
        flex items-center justify-between
        h-14 px-6 flex-shrink-0
        bg-[hsl(225,18%,9%)] border-b border-[hsl(225,12%,18%)]
      "
    >
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-[hsl(210,20%,92%)]">
          {label}
        </h1>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[hsl(225,12%,18%)] bg-[hsl(225,14%,16%)] px-2.5 py-0.5 text-[10px] font-mono text-[hsl(210,8%,45%)]">
          interactive
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-[hsl(210,8%,45%)]">
        <div className="hidden sm:flex items-center gap-2">
          <kbd className="rounded border border-[hsl(225,12%,18%)] bg-[hsl(225,14%,16%)] px-1.5 py-0.5 font-mono text-[10px]">
            Space
          </kbd>
          <span>play/pause</span>
          <span className="mx-1 text-[hsl(225,12%,18%)]">·</span>
          <kbd className="rounded border border-[hsl(225,12%,18%)] bg-[hsl(225,14%,16%)] px-1.5 py-0.5 font-mono text-[10px]">
            ←
          </kbd>
          <kbd className="rounded border border-[hsl(225,12%,18%)] bg-[hsl(225,14%,16%)] px-1.5 py-0.5 font-mono text-[10px]">
            →
          </kbd>
          <span>step</span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="md:hidden flex items-center justify-center p-2 rounded-lg bg-[hsl(225,14%,16%)] text-[hsl(210,20%,92%)] border border-[hsl(225,12%,18%)]"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </header>
  )
}
