import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SKIDS.AI',
  description: 'Filtration skid database & RFQ matching — Seable&Co.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="grid-bg min-h-screen">{children}</body>
    </html>
  )
}
