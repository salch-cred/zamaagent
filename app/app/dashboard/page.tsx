'use client'
import { useAccount } from 'wagmi'
import { EncryptedAmount } from '@/components/app/EncryptedAmount'
import { AgentProactiveCard } from '@/components/app/AgentProactiveCard'
import { InvoiceRow, type Invoice } from '@/components/app/InvoiceRow'
import Link from 'next/link'

// Mock data — replace with real contract reads once deployed (DEV FILE 5).
const mockInvoices: Invoice[] = [
  { id: '001', client: '0x1a2b...9f3e', desc: 'Smart contract audit',  status: 'PAID',    amount: null },
  { id: '002', client: '0x7c8d...4a1f', desc: 'Frontend development',  status: 'PENDING', amount: null },
  { id: '003', client: '0x3e5f...2b7d', desc: 'API integration',       status: 'SENT',    amount: null },
]

export default function DashboardPage() {
  const { address } = useAccount()

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  return (
    <div className="max-w-5xl">

      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">
          Welcome back{shortAddr ? `, ${shortAddr}` : ''} 👋
        </h2>
        <p className="text-zinc-500 text-sm">Here&apos;s what&apos;s happening with your earnings today.</p>
      </div>

      {/* AI Agent proactive alert */}
      <AgentProactiveCard />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* Encrypted balance */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 col-span-2 lg:col-span-1">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Total Earned</div>
          <EncryptedAmount size="md" handle={undefined} />
        </div>

        {/* Pending */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Pending</div>
          <div className="font-mono text-2xl font-bold text-yellow-400">3</div>
          <div className="text-xs text-zinc-500 mt-1">invoices</div>
        </div>

        {/* Reputation */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Reputation</div>
          <div className="font-mono text-2xl font-bold text-brand">847</div>
          <div className="text-xs text-zinc-500 mt-1">/ 1000 • ERC-8004</div>
          {/* Progress bar — FIX: style was written as bare `style=width: '84.7%'` */}
          <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full" style={{ width: '84.7%' }} />
          </div>
        </div>

        {/* Yield */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Yield APY</div>
          <div className="font-mono text-2xl font-bold text-blue-400">4.2%</div>
          <div className="text-xs text-zinc-500 mt-1">Morpho vault • auto</div>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-white">Recent Invoices</h3>
          <Link href="/app/invoices" className="text-sm text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {mockInvoices.map((inv) => (
            <InvoiceRow key={inv.id} invoice={inv} />
          ))}
        </div>
        <div className="px-6 py-4 border-t border-zinc-800">
          <Link
            href="/app/invoices/new"
            className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-zinc-700 rounded-xl text-sm text-zinc-500 hover:text-white hover:border-zinc-500 transition-all"
          >
            <span>+</span> Create new invoice
          </Link>
        </div>
      </div>
    </div>
  )
}
