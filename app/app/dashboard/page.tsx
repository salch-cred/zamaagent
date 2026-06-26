'use client'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { EncryptedAmount } from '@/components/app/EncryptedAmount'
import { AgentProactiveCard } from '@/components/app/AgentProactiveCard'
import { InvoiceRow, type Invoice, type InvoiceStatus } from '@/components/app/InvoiceRow'
import Link from 'next/link'
import { CONTRACTS, INVOICE_ABI, REPUTATION_ABI, isConfigured, isReputationConfigured } from '@/lib/contracts'

const MOCK_INVOICES: Invoice[] = [
  { id: '001', client: '0x1a2b...9f3e', desc: 'Smart contract audit',  status: 'PAID',    amount: null },
  { id: '002', client: '0x7c8d...4a1f', desc: 'Frontend development',  status: 'PENDING', amount: null },
  { id: '003', client: '0x3e5f...2b7d', desc: 'API integration',       status: 'SENT',    amount: null },
]

interface OnChainInvoice {
  freelancer: string; client: string; amount: bigint
  isPaid: boolean; isDisputed: boolean
  createdAt: bigint; dueDate: bigint; workDescription: string
}

function toStatus(inv: OnChainInvoice, now: number): InvoiceStatus {
  if (inv.isPaid)     return 'PAID'
  if (inv.isDisputed) return 'DISPUTED'
  if (Number(inv.dueDate) < now) return 'OVERDUE'
  return 'PENDING'
}

function handleToHex(h: bigint): `0x${string}` {
  return ('0x' + h.toString(16).padStart(64, '0')) as `0x${string}`
}

export default function DashboardPage() {
  const { address }     = useAccount()
  const configured      = isConfigured()
  const repConfigured   = isReputationConfigured()
  const liveEnabled     = configured && !!address
  const repEnabled      = repConfigured && !!address

  const shortAddr = address ? address.slice(0, 6) + '...' + address.slice(-4) : ''

  // Freelancer invoice IDs
  const { data: freelancerIds } = useReadContract({
    address: CONTRACTS.ConfidentialInvoice.address,
    abi: INVOICE_ABI,
    functionName: 'getFreelancerInvoices',
    args: [address as `0x${string}`],
    query: { enabled: liveEnabled },
  })

  const ids = (freelancerIds as bigint[] | undefined) ?? []
  const recentIds = ids.slice(-3).reverse()

  const { data: invoiceDetails } = useReadContracts({
    contracts: recentIds.map(id => ({
      address: CONTRACTS.ConfidentialInvoice.address,
      abi: INVOICE_ABI,
      functionName: 'invoices' as const,
      args: [id] as const,
    })),
    query: { enabled: liveEnabled && recentIds.length > 0 },
  })

  const { data: scoreData } = useReadContract({
    address: CONTRACTS.ConfidentialReputation.address,
    abi: REPUTATION_ABI,
    functionName: 'reputationScore',
    args: [address as `0x${string}`],
    query: { enabled: repEnabled },
  })

  const now = Math.floor(Date.now() / 1000)

  const liveInvoices: Invoice[] | null = invoiceDetails
    ? invoiceDetails
        .map((r, i) => {
          if (r.status !== 'success') return null
          const inv = r.result as unknown as OnChainInvoice
          return {
            id: String(recentIds[i]),
            client: inv.client.slice(0, 6) + '...' + inv.client.slice(-4),
            desc: inv.workDescription,
            status: toStatus(inv, now),
            amount: null,
            encryptedHandle: handleToHex(inv.amount),
            contractAddress: CONTRACTS.ConfidentialInvoice.address,
          }
        })
        .filter((x): x is Invoice => x !== null)
    : null

  const displayInvoices = liveInvoices ?? MOCK_INVOICES

  const pendingCount = liveInvoices
    ? liveInvoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').length
    : 3

  const displayScore = repEnabled && scoreData !== undefined ? Number(scoreData) : 847

  // Style for reputation progress bar — extracted const avoids inline double-brace
  const repBarStyle = { width: (displayScore / 10).toFixed(0) + '%' }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">
          Welcome back{shortAddr ? ', ' + shortAddr : ''} 👋
        </h2>
        <p className="text-zinc-500 text-sm">Here&apos;s what&apos;s happening with your earnings today.</p>
      </div>

      <AgentProactiveCard />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 col-span-2 lg:col-span-1">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Total Earned</div>
          <EncryptedAmount size="md" handle={undefined} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Pending</div>
          <div className="font-mono text-2xl font-bold text-yellow-400">{pendingCount}</div>
          <div className="text-xs text-zinc-500 mt-1">invoices</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Reputation</div>
          <div className="font-mono text-2xl font-bold text-brand">{displayScore}</div>
          <div className="text-xs text-zinc-500 mt-1">/ 1000 • ERC-8004</div>
          <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full" style={repBarStyle} />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">Yield APY</div>
          <div className="font-mono text-2xl font-bold text-blue-400">4.2%</div>
          <div className="text-xs text-zinc-500 mt-1">Morpho vault • auto</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-white">Recent Invoices</h3>
          <Link href="/app/invoices" className="text-sm text-brand hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {displayInvoices.map((inv) => (
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
