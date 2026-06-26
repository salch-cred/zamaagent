'use client'
import { useState } from 'react'
import { InvoiceRow, type Invoice, type InvoiceStatus } from '@/components/app/InvoiceRow'
import Link from 'next/link'

const mockInvoices: Invoice[] = [
  { id: '001', client: '0x1a2b...9f3e', desc: 'Smart contract audit',        status: 'PAID',    amount: BigInt(2500_000000) },
  { id: '002', client: '0x7c8d...4a1f', desc: 'Frontend development',        status: 'PENDING', amount: null },
  { id: '003', client: '0x3e5f...2b7d', desc: 'API integration',             status: 'OVERDUE', amount: null },
  { id: '004', client: '0x9a1c...7e2b', desc: 'Smart contract review',       status: 'PAID',    amount: BigInt(1200_000000) },
  { id: '005', client: '0x2d4f...8c3a', desc: 'Backend architecture consult', status: 'SENT',    amount: null },
]

type Filter = 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'

export default function InvoicesPage() {
  const [filter, setFilter] = useState<Filter>('ALL')

  const filtered = filter === 'ALL'
    ? mockInvoices
    : mockInvoices.filter(i => i.status === filter)

  const needsAttention = mockInvoices.filter(
    i => i.status === 'PENDING' || i.status === 'OVERDUE'
  ).length

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoices</h2>
          <p className="text-zinc-500 text-sm mt-1">
            {mockInvoices.length} total • {needsAttention} need attention
          </p>
        </div>
        <Link
          href="/app/invoices/new"
          className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-black text-sm font-semibold rounded-xl transition-all hover:shadow-glow-green"
        >
          + New Invoice
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              filter === f
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Invoice table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wide">
          <span>#</span>
          <span>Client</span>
          <span>Amount</span>
          <span>Status</span>
          <span />
        </div>
        <div className="divide-y divide-zinc-800/50">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-zinc-500 text-sm">
              No invoices found
            </div>
          ) : (
            filtered.map((inv) => (
              <InvoiceRow key={inv.id} invoice={inv} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
