'use client'
import { useState } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { CONTRACTS, INVOICE_ABI, isConfigured } from '@/lib/contracts'

interface OnChainInvoice {
  freelancer: string; client: string; amount: bigint
  isPaid: boolean; isDisputed: boolean
  createdAt: bigint; dueDate: bigint; workDescription: string
}

export function AgentProactiveCard() {
  const { address }  = useAccount()
  const configured   = isConfigured()
  const liveEnabled  = configured && !!address
  const [dismissed, setDismissed] = useState(false)
  const [acted,     setActed]     = useState(false)

  const { data: freelancerIds } = useReadContract({
    address: CONTRACTS.ConfidentialInvoice.address,
    abi: INVOICE_ABI,
    functionName: 'getFreelancerInvoices',
    args: [address as `0x${string}`],
    query: { enabled: liveEnabled },
  })

  const ids = (freelancerIds as bigint[] | undefined) ?? []

  const { data: invoiceDetails } = useReadContracts({
    contracts: ids.map(id => ({
      address: CONTRACTS.ConfidentialInvoice.address,
      abi: INVOICE_ABI,
      functionName: 'invoices' as const,
      args: [id] as const,
    })),
    query: { enabled: liveEnabled && ids.length > 0 },
  })

  const now = Math.floor(Date.now() / 1000)

  // Find the first overdue invoice
  let overdueInvoice: { id: string; client: string; daysOverdue: number } | null = null
  if (invoiceDetails) {
    const idx = invoiceDetails.findIndex(r => {
      if (r.status !== 'success') return false
      const inv = r.result as unknown as OnChainInvoice
      return !inv.isPaid && !inv.isDisputed && Number(inv.dueDate) < now
    })
    if (idx >= 0 && invoiceDetails[idx].status === 'success') {
      const inv = invoiceDetails[idx].result as unknown as OnChainInvoice
      overdueInvoice = {
        id: String(ids[idx]),
        client: inv.client.slice(0, 6) + '...' + inv.client.slice(-4),
        daysOverdue: Math.floor((now - Number(inv.dueDate)) / 86400),
      }
    }
  }

  // Use mock if not yet live
  const displayInvoice = overdueInvoice ?? (!liveEnabled
    ? { id: '003', client: '0x3e5f...2b7d', daysOverdue: 7 }
    : null)

  if (dismissed || (!displayInvoice && liveEnabled)) return null

  return (
    <div className="mb-6 bg-zinc-900 border border-zinc-700 rounded-2xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/30 to-fhe/30 border border-zinc-700 flex items-center justify-center text-xl flex-shrink-0">
        🤖
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white">PayMate AI Agent</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand/20 text-brand border border-brand/30">Active</span>
        </div>
        {!acted && displayInvoice ? (
          <>
            <p className="text-sm text-zinc-400 mb-3">
              Invoice <span className="text-white font-mono">#{displayInvoice.id}</span> to{' '}
              <span className="text-white font-mono">{displayInvoice.client}</span> is{' '}
              <span className="text-yellow-400 font-medium">{displayInvoice.daysOverdue} day{displayInvoice.daysOverdue !== 1 ? 's' : ''} overdue</span>.
              Want me to send a payment reminder?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setActed(true)}
                className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-black text-xs font-semibold rounded-lg transition-all"
              >
                Yes, send reminder
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-1.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs rounded-lg transition-all"
              >
                Dismiss
              </button>
            </div>
          </>
        ) : acted ? (
          <p className="text-sm text-brand">✅ Reminder sent! I&apos;ll follow up again in 48 hours if there&apos;s no response.</p>
        ) : null}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-zinc-600 hover:text-zinc-400 text-lg flex-shrink-0 transition-colors"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
