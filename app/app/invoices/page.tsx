'use client'
import { useState } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { InvoiceRow, type Invoice, type InvoiceStatus } from '@/components/app/InvoiceRow'
import Link from 'next/link'
import { CONTRACTS, INVOICE_ABI, isConfigured } from '@/lib/contracts'

const MOCK_INVOICES: Invoice[] = [
  { id: '001', client: '0x1a2b...9f3e', desc: 'Smart contract audit',         status: 'PAID',    amount: BigInt(2_500_000_000) },
  { id: '002', client: '0x7c8d...4a1f', desc: 'Frontend development',         status: 'PENDING', amount: null },
  { id: '003', client: '0x3e5f...2b7d', desc: 'API integration',              status: 'OVERDUE', amount: null },
  { id: '004', client: '0x9a1c...7e2b', desc: 'Smart contract review',        status: 'PAID',    amount: BigInt(1_200_000_000) },
  { id: '005', client: '0x2d4f...8c3a', desc: 'Backend architecture consult', status: 'SENT',    amount: null },
]

type Filter = 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE' | 'DISPUTED'

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

function shortAddr(a: string) {
  return a.slice(0, 6) + '...' + a.slice(-4)
}

export default function InvoicesPage() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const { address }  = useAccount()
  const configured   = isConfigured()
  const liveEnabled  = configured && !!address

  // Fetch both freelancer and client invoice IDs
  const { data: freelancerIds } = useReadContract({
    address: CONTRACTS.ConfidentialInvoice.address,
    abi: INVOICE_ABI,
    functionName: 'getFreelancerInvoices',
    args: [address as `0x${string}`],
    query: { enabled: liveEnabled },
  })

  const { data: clientIds } = useReadContract({
    address: CONTRACTS.ConfidentialInvoice.address,
    abi: INVOICE_ABI,
    functionName: 'getClientInvoices',
    args: [address as `0x${string}`],
    query: { enabled: liveEnabled },
  })

  // Deduplicate and sort descending (newest first)
  const fIds  = (freelancerIds as bigint[] | undefined) ?? []
  const cIds  = (clientIds    as bigint[] | undefined) ?? []
  const seen  = new Set<string>()
  const allIds: bigint[] = []
  for (const id of [...fIds, ...cIds]) {
    const key = id.toString()
    if (!seen.has(key)) { seen.add(key); allIds.push(id) }
  }
  allIds.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0))

  const { data: invoiceDetails } = useReadContracts({
    contracts: allIds.map(id => ({
      address: CONTRACTS.ConfidentialInvoice.address,
      abi: INVOICE_ABI,
      functionName: 'invoices' as const,
      args: [id] as const,
    })),
    query: { enabled: liveEnabled && allIds.length > 0 },
  })

  const now = Math.floor(Date.now() / 1000)

  const liveInvoices: Invoice[] | null = invoiceDetails
    ? invoiceDetails
        .map((r, i) => {
          if (r.status !== 'success') return null
          const inv = r.result as unknown as OnChainInvoice
          const role = fIds.some(id => id === allIds[i]) ? 'sent' : 'received'
          return {
            id: String(allIds[i]),
            client: role === 'sent'
              ? shortAddr(inv.client)
              : shortAddr(inv.freelancer) + ' (you owe)',
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

  const filtered = filter === 'ALL'
    ? displayInvoices
    : displayInvoices.filter(i => i.status === filter)

  const needsAttention = displayInvoices.filter(
    i => i.status === 'PENDING' || i.status === 'OVERDUE'
  ).length

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoices</h2>
          <p className="text-zinc-500 text-sm mt-1">
            {displayInvoices.length} total
            {needsAttention > 0 ? ' • ' + needsAttention + ' need attention' : ''}
            {liveInvoices ? ' • Live on-chain' : ''}
          </p>
        </div>
        <Link
          href="/app/invoices/new"
          className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-black text-sm font-semibold rounded-xl transition-all hover:shadow-glow-green"
        >
          + New Invoice
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {(['ALL', 'PAID', 'PENDING', 'OVERDUE', 'DISPUTED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={'px-4 py-2 rounded-lg text-sm transition-all ' + (
              filter === f
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wide">
          <span>#</span><span>Client</span><span>Amount</span><span>Status</span><span />
        </div>
        <div className="divide-y divide-zinc-800/50">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-zinc-500 text-sm">No invoices found</div>
          ) : (
            filtered.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)
          )}
        </div>
      </div>
    </div>
  )
}
