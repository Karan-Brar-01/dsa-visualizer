import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'DSA Visualizer — Interactive Data Structures & Algorithms',
  description:
    'Master data structures and algorithms through interactive, step-by-step animations. Observe pointer reassignments, tree rotations, and graph traversals one frame at a time.',
}

const CATEGORIES = [
  {
    slug: 'linked-list/singly',
    label: 'Singly Linked List',
    description: 'Pointer-based linear chain with O(1) head insertion.',
    group: 'Linked Lists',
    complexity: { best: 'O(1)', worst: 'O(n)' },
    icon: '⛓️',
    gradient: 'from-violet-500/25 via-violet-600/10 to-transparent',
    border: 'hover:border-violet-500/50',
    glow: 'hover:shadow-[0_0_40px_hsl(261_82%_65%/0.15)]',
    accent: 'text-violet-400',
    tag: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    badge: 'Ready',
    badgeStyle: 'bg-green-500/15 text-green-400 border border-green-500/30',
  },
  {
    slug: 'linked-list/doubly',
    label: 'Doubly Linked List',
    description: 'Bidirectional pointers enabling O(1) tail operations.',
    group: 'Linked Lists',
    complexity: { best: 'O(1)', worst: 'O(n)' },
    icon: '🔗',
    gradient: 'from-purple-500/25 via-purple-600/10 to-transparent',
    border: 'hover:border-purple-500/50',
    glow: 'hover:shadow-[0_0_40px_hsl(270_82%_65%/0.15)]',
    accent: 'text-purple-400',
    tag: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    badge: 'Soon',
    badgeStyle: 'bg-[hsl(225,14%,20%)] text-[hsl(210,8%,45%)] border border-[hsl(225,12%,24%)]',
  },
  {
    slug: 'trees/bst',
    label: 'Binary Search Tree',
    description: 'Sorted binary tree with logarithmic average-case operations.',
    group: 'Trees',
    complexity: { best: 'O(log n)', worst: 'O(n)' },
    icon: '🌳',
    gradient: 'from-emerald-500/25 via-emerald-600/10 to-transparent',
    border: 'hover:border-emerald-500/50',
    glow: 'hover:shadow-[0_0_40px_hsl(142_72%_52%/0.15)]',
    accent: 'text-emerald-400',
    tag: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    badge: 'Ready',
    badgeStyle: 'bg-green-500/15 text-green-400 border border-green-500/30',
  },
  {
    slug: 'trees/avl',
    label: 'AVL Tree',
    description: 'Self-balancing BST maintaining O(log n) height invariant.',
    group: 'Trees',
    complexity: { best: 'O(log n)', worst: 'O(log n)' },
    icon: '⚖️',
    gradient: 'from-teal-500/25 via-teal-600/10 to-transparent',
    border: 'hover:border-teal-500/50',
    glow: 'hover:shadow-[0_0_40px_hsl(171_72%_52%/0.15)]',
    accent: 'text-teal-400',
    tag: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    badge: 'Soon',
    badgeStyle: 'bg-[hsl(225,14%,20%)] text-[hsl(210,8%,45%)] border border-[hsl(225,12%,24%)]',
  },
  {
    slug: 'graphs/bfs',
    label: 'BFS Traversal',
    description: 'Level-by-level exploration using a FIFO queue.',
    group: 'Graphs',
    complexity: { best: 'O(V+E)', worst: 'O(V+E)' },
    icon: '🌊',
    gradient: 'from-cyan-500/25 via-cyan-600/10 to-transparent',
    border: 'hover:border-cyan-500/50',
    glow: 'hover:shadow-[0_0_40px_hsl(196_90%_55%/0.15)]',
    accent: 'text-cyan-400',
    tag: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    badge: 'Soon',
    badgeStyle: 'bg-[hsl(225,14%,20%)] text-[hsl(210,8%,45%)] border border-[hsl(225,12%,24%)]',
  },
  {
    slug: 'graphs/dfs',
    label: 'DFS Traversal',
    description: 'Depth-first path exploration using a LIFO stack.',
    group: 'Graphs',
    complexity: { best: 'O(V+E)', worst: 'O(V+E)' },
    icon: '🔍',
    gradient: 'from-sky-500/25 via-sky-600/10 to-transparent',
    border: 'hover:border-sky-500/50',
    glow: 'hover:shadow-[0_0_40px_hsl(200_90%_55%/0.15)]',
    accent: 'text-sky-400',
    tag: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    badge: 'Soon',
    badgeStyle: 'bg-[hsl(225,14%,20%)] text-[hsl(210,8%,45%)] border border-[hsl(225,12%,24%)]',
  },
  {
    slug: 'sorting/merge',
    label: 'Merge Sort',
    description: 'Divide-and-conquer with guaranteed O(n log n) time.',
    group: 'Sorting',
    complexity: { best: 'O(n log n)', worst: 'O(n log n)' },
    icon: '🔀',
    gradient: 'from-amber-500/25 via-amber-600/10 to-transparent',
    border: 'hover:border-amber-500/50',
    glow: 'hover:shadow-[0_0_40px_hsl(38_92%_60%/0.15)]',
    accent: 'text-amber-400',
    tag: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    badge: 'Soon',
    badgeStyle: 'bg-[hsl(225,14%,20%)] text-[hsl(210,8%,45%)] border border-[hsl(225,12%,24%)]',
  },
  {
    slug: 'sorting/quick',
    label: 'Quick Sort',
    description: 'In-place pivot partitioning with O(n log n) average.',
    group: 'Sorting',
    complexity: { best: 'O(n log n)', worst: 'O(n²)' },
    icon: '⚡',
    gradient: 'from-orange-500/25 via-orange-600/10 to-transparent',
    border: 'hover:border-orange-500/50',
    glow: 'hover:shadow-[0_0_40px_hsl(25_92%_60%/0.15)]',
    accent: 'text-orange-400',
    tag: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    badge: 'Soon',
    badgeStyle: 'bg-[hsl(225,14%,20%)] text-[hsl(210,8%,45%)] border border-[hsl(225,12%,24%)]',
  },
]

const GROUPS = ['Linked Lists', 'Trees', 'Graphs', 'Sorting']

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[hsl(225,20%,6%)] text-[hsl(210,20%,92%)]">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-28 pb-20">
        {/* Layered radial glows */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-violet-600/8 blur-[120px]" />
          <div className="absolute top-20 left-1/3 w-[400px] h-[300px] rounded-full bg-cyan-600/6 blur-[100px]" />
          <div className="absolute top-10 right-1/4 w-[300px] h-[200px] rounded-full bg-purple-600/6 blur-[80px]" />
        </div>

        {/* Grid overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(210,20%,92%) 1px,transparent 1px),linear-gradient(90deg,hsl(210,20%,92%) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-8">
            <span className="flex h-1.5 w-1.5 rounded-full bg-violet-400">
              <span className="animate-ping absolute h-1.5 w-1.5 rounded-full bg-violet-400 opacity-75" />
            </span>
            First-principles interactive learning
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
              Visualize
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Data Structures
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-[hsl(210,12%,58%)] max-w-xl mx-auto leading-relaxed mb-10">
            Step through pointer reassignments, tree rotations, and graph traversals —
            one animated frame at a time. Built for first-principles learners.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/linked-list/singly"
              id="hero-start-btn"
              className="
                inline-flex items-center gap-2 rounded-full
                bg-violet-600 hover:bg-violet-500 active:bg-violet-700
                text-white font-semibold px-7 py-3 text-sm
                shadow-[0_0_40px_hsl(261_82%_65%/0.35)]
                transition-all hover:shadow-[0_0_50px_hsl(261_82%_65%/0.5)]
                hover:scale-[1.03] active:scale-[0.98]
              "
            >
              Start Visualizing
              <span aria-hidden>→</span>
            </Link>
            <a
              href="#structures"
              id="hero-browse-btn"
              className="
                inline-flex items-center gap-2 rounded-full
                border border-[hsl(225,12%,26%)] bg-[hsl(225,16%,12%)]
                text-[hsl(210,12%,65%)] hover:text-white hover:border-[hsl(225,10%,36%)]
                font-medium px-6 py-3 text-sm
                transition-all
              "
            >
              Browse structures
            </a>
          </div>
        </div>
      </section>

      {/* ── Feature chips ────────────────────────────────────────────────────── */}
      <section className="px-6 pb-12" aria-label="Key features">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
          {[
            { icon: '🎬', text: 'Step-by-step animation' },
            { icon: '⌨️', text: 'Keyboard shortcuts' },
            { icon: '📐', text: 'Complexity analysis' },
            { icon: '🧩', text: 'First-principles explanations' },
            { icon: '⚡', text: 'Real-time state sync' },
          ].map((f) => (
            <div
              key={f.text}
              className="
                flex items-center gap-2 rounded-full
                border border-[hsl(225,12%,20%)] bg-[hsl(225,16%,11%)]
                px-4 py-2 text-xs text-[hsl(210,10%,55%)]
              "
            >
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category grid ────────────────────────────────────────────────────── */}
      <section id="structures" className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="flex flex-col gap-10">
          {GROUPS.map((group) => {
            const cats = CATEGORIES.filter((c) => c.group === group)
            return (
              <div key={group}>
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-sm font-semibold text-[hsl(210,12%,60%)] uppercase tracking-widest">
                    {group}
                  </h2>
                  <div className="flex-1 h-px bg-[hsl(225,12%,18%)]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {cats.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/${cat.slug}`}
                      id={`card-${cat.slug.replace(/\//g, '-')}`}
                      className={`
                        group relative flex flex-col gap-4 rounded-2xl p-5
                        border border-[hsl(225,12%,18%)] ${cat.border} ${cat.glow}
                        bg-gradient-to-br from-[hsl(225,18%,10%)] to-[hsl(225,16%,8%)]
                        transition-all duration-300
                        hover:scale-[1.025] active:scale-[0.99]
                        overflow-hidden
                      `}
                    >
                      {/* Gradient overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                      />

                      <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <span className="text-2xl">{cat.icon}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${cat.badgeStyle}`}>
                            {cat.badge}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-[hsl(210,18%,88%)] mb-1 group-hover:text-white transition-colors">
                            {cat.label}
                          </h3>
                          <p className="text-[11px] text-[hsl(210,8%,45%)] leading-snug">
                            {cat.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mt-auto">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${cat.tag}`}>
                            best {cat.complexity.best}
                          </span>
                          {cat.complexity.worst !== cat.complexity.best && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border bg-[hsl(225,14%,16%)] text-[hsl(210,8%,45%)] border-[hsl(225,12%,22%)]">
                              worst {cat.complexity.worst}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
