// src/app/(visualizer)/linked-list/singly/page.tsx
// This is the page component for the Singly Linked List visualizer.
// It wires together the canvas, controls, and educational footer.
// The actual heavy components are lazy-loaded ('use client' boundary is in each).

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singly Linked List',
  description:
    'Visualize singly linked list operations: insert at head/tail, delete, search — with step-by-step pointer animations.',
}

// VisualizerPage is a client component because it mounts the animation hook
import { SinglyLinkedListPage } from '@/components/pages/SinglyLinkedListPage'

export default function SinglyLinkedListRoute() {
  return <SinglyLinkedListPage />
}
