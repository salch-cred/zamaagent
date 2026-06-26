'use client'
import { useState } from 'react'

export type InvoiceStatus = 'PAID' | 'PENDING' | 'SENT' | 'OVERDUE'

export type Invoice = {
  id: string
  client: string
  desc: string
  status: InvoiceStatus
  amount: bigint | null
}

const statusStyles: Record<InvoiceStatus, string> = {
  PAID:    'bg-brand/10 text-brand border-brand/30',
  PENDING: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  SENT:    'bg-blue-400/10 text-blue-400 border-blue-400/30',
  OVERDUE: 'bg-red-400/10 text-red-400 border-red-400/30',
}

export function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/40 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        {/* ID badge */}
        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 flex-shrink-0">
          #{invoice.id}
        </div>

        {/* Details */}
        <div>
          <div className="text-sm font-medium text-white">{invoice.client}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{invoice.desc}</div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Encrypted amount */}
        <div className="text-right">
          <div
            className={`font-mono text-sm text-white transition-all ${
              revealed ? '' : 'blur-[4px] select-none'
            }`}
          >
            {revealed && invoice.amount
              ? `${Number(invoice.amount / BigInt(1e6)).toLocaleString()} cUSDT`
              : '••••• cUSDT'}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setRevealed(!revealed) }}
            className="text-xs text-brand hover:text-brand-dark mt-0.5 transition-colors"
          >
            {revealed ? '🔒 Hide' : '🔓 Reveal'}
          </button>
        </div>

        {/* Status badge */}
        <span className={`text-xs px-2.5 py-1 rounded-full border ${statusStyles[invoice.status]}`}>
          {invoice.status}
        </span>

        {/* FHE badge */}
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
          🔐
        </span>
      </div>
    </div>
  )
}
