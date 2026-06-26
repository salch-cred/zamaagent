'use client'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

const pageTitles: Record<string, string> = {
  '/app/dashboard':  'Dashboard',
  '/app/invoices':   'Invoices',
  '/app/earnings':   'Earnings',
  '/app/reputation': 'Reputation',
  '/app/payouts':    'Payouts',
  '/app/agent':      'AI Agent',
  '/app/settings':   'Settings',
}

export function TopBar() {
  const pathname = usePathname()
  const title    = pageTitles[pathname] ?? 'PayMate'

  return (
    <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#09090B]/80 backdrop-blur-sm flex-shrink-0">
      <h1 className="text-white font-semibold text-lg">{title}</h1>
      <div className="flex items-center gap-4">
        {/* New invoice shortcut */}
        <Link
          href="/app/invoices/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-black text-sm font-semibold rounded-lg transition-all hover:shadow-glow-green"
        >
          <span>+</span> New Invoice
        </Link>
        <ConnectButton showBalance={false} chainStatus="none" />
      </div>
    </header>
  )
}
