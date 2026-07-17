import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DSA Visualizer — Interactive Data Structures & Algorithms',
    template: '%s | DSA Visualizer',
  },
  description:
    'An interactive platform for visualizing data structures and algorithms step-by-step. Master linked lists, trees, graphs, and sorting algorithms through animated, first-principles explanations.',
  keywords: [
    'data structures',
    'algorithms',
    'visualization',
    'linked list',
    'binary search tree',
    'graph traversal',
    'sorting algorithms',
    'interactive learning',
  ],
  authors: [{ name: 'DSA Visualizer' }],
  creator: 'DSA Visualizer',
  openGraph: {
    type: 'website',
    title: 'DSA Visualizer',
    description: 'Interactive Data Structures & Algorithm Visualizer',
    siteName: 'DSA Visualizer',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
