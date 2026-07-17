import { Metadata } from 'next'
import { BSTPage } from '@/components/pages/BSTPage'

export const metadata: Metadata = {
  title: 'Binary Search Tree Visualizer | DSA Visualizer',
  description: 'Interactive Binary Search Tree visualization. Animate insertions, deletions, and searches step-by-step.',
}

export default function Page() {
  return <BSTPage />
}
