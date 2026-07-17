import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

import { ClientLayout } from './ClientLayout'

export const metadata: Metadata = {
  title: 'Visualizer',
}

export default function VisualizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
