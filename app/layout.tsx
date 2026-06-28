import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'SKIDS.AI',
  description: 'Filtration skid database & RFQ matching — Seable&Co.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${jakarta.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
