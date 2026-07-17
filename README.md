# DSA Visualizer

A production-ready, interactive Data Structure & Algorithm learning platform.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Visualization | React Flow |
| State | Zustand + Immer |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Content | MDX + Prisma/PostgreSQL |

## Architecture

The codebase enforces strict separation between three layers:

```
src/core/    ← Pure TypeScript math engines (zero React/DOM)
src/stores/  ← Zustand translates math state → visual state  
src/components/ ← React Flow renders only what the store says
```

## Getting Started

```bash
# Install Node.js 20 (if not already installed via your system package manager)
# The project requires Node >= 18

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding PATH for the local Node.js installation

If you installed Node via `uvx nodeenv` (as set up during scaffolding):

```bash
export PATH="$HOME/.local/nodeenv/bin:$PATH"
npm run dev
```

Or add this to your `~/.zshrc`:

```bash
export PATH="$HOME/.local/nodeenv/bin:$PATH"
```

## Database (optional — for MDX content via Prisma)

```bash
cp .env.example .env.local
# Edit .env.local with your PostgreSQL connection string
npx prisma migrate dev
```

## Project Structure

```
src/
├── app/               # Next.js App Router pages
├── core/              # Pure TS data structure engines
│   └── linked-list/
│       └── SinglyLinkedList.ts
├── stores/            # Zustand stores (stratified slices)
│   └── singlyLinkedListStore.ts
├── components/
│   ├── canvas/        # React Flow visualizers
│   ├── controls/      # Operation + step controls
│   ├── educational/   # Educational footer
│   └── layout/        # Sidebar + TopBar
├── hooks/
│   ├── useAnimationSequencer.ts
│   └── useVisualizerLayout.ts
└── types/             # Shared type contracts
    ├── animation.ts
    └── flow.ts
```
