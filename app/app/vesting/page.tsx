'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Clock, Lock, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { CONTRACTS, VESTING_ABI } from '@/lib/contracts'

/**
 * Confidential Vesting Schedule UI
 * View and claim from ConfidentialVestingWallet — cliff + linear vesting
 * with FHE-encrypted total amounts.
 */

interface MockSchedule {
  id: number
  employer: string
  beneficiary: string
  startTime: number
  cliffDuration: number
  vestingDuration: number
  revocable: boolean
  revoked: boolean
  erased: boolean
  label: string
}

const MOCK_SCHEDULES: MockSchedule[] = [
  {
    id: 1,
    employer: '0x1234...5678',
    beneficiary: '0xabcd...ef01',
    startTime: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 90, // 90 days ago
    cliffDuration: 60 * 60 * 24 * 30,    // 30-day cliff
    vestingDuration: 60 * 60 * 24 * 365, // 1 year
    revocable: true,
    revoked: false,
    erased: false,
    label: 'Engineering Contract — Q3 2026',
  },
  {
    id: 2,
    employer: '0x1234...5678',
    beneficiary: '0xdead...beef',
    startTime: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 200,
    cliffDuration: 60 * 60 * 24 * 60,
    vestingDuration: 60 * 60 * 24 * 180,
    revocable: false,
    revoked: false,
    erased: false,
    label: 'Design Retainer — H1 2026',
  },
]

function VestingProgress({ schedule }: { schedule: MockSchedule }) {
  const now     = Math.floor(Date.now() / 1000)
  const elapsed = now - schedule.startTime
  const cliffPct   = Math.min(100, (elapsed / schedule.cliffDuration) * 100)
  const vestingPct = Math.min(100, (elapsed / schedule.vestingDuration) * 100)
  const cliffReached = elapsed >= schedule.cliffDuration

  const daysLeft = Math.max(0, Math.ceil((schedule.startTime + schedule.vestingDuration - now) / 86400))
  const daysToCliff = Math.max(0, Math.ceil((schedule.startTime + schedule.cliffDuration - now) / 86400))

  const cliffWidth = vestingPct.toFixed(1) + '%'

  return (
    <div className="space-y-3">
      {/* Cliff indicator */}
      {!cliffReached ? (
        <div className="flex items-center gap-2 text-xs text-orange-400">
          <Clock className="w-3.5 h-3.5" />
          Cliff unlocks in {daysToCliff} days
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-brand">
          <CheckCircle className="w-3.5 h-3.5" />
          Cliff reached — tokens vesting linearly
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Vested</span>
          <span>{vestingPct.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand to-emerald-400 rounded-full transition-all"
            style= width: cliffWidth 
          />
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>Start</span>
          <span>{daysLeft}d remaining</span>
        </div>
      </div>
    </div>
  )
}

export default function VestingPage() {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState<'employer' | 'beneficiary'>('beneficiary')

  const isVestingDeployed = CONTRACTS.ConfidentialVestingWallet.address !== '0x0000000000000000000000000000000000000000'

  const tabBase = 'px-4 py-2 text-sm rounded-lg transition-colors '
  const tabActive = 'bg-zinc-800 text-white font-medium'
  const tabInactive = 'text-zinc-400 hover:text-white'

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">Confidential Vesting</h1>
          <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full">
            ConfidentialVestingWallet
          </span>
        </div>
        <p className="text-zinc-400 text-sm">
          Cliff + linear vesting schedules with FHE-encrypted salary amounts.
          Uses TFHE.select for releasable computation — no plaintext exposure.
        </p>
      </div>

      {/* Contract status */}
      {!isVestingDeployed && (
        <div className="bg-yellow-900/10 border border-yellow-700/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <div className="text-sm text-yellow-300">
            Contract not deployed yet. Set <code className="text-yellow-400 bg-yellow-900/20 px-1 rounded">NEXT_PUBLIC_VESTING_ADDRESS</code> in .env.local after deploying ConfidentialVestingWallet on Sepolia.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('beneficiary')}
          className={tabBase + (activeTab === 'beneficiary' ? tabActive : tabInactive)}
        >
          🔐 My Vesting
        </button>
        <button
          onClick={() => setActiveTab('employer')}
          className={tabBase + (activeTab === 'employer' ? tabActive : tabInactive)}
        >
          💼 Created by Me
        </button>
      </div>

      {/* Schedules */}
      <div className="space-y-4">
        {MOCK_SCHEDULES.map(schedule => (
          <div
            key={schedule.id}
            className={'bg-zinc-900 border rounded-xl p-5 ' + (schedule.revoked ? 'border-red-800/40' : 'border-zinc-800')}
          >
            {/* Schedule header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-semibold text-white text-sm">{schedule.label}</div>
                <div className="text-xs text-zinc-500 font-mono mt-0.5">
                  {activeTab === 'beneficiary' ? 'From: ' + schedule.employer : 'To: ' + schedule.beneficiary}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {schedule.revoked ? (
                  <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Revoked
                  </span>
                ) : (
                  <span className="text-xs bg-brand/10 text-brand border border-brand/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                )}
                {schedule.revocable && (
                  <span className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">
                    Revocable
                  </span>
                )}
              </div>
            </div>

            {/* FHE amount */}
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-zinc-500">Total amount:</span>
              <span className="text-sm font-mono text-purple-400 blur-[4px] select-none">$••,•••</span>
              <span className="text-[10px] text-purple-400">FHE-encrypted</span>
            </div>

            {/* Vesting progress */}
            {!schedule.revoked && !schedule.erased && (
              <VestingProgress schedule={schedule} />
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              {!schedule.revoked && !schedule.erased && activeTab === 'beneficiary' && (
                <button className="flex-1 py-2 bg-brand/10 border border-brand/30 text-brand text-sm rounded-lg hover:bg-brand/20 transition-colors">
                  🪙 Claim Vested Tokens
                </button>
              )}
              {schedule.revocable && activeTab === 'employer' && !schedule.revoked && (
                <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg hover:bg-red-500/20 transition-colors">
                  Revoke
                </button>
              )}
              <a
                href={'https://sepolia.etherscan.io/address/' + CONTRACTS.ConfidentialVestingWallet.address}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
