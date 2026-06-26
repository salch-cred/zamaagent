import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'PayMate — Your earnings. Your business. Nobody else\'s.',
  description: 'AI-powered payroll and invoicing for freelancers. Instant stablecoin payouts, FHE-encrypted payments, portable on-chain reputation.',
  openGraph: {
    title: 'PayMate',
    description: 'Get paid privately. Powered by Zama fhEVM.',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="bg-[#09090B] text-white antialiased font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
