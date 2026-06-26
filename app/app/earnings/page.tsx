'use client'
import { EncryptedAmount } from '@/components/app/EncryptedAmount'

export default function EarningsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Earnings</h2>
        <p className="text-zinc-500 text-sm mt-1">Your financial data is FHE-encrypted on Ethereum. Click Reveal to decrypt locally.</p>
      </div>

      {/* Main balance card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-zinc-500 mb-3 uppercase tracking-wide">Total Lifetime Earnings</div>
            <EncryptedAmount size="lg" handle={undefined} showLabel />
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            🔐 FHE Encrypted on Ethereum
          </span>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'This Month',   handle: undefined },
          { label: 'Last Month',   handle: undefined },
          { label: 'Yield Earned', handle: undefined },
        ].map(card => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">{card.label}</div>
            <EncryptedAmount size="sm" handle={card.handle} />
          </div>
        ))}
      </div>

      {/* Info callout */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-start gap-3">
        <span className="text-purple-400 text-xl">🔐</span>
        <div>
          <div className="text-sm font-medium text-white mb-1">How FHE Encryption Works</div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your earnings are stored as encrypted integers (euint64) on Ethereum&apos;s blockchain.
            Nobody — not Etherscan, not PayMate, not even miners — can read the raw amount.
            When you click &quot;Reveal&quot;, MetaMask signs an EIP-712 request that decrypts the data
            locally in your browser using your private key. The decrypted amount never touches
            the blockchain or any server.
          </p>
        </div>
      </div>
    </div>
  )
}
