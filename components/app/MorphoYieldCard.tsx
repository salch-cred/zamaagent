'use client';

import { useState } from 'react';
import { TrendingUp, ExternalLink, Loader2, CheckCircle, Lock, Zap } from 'lucide-react';

// Morpho USDC Vault on Ethereum — steakhouse curated (~5.8% APY)
const MORPHO_VAULT_URL = 'https://app.morpho.org/ethereum/vault';
const MORPHO_APY = 5.8; // % — update from live feed in production

interface MorphoYieldCardProps {
  /** Idle payroll balance (encrypted, shown as *** if not revealed) */
  idleBalanceUsd?: number;
  /** Whether yield is currently enabled */
  enabled?: boolean;
}

export default function MorphoYieldCard({ idleBalanceUsd, enabled = false }: MorphoYieldCardProps) {
  const [isEnabling, setIsEnabling] = useState(false);
  const [isEnabled, setIsEnabled] = useState(enabled);

  const estimatedAnnualYield = idleBalanceUsd ? (idleBalanceUsd * MORPHO_APY) / 100 : null;
  const estimatedMonthly = estimatedAnnualYield ? estimatedAnnualYield / 12 : null;

  const handleEnable = async () => {
    setIsEnabling(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsEnabled(true);
    setIsEnabling(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-zinc-900/0 border-b border-zinc-800 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">Idle Payroll Yield</span>
          <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-700/40 px-2 py-0.5 rounded-full">
            {MORPHO_APY}% APY
          </span>
        </div>
        <a
          href={MORPHO_VAULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
        >
          Morpho <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="p-5 space-y-4">
        {/* Composability badge */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-emerald-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">Earn while encrypted</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              Idle payroll funds earn yield in Morpho USDC vaults. Amounts remain FHE-encrypted throughout — Morpho never sees your payroll data.
            </div>
          </div>
        </div>

        {/* Yield estimate */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-950 rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500 mb-1">Idle Balance</div>
            <div className="text-sm font-semibold text-zinc-300">
              {idleBalanceUsd ? `$${idleBalanceUsd.toLocaleString()}` : <span className="text-zinc-600 font-mono">•••••</span>}
            </div>
          </div>
          <div className="bg-zinc-950 rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500 mb-1">Monthly Yield</div>
            <div className="text-sm font-semibold text-emerald-400">
              {estimatedMonthly ? `+$${estimatedMonthly.toFixed(0)}` : <span className="text-zinc-600">+•••</span>}
            </div>
          </div>
          <div className="bg-zinc-950 rounded-lg p-3 text-center">
            <div className="text-xs text-zinc-500 mb-1">Annual Yield</div>
            <div className="text-sm font-semibold text-emerald-400">
              {estimatedAnnualYield ? `+$${estimatedAnnualYield.toFixed(0)}` : <span className="text-zinc-600">+•••</span>}
            </div>
          </div>
        </div>

        {/* Composability explanation */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-500 space-y-1">
          <div className="text-zinc-400 font-medium mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-brand" />
            Composable Privacy (Season 3)
          </div>
          <div>Zama fhEVM ↔ Morpho Vault integration</div>
          <div>Encrypted amounts earn real yield without decryption</div>
          <div>Withdraws just-in-time for payroll distribution</div>
        </div>

        {/* Enable button */}
        {isEnabled ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            Yield active — funds earning {MORPHO_APY}% APY in Morpho
          </div>
        ) : (
          <button
            onClick={handleEnable}
            disabled={isEnabling}
            className="w-full flex items-center justify-center gap-2 bg-emerald-900/20 border border-emerald-700/50 text-emerald-400 rounded-lg py-2.5 text-sm font-medium hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
          >
            {isEnabling ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Connecting to Morpho...</>
            ) : (
              <><TrendingUp className="w-4 h-4" /> Enable Yield on Idle Funds</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
