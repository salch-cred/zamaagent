'use client'
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EncryptedAmount } from './EncryptedAmount'
import { CONTRACTS, INVOICE_ABI } from '@/lib/contracts'

export type InvoiceStatus = 'PAID' | 'PENDING' | 'SENT' | 'OVERDUE' | 'DISPUTED' | 'AUTO_RESOLVED' | 'ERASED'

export type Invoice = {
  id: string
  client: string
  desc: string
  status: InvoiceStatus
  amount: bigint | null
  encryptedHandle?: `0x${string}`
  contractAddress?: `0x${string}`
  dueDate?: number // unix timestamp
}

const statusStyles: Record<InvoiceStatus, string> = {
  PAID:          'bg-brand/10 text-brand border-brand/30',
  PENDING:       'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  SENT:          'bg-blue-400/10 text-blue-400 border-blue-400/30',
  OVERDUE:       'bg-red-400/10 text-red-400 border-red-400/30',
  DISPUTED:      'bg-orange-400/10 text-orange-400 border-orange-400/30',
  AUTO_RESOLVED: 'bg-purple-400/10 text-purple-400 border-purple-400/30',
  ERASED:        'bg-zinc-700/30 text-zinc-500 border-zinc-700/30',
}

function MockAmount({
  amount,
  revealed,
  onToggle,
}: {
  amount: bigint
  revealed: boolean
  onToggle: () => void
}) {
  const displayText = revealed
    ? Number(amount / BigInt(1_000_000)).toLocaleString() + ' cUSDT'
    : '••••• cUSDT'
  const blurClass = revealed ? '' : 'blur-[4px] select-none'
  return (
    <div className="text-right">
      <div className={'font-mono text-sm text-white transition-all ' + blurClass}>
        {displayText}
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

export function InvoiceRow({ invoice, onStatusChange }: {
  invoice: Invoice
  onStatusChange?: (id: string, status: InvoiceStatus) => void
}) {
  const [revealed, setRevealed] = useState(false)
  const [localStatus, setLocalStatus] = useState<InvoiceStatus>(invoice.status)

  // ── payInvoice write ──────────────────────────────────────────────────────
  const {
    writeContract: writePay,
    data: payTxHash,
    isPending: isPayPending,
  } = useWriteContract()

  const { isLoading: isPayConfirming, isSuccess: isPaySuccess } =
    useWaitForTransactionReceipt({ hash: payTxHash })

  // ── disputeInvoice write ──────────────────────────────────────────────────
  const {
    writeContract: writeDispute,
    data: disputeTxHash,
    isPending: isDisputePending,
  } = useWriteContract()

  const { isLoading: isDisputeConfirming, isSuccess: isDisputeSuccess } =
    useWaitForTransactionReceipt({ hash: disputeTxHash })

  // Update local status on tx success
  if (isPaySuccess && localStatus !== 'PAID') {
    setLocalStatus('PAID')
    onStatusChange?.(invoice.id, 'PAID')
  }
  if (isDisputeSuccess && localStatus !== 'DISPUTED') {
    setLocalStatus('DISPUTED')
    onStatusChange?.(invoice.id, 'DISPUTED')
  }

  const handlePay = () => {
    writePay({
      address: CONTRACTS.ConfidentialInvoice.address,
      abi: INVOICE_ABI,
      functionName: 'payInvoice',
      args: [BigInt(invoice.id)],
    })
  }

  const handleDispute = () => {
    writeDispute({
      address: CONTRACTS.ConfidentialInvoice.address,
      abi: INVOICE_ABI,
      functionName: 'disputeInvoice',
      args: [BigInt(invoice.id)],
    })
  }

  const isPayLoading     = isPayPending || isPayConfirming
  const isDisputeLoading = isDisputePending || isDisputeConfirming
  const canPay           = localStatus === 'PENDING' || localStatus === 'OVERDUE' || localStatus === 'SENT'
  const canDispute       = localStatus === 'PENDING' || localStatus === 'SENT' || localStatus === 'OVERDUE'

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

      <div className="flex items-center gap-3">
        {/* Encrypted amount */}
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

        {/* Status badge */}
        <span className={'text-xs px-2.5 py-1 rounded-full border ' + statusStyles[localStatus]}>
          {localStatus.replace('_', ' ')}
        </span>

        {/* Action buttons — live on-chain writes */}
        {canPay && (
          <button
            onClick={handlePay}
            disabled={isPayLoading}
            className="text-xs px-2.5 py-1 rounded-lg bg-brand/10 text-brand border border-brand/30 hover:bg-brand/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPayLoading ? '⏳' : '✅ Pay'}
          </button>
        )}

        {canDispute && (
          <button
            onClick={handleDispute}
            disabled={isDisputeLoading}
            className="text-xs px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDisputeLoading ? '⏳' : '⚠️ Dispute'}
          </button>
        )}

        <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
          🔐
        </span>
      </div>
    </div>
  )
}
