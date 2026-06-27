'use client'

import { useState } from 'react'
import { Shield, ExternalLink, RefreshCw } from 'lucide-react'

/**
 * Encrypted Audit Trail
 * Every invoice payment, payroll action, vesting release, and reputation event
 * is logged with encrypted amounts — timestamps visible, data private.
 */

type EventType = 'InvoiceCreated' | 'InvoicePaid' | 'InvoiceDisputed' | 'InvoiceAutoResolved' |
                 'PayrollDeposit' | 'EmployeePaid' | 'CredentialIssued' | 'ScheduleCreated' |
                 'TokensReleased' | 'InvoiceErased' | 'ScheduleErased'

interface AuditEvent {
  id: string
  type: EventType
  txHash: string
  blockNumber: number
  timestamp: number // unix
  actor: string     // address
  target?: string
  amountEncrypted: boolean
  penaltyApplied?: boolean
  erased?: boolean
}

const MOCK_EVENTS: AuditEvent[] = [
  { id: '1', type: 'InvoiceCreated',     txHash: '0xabc1', blockNumber: 7841201, timestamp: Date.now() - 86400*5*1000, actor: '0x1234...5678', target: '0xabcd...ef01', amountEncrypted: true },
  { id: '2', type: 'InvoicePaid',        txHash: '0xabc2', blockNumber: 7841350, timestamp: Date.now() - 86400*4*1000, actor: '0x1234...5678', amountEncrypted: true, penaltyApplied: false },
  { id: '3', type: 'CredentialIssued',   txHash: '0xabc3', blockNumber: 7841500, timestamp: Date.now() - 86400*3*1000, actor: '0x1234...5678', target: '0xabcd...ef01', amountEncrypted: false },
  { id: '4', type: 'ScheduleCreated',    txHash: '0xabc4', blockNumber: 7841700, timestamp: Date.now() - 86400*2*1000, actor: '0x1234...5678', target: '0xdead...beef', amountEncrypted: true },
  { id: '5', type: 'InvoiceDisputed',    txHash: '0xabc5', blockNumber: 7841900, timestamp: Date.now() - 86400*1*1000, actor: '0xabcd...ef01', amountEncrypted: true },
  { id: '6', type: 'InvoiceAutoResolved',txHash: '0xabc6', blockNumber: 7842100, timestamp: Date.now() - 3600*2*1000,  actor: '0x0000...0000', amountEncrypted: true, penaltyApplied: true },
  { id: '7', type: 'TokensReleased',     txHash: '0xabc7', blockNumber: 7842300, timestamp: Date.now() - 3600*1*1000,  actor: '0xdead...beef', amountEncrypted: true },
]

const eventConfig: Record<EventType, { icon: string; label: string; color: string }> = {
  InvoiceCreated:      { icon: '📄', label: 'Invoice Created',       color: 'text-blue-400' },
  InvoicePaid:         { icon: '✅', label: 'Invoice Paid',           color: 'text-brand' },
  InvoiceDisputed:     { icon: '⚠️', label: 'Invoice Disputed',       color: 'text-orange-400' },
  InvoiceAutoResolved: { icon: '⚖️', label: 'Auto-Resolved',          color: 'text-purple-400' },
  PayrollDeposit:      { icon: '💼', label: 'Payroll Deposited',      color: 'text-emerald-400' },
  EmployeePaid:        { icon: '💸', label: 'Employee Paid',          color: 'text-brand' },
  CredentialIssued:    { icon: '🏆', label: 'Credential Issued',      color: 'text-yellow-400' },
  ScheduleCreated:     { icon: '🔐', label: 'Vesting Schedule',       color: 'text-purple-400' },
  TokensReleased:      { icon: '🪙', label: 'Tokens Released',        color: 'text-emerald-400' },
  InvoiceErased:       { icon: '🗑️', label: 'Invoice Erased (GDPR)',  color: 'text-zinc-500' },
  ScheduleErased:      { icon: '🗑️', label: 'Schedule Erased (GDPR)', color: 'text-zinc-500' },
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (days > 0)  return days  + 'd ago'
  if (hours > 0) return hours + 'h ago'
  return mins + 'm ago'
}

const FILTER_OPTIONS = ['All', 'Invoices', 'Payroll', 'Vesting', 'Reputation', 'GDPR']

function matchesFilter(event: AuditEvent, filter: string): boolean {
  if (filter === 'All')        return true
  if (filter === 'Invoices')   return event.type.startsWith('Invoice')
  if (filter === 'Payroll')    return event.type.startsWith('Payroll') || event.type === 'EmployeePaid'
  if (filter === 'Vesting')    return event.type === 'ScheduleCreated' || event.type === 'TokensReleased'
  if (filter === 'Reputation') return event.type === 'CredentialIssued'
  if (filter === 'GDPR')       return event.type === 'InvoiceErased' || event.type === 'ScheduleErased'
  return true
}

export default function HistoryPage() {
  const [filter, setFilter] = useState('All')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filtered = MOCK_EVENTS.filter(e => matchesFilter(e, filter)).reverse()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(r => setTimeout(r, 800))
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Encrypted Audit Trail</h1>
            <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full">
              GDPR Compliant
            </span>
          </div>
          <p className="text-zinc-400 text-sm">
            Every on-chain action — timestamps visible, amounts FHE-encrypted.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className={'w-4 h-4 ' + (isRefreshing ? 'animate-spin' : '')} />
          Refresh
        </button>
      </div>

      {/* Privacy banner */}
      <div className="bg-purple-900/10 border border-purple-700/30 rounded-xl p-4 mb-6 flex items-center gap-3">
        <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
        <div className="text-sm">
          <span className="text-purple-300 font-medium">Privacy-first audit trail: </span>
          <span className="text-zinc-400">
            Transaction hashes and timestamps are public. All payment amounts are FHE-encrypted
            on fhEVM — only parties with ACL access can decrypt their own data.
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={'px-3 py-1.5 rounded-lg text-xs border transition-colors ' +
              (filter === f
                ? 'bg-zinc-800 border-zinc-700 text-white font-medium'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white')}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500 text-sm">
            No events matching filter &ldquo;{filter}&rdquo;
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filtered.map(event => {
              const cfg = eventConfig[event.type]
              return (
                <div key={event.id} className="flex items-center px-6 py-4 hover:bg-zinc-800/40 transition-colors group">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-base flex-shrink-0">
                    {cfg.icon}
                  </div>

                  {/* Event info */}
                  <div className="flex-1 ml-4 min-w-0">
                    <div className={'text-sm font-medium ' + cfg.color}>{cfg.label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5 font-mono">
                      From: {event.actor}
                      {event.target && <span> → {event.target}</span>}
                    </div>
                  </div>

                  {/* Amount placeholder */}
                  <div className="mx-6 text-right">
                    {event.amountEncrypted ? (
                      <div>
                        <div className="text-xs font-mono text-zinc-600 blur-[3px] select-none">$••,•••</div>
                        <div className="text-[10px] text-purple-400 mt-0.5">🔐 FHE-encrypted</div>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500">—</div>
                    )}
                  </div>

                  {/* Penalty badge */}
                  {event.penaltyApplied && (
                    <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full mr-3">
                      +penalty
                    </span>
                  )}

                  {/* Block + time */}
                  <div className="text-right text-xs text-zinc-500 flex-shrink-0 w-28">
                    <div className="font-mono">#{event.blockNumber.toLocaleString()}</div>
                    <div>{timeAgo(event.timestamp)}</div>
                  </div>

                  {/* Etherscan link */}
                  <a
                    href={'https://sepolia.etherscan.io/tx/' + event.txHash}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300" />
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-xs text-zinc-500">Total Events</div>
          <div className="text-lg font-bold text-white mt-1">{MOCK_EVENTS.length}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-xs text-zinc-500">Encrypted Amounts</div>
          <div className="text-lg font-bold text-purple-400 mt-1">
            {MOCK_EVENTS.filter(e => e.amountEncrypted).length}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-xs text-zinc-500">GDPR Erased</div>
          <div className="text-lg font-bold text-zinc-500 mt-1">
            {MOCK_EVENTS.filter(e => e.erased).length}
          </div>
        </div>
      </div>
    </div>
  )
}
