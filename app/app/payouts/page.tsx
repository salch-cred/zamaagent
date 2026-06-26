'use client'
import { EncryptedAmount } from '@/components/app/EncryptedAmount'

// Stub page — the sidebar links here but DEV FILES 3/4 don't define it.
// Wire to a withdrawal flow on the ConfidentialPayroll contract later.
export default function PayoutsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Payouts</h2>
        <p className="text-zinc-500 text-sm mt-1">Withdraw your encrypted cUSDT balance to any wallet or bank rail.</p>
      </div>

      {/* Available balance */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6 flex items-start justify-between">
        <div>
          <div className="text-sm text-zinc-500 mb-3 uppercase tracking-wide">Available to Withdraw</div>
          <EncryptedAmount size="lg" handle={undefined} showLabel />
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          ⚡ x402 Rails
        </span>
      </div>

      {/* Withdraw form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Withdraw</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Destination Address</label>
            <input
              type="text"
              placeholder="0x... or ENS"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 font-mono text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Amount (cUSDT)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 font-mono text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <button
            disabled
            className="w-full py-4 bg-brand/40 text-black/60 font-semibold rounded-xl text-sm cursor-not-allowed"
            title="Connect contracts first (DEV FILE 5)"
          >
            ⚡ Withdraw via x402 →
          </button>
          <p className="text-center text-xs text-zinc-600">
            Payout rails activate once contracts are deployed.
          </p>
        </div>
      </div>
    </div>
  )
}
