'use client'
import { useState } from 'react'
import { EncryptedAmount } from './EncryptedAmount'

export type InvoiceStatus = 'PAID' | 'PENDING' | 'SENT' | 'OVERDUE' | 'DISPUTED'

export type Invoice = {
  id: string
  client: string
  desc: string
  status: InvoiceStatus
  // plaintext amount (mock data) — mutually exclusive with encryptedHandle
  amount: bigint | null
  // on-chain encrypted handle (live data)
  encryptedHandle?: `0x${string}`
  // contract that holds the ACL for decrypting the handle
  contractAddress?: `0x${string}`
}

const statusStyles: Record<InvoiceStatus, string> = {
  PAID:     'bg-brand/10 text-brand border-brand/30',
  PENDING:  'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  SENT:     'bg-blue-400/10 text-blue-400 border-blue-400/30',
  OVERDUE:  'bg-red-400/10 text-red-400 border-red-400/30',
  DISPUTED: 'bg-orange-400/10 text-orange-400 border-orange-400/30',
}

function MockAmount({ amount, revealed, onToggle }: {
  amount: bigint; revealed: boolean; onToggle: () => void
}) {
  return (
    <div className="text-right">
      <div className={'font-mono text-sm text-white transition-all ' + (revealed ? '' : 'blur-[4px] select-none')}>
        {revealed ? Number(amount / BigInt(1_000_000)).toLocaleString() + ' cUSDT' : '••••• cUSDT'}
      </div>
      <button
        onClick={onToggle}
        className="text-xs text-brand hover:text-brand-dark mt-0.5 transition-colors"
      >
        {revealed ? '🔒 Hide' : '🔓 Reveal'}
      </button>
    </div>
  )
}

export function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/40 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 flex-shrink-0">
          #{invoice.id}
        </div>
        <div>
          <div className="text-sm font-medium text-white">{invoice.client}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{invoice.desc}</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          {invoice.encryptedHandle ? (
            <EncryptedAmount
              handle={invoice.encryptedHandle}
              size="sm"
              showLabel
              contractAddress={invoice.contractAddress}
            />
          ) : invoice.amount !== null ? (
            <MockAmount
              amount={invoice.amount}
              revealed={revealed}
              onToggle={() => setRevealed(r => !r)}
            />
          ) : (
            <span className="text-xs text-zinc-500 font-mono">🔐 Encrypted</span>
          )}
        </div>

        <span className={'text-xs px-2.5 py-1 rounded-full border ' + statusStyles[invoice.status]}>
          {invoice.status}
        </span>

        <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
          🔐
        </span>
      </div>
    </div>
  )
}
