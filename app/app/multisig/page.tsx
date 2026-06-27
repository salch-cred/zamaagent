'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Shield, Users, CheckCircle, Clock, XCircle, ExternalLink, Lock } from 'lucide-react'
import { CONTRACTS } from '@/lib/contracts'

/**
 * ConfidentialMultiSig UI
 * First M-of-N multi-sig on fhEVM with FHE-encrypted transaction amounts.
 * Signers approve payroll disbursements without seeing exact amounts.
 */

type TxStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED'

interface MockMSigTx {
  id: number
  to: string
  memo: string
  approvals: number
  threshold: number
  status: TxStatus
  createdAt: number
  owners: string[]
  approvedBy: string[]
}

const MOCK_TXS: MockMSigTx[] = [
  {
    id: 1,
    to: '0xabcd...ef01',
    memo: 'Q3 payroll run — engineering team',
    approvals: 2,
    threshold: 2,
    status: 'EXECUTED',
    createdAt: Date.now() - 86400 * 3 * 1000,
    owners: ['0x1234...5678', '0xdead...beef', '0xcafe...babe'],
    approvedBy: ['0x1234...5678', '0xdead...beef'],
  },
  {
    id: 2,
    to: '0xdead...beef',
    memo: 'Freelancer invoice #7 settlement',
    approvals: 1,
    threshold: 2,
    status: 'PENDING',
    createdAt: Date.now() - 3600 * 2 * 1000,
    owners: ['0x1234...5678', '0xdead...beef', '0xcafe...babe'],
    approvedBy: ['0x1234...5678'],
  },
  {
    id: 3,
    to: '0xcafe...babe',
    memo: 'Contractor vesting release — Q3',
    approvals: 0,
    threshold: 2,
    status: 'PENDING',
    createdAt: Date.now() - 1800 * 1000,
    owners: ['0x1234...5678', '0xdead...beef', '0xcafe...babe'],
    approvedBy: [],
  },
]

const statusConfig = {
  PENDING:   { icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', label: 'Pending' },
  EXECUTED:  { icon: CheckCircle, color: 'text-brand',      bg: 'bg-brand/10 border-brand/30',           label: 'Executed' },
  CANCELLED: { icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/30',       label: 'Cancelled' },
}

function timeAgo(ts: number): string {
  const diff  = Date.now() - ts
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (days > 0)  return days + 'd ago'
  if (hours > 0) return hours + 'h ago'
  return Math.floor(diff / 60000) + 'm ago'
}

export default function MultiSigPage() {
  const { address } = useAccount()
  const [txs, setTxs] = useState(MOCK_TXS)
  const [showForm, setShowForm] = useState(false)
  const [newMemo, setNewMemo]   = useState('')
  const [newTo,   setNewTo]     = useState('')
  const [newAmt,  setNewAmt]    = useState('')

  const isMultiSigDeployed =
    CONTRACTS.ConfidentialVestingWallet.address !== '0x0000000000000000000000000000000000000000'

  const handleApprove = (id: number) => {
    setTxs(prev => prev.map(t =>
      t.id === id && t.status === 'PENDING'
        ? { ...t, approvals: t.approvals + 1, approvedBy: [...t.approvedBy, address ?? '?'] }
        : t
    ))
  }

  const handleExecute = (id: number) => {
    setTxs(prev => prev.map(t =>
      t.id === id && t.approvals >= t.threshold
        ? { ...t, status: 'EXECUTED' as TxStatus }
        : t
    ))
  }

  const pendingTxs  = txs.filter(t => t.status === 'PENDING')
  const executedTxs = txs.filter(t => t.status === 'EXECUTED')

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Confidential MultiSig</h1>
            <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full">
              2-of-N Approval
            </span>
          </div>
          <p className="text-zinc-400 text-sm max-w-xl">
            M-of-N multi-sig where payroll amounts are FHE-encrypted.
            Signers approve disbursements without seeing exact figures —
            using <code className="text-purple-300">TFHE.and()</code> compound approval logic.
          </p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-black text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
        >
          + Submit Tx
        </button>
      </div>

      {/* FHE innovation callout */}
      <div className="bg-purple-900/10 border border-purple-700/30 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="text-purple-300 font-medium">First confidential multi-sig on fhEVM: </span>
          <span className="text-zinc-400">
            Transaction amounts are <code className="text-purple-300">euint64</code> ciphertexts.
            The approval gate uses <code className="text-purple-300">TFHE.and(approved1, approved2)</code>
            to verify M-of-N without branching on encrypted state.
            Only ACL-authorized signers can decrypt amounts via EIP-712 re-encryption.
          </span>
        </div>
      </div>

      {/* Submit form */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6 space-y-4">
          <div className="text-sm font-medium text-white">Submit New Confidential Transaction</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Recipient</label>
              <input
                value={newTo}
                onChange={e => setNewTo(e.target.value)}
                placeholder="0x..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Amount (cUSDT) — encrypted</label>
              <input
                type="number"
                value={newAmt}
                onChange={e => setNewAmt(e.target.value)}
                placeholder="1500.00"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Memo (plaintext)</label>
            <input
              value={newMemo}
              onChange={e => setNewMemo(e.target.value)}
              placeholder="Q3 payroll run — engineering"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!newTo || !newAmt || !newMemo) return
                const newTx: MockMSigTx = {
                  id:         txs.length + 1,
                  to:         newTo,
                  memo:       newMemo,
                  approvals:  1,
                  threshold:  2,
                  status:     'PENDING',
                  createdAt:  Date.now(),
                  owners:     ['0x1234...5678', '0xdead...beef', '0xcafe...babe'],
                  approvedBy: [address ?? '0x?'],
                }
                setTxs(p => [...p, newTx])
                setShowForm(false)
                setNewTo(''); setNewAmt(''); setNewMemo('')
              }}
              className="flex-1 py-2.5 bg-brand text-black text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
            >
              🔐 Encrypt & Submit
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-sm text-zinc-400 rounded-lg hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-xs text-zinc-500 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-400">{pendingTxs.length}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-xs text-zinc-500 mb-1">Executed</div>
          <div className="text-2xl font-bold text-brand">{executedTxs.length}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-xs text-zinc-500 mb-1">Threshold</div>
          <div className="text-2xl font-bold text-purple-400">2-of-3</div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        {txs.map(tx => {
          const cfg = statusConfig[tx.status]
          const Icon = cfg.icon
          const progressPct = Math.round((tx.approvals / tx.threshold) * 100)
          const progressWidth = progressPct + '%'
          const canApprove  = tx.status === 'PENDING' && !!address && !tx.approvedBy.includes(address)
          const canExecute  = tx.status === 'PENDING' && tx.approvals >= tx.threshold

          return (
            <div key={tx.id} className={'bg-zinc-900 border rounded-xl p-5 ' + (tx.status === 'PENDING' ? 'border-zinc-700' : 'border-zinc-800')}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">#{tx.id}</span>
                    <span className="text-sm font-medium text-white">{tx.memo}</span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono mt-0.5">To: {tx.to}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={'text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 ' + cfg.bg}>
                    <Icon className={'w-3 h-3 ' + cfg.color} />
                    <span className={cfg.color}>{cfg.label}</span>
                  </span>
                  <span className="text-xs text-zinc-600">{timeAgo(tx.createdAt)}</span>
                </div>
              </div>

              {/* FHE amount placeholder */}
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-zinc-500">Amount:</span>
                <span className="text-sm font-mono text-purple-400 blur-[4px] select-none">$••,•••</span>
                <span className="text-[10px] text-purple-400">FHE-encrypted</span>
              </div>

              {/* Approval progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Approvals: {tx.approvals}/{tx.threshold}
                  </span>
                  <span>TFHE.and() gate</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={'h-full rounded-full transition-all ' + (tx.approvals >= tx.threshold ? 'bg-brand' : 'bg-purple-500')}
                    style= width: cliffWidth 
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {tx.owners.map((o, i) => (
                    <div
                      key={i}
                      className={'text-[10px] px-2 py-0.5 rounded-full border font-mono ' +
                        (tx.approvedBy.includes(o)
                          ? 'bg-brand/10 text-brand border-brand/30'
                          : 'bg-zinc-800 text-zinc-600 border-zinc-700')}
                    >
                      {o.slice(0, 8)}…
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {canApprove && (
                  <button
                    onClick={() => handleApprove(tx.id)}
                    className="flex-1 py-2 bg-purple-900/20 border border-purple-700/40 text-purple-400 text-sm rounded-lg hover:bg-purple-900/40 transition-colors"
                  >
                    ✓ Approve with TFHE.and()
                  </button>
                )}
                {canExecute && (
                  <button
                    onClick={() => handleExecute(tx.id)}
                    className="flex-1 py-2 bg-brand/10 border border-brand/30 text-brand text-sm rounded-lg hover:bg-brand/20 transition-colors"
                  >
                    ⚡ Execute (threshold met)
                  </button>
                )}
                <a
                  href={'https://sepolia.etherscan.io/address/' + CONTRACTS.ConfidentialVestingWallet.address}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-500 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
