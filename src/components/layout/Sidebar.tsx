'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_GROUPS = [
  {
    label: 'Linked Lists',
    items: [
      { href: '/linked-list/singly', label: 'Singly', icon: '⛓️' },
      { href: '/linked-list/doubly', label: 'Doubly', icon: '🔗' },
      { href: '/linked-list/circular', label: 'Circular', icon: '🔄' },
    ],
  },
  {
    label: 'Trees',
    items: [
      { href: '/trees/bst', label: 'BST', icon: '🌳' },
      { href: '/trees/avl', label: 'AVL', icon: '⚖️' },
      { href: '/trees/heap', label: 'Heap', icon: '🏔️' },
    ],
  },
  {
    label: 'Graphs',
    items: [
      { href: '/graphs/bfs', label: 'BFS', icon: '🌊' },
      { href: '/graphs/dfs', label: 'DFS', icon: '🔍' },
    ],
  },
  {
    label: 'Sorting',
    items: [
      { href: '/sorting/merge', label: 'Merge Sort', icon: '🔀' },
      { href: '/sorting/quick', label: 'Quick Sort', icon: '⚡' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="
        w-56 flex-shrink-0 flex flex-col
        bg-[hsl(225,18%,9%)] border-r border-[hsl(225,12%,18%)]
        overflow-y-auto
      "
      aria-label="DSA category navigation"
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[hsl(225,12%,18%)]">
        <Link
          href="/"
          id="sidebar-home-link"
          className="flex items-center gap-2.5 group"
        >
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_12px_hsl(261_82%_65%/0.4)]">
            D
          </div>
          <span className="font-semibold text-sm text-[hsl(210,20%,92%)] group-hover:text-white transition-colors">
            DSA Visualizer
          </span>
        </Link>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(210,8%,45%)]">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      id={`nav-${item.href.replace(/\//g, '-').slice(1)}`}
                      className={`
                        flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm
                        transition-all duration-150
                        ${
                          isActive
                            ? 'bg-violet-500/15 text-violet-300 font-medium border border-violet-500/20'
                            : 'text-[hsl(210,12%,65%)] hover:bg-[hsl(225,14%,16%)] hover:text-[hsl(210,20%,92%)]'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[hsl(225,12%,18%)]">
        <p className="text-[10px] text-[hsl(210,8%,45%)] text-center">
          First-principles DSA learning
        </p>
      </div>
    </aside>
  )
}
