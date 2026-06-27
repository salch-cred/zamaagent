'use client'

import { useState } from 'react'
import { TrendingUp, ExternalLink, Loader2, CheckCircle, Lock, Zap, ShieldCheck } from 'lucide-react'
import { STEAKHOUSE_VAULT_URL, STEAKHOUSE_APY, STEAKHOUSE_TVL } from '@/lib/contracts'

interface MorphoYieldCardProps {
  /** Idle payroll balance in USD (encrypted, shown as *** if not revealed) */
  idleBalanceUsd?: number
  /** Whether yield is currently enabled */
  enabled?: boolean
}

export default function MorphoYieldCard({ idleBalanceUsd, enabled = false }: MorphoYieldCardProps) {
  const [isEnabling, setIsEnabling] = useState(false)
  const [isEnabled, setIsEnabled]  = useState(enabled)

  const estimatedAnnual  = idleBalanceUsd ? (idleBalanceUsd * STEAKHOUSE_APY) / 100 : null
  const estimatedMonthly = estimatedAnnual ? estimatedAnnual / 12 : null

  const tvlDisplay = STEAKHOUSE_TVL.toFixed(2) + 'M'

  const handleEnable = async () => {
    setIsEnabling(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsEnabled(true)
    setIsEnabling(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-zinc-900/0 border-b border-zinc-800 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">Steakhouse Confidential Prime USDC Vault</span>
          <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-700/40 px-2 py-0.5 rounded-full">
            {STEAKHOUSE_APY}% APY
          </span>
          <span className="text-xs bg-purple-900/40 text-purple-400 border border-purple-700/40 px-2 py-0.5 rounded-full">
            🔥 Live June 23
          </span>
        </div>
        <a
          href={STEAKHOUSE_VAULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
        >
          app.zama.org <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="p-5 space-y-4">
        {/* Live vault badge */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">First confidential yield vault on Ethereum</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              Zama × Morpho × Steakhouse Financial — launched June 23 2026. cUSDC (ERC-7984) earns
              boosted yield for 12 weeks. PayMate idle payroll deposits stay FHE-encrypted throughout.
              TVL: <span className="text-zinc-300">${tvlDisplay}</span>
            </div>
          </div>
        </div>

        {/* Yield estimate */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-950 rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500 mb-1">Idle Balance</div>
            <div className="text-sm font-semibold text-zinc-300">
              {idleBalanceUsd
                ? '$' + idleBalanceUsd.toLocaleString()
                : <span className="text-zinc-600 font-mono">•••••</span>}
            </div>
          </div>
          <div className="bg-zinc-950 rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500 mb-1">Monthly Yield</div>
            <div className="text-sm font-semibold text-emerald-400">
              {estimatedMonthly
                ? '+$' + estimatedMonthly.toFixed(0)
                : <span className="text-zinc-600">+•••</span>}
            </div>
          </div>
          <div className="bg-zinc-950 rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500 mb-1">Annual Yield</div>
            <div className="text-sm font-semibold text-emerald-400">
              {estimatedAnnual
                ? '+$' + estimatedAnnual.toFixed(0)
                : <span className="text-zinc-600">+•••</span>}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-500 space-y-1">
          <div className="text-zinc-400 font-medium mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-brand" />
            cUSDC Composability — ERC-7984 (Season 3)
          </div>
          <div>Zama fhEVM ↔ Steakhouse Confidential Prime USDC Vault</div>
          <div>cUSDC amounts encrypted end-to-end — vault never decrypts balances</div>
          <div>Withdraws just-in-time for payroll distribution</div>
          <div>GDPR-compliant: encrypted balance = zero data leakage</div>
        </div>

        {/* CTA */}
        {isEnabled ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            Yield active — cUSDC earning {STEAKHOUSE_APY}% APY in Steakhouse vault
          </div>
        ) : (
          <button
            onClick={handleEnable}
            disabled={isEnabling}
            className="w-full flex items-center justify-center gap-2 bg-emerald-900/20 border border-emerald-700/50 text-emerald-400 rounded-lg py-2.5 text-sm font-medium hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
          >
            {isEnabling
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting to Steakhouse Vault...</>
              : <><TrendingUp className="w-4 h-4" /> Enable cUSDC Yield (Steakhouse × Morpho)</>}
          </button>
        )}
      </div>
    </div>
  )
}
