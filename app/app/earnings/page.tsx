'use client'
import { useAccount, useReadContract } from 'wagmi'
import { EncryptedAmount } from '@/components/app/EncryptedAmount'
import { CONTRACTS, PAYROLL_ABI, isConfigured } from '@/lib/contracts'

function handleToHex(h: bigint): `0x${string}` {
  return ('0x' + h.toString(16).padStart(64, '0')) as `0x${string}`
}

export default function EarningsPage() {
  const { address }  = useAccount()
  const configured   = isConfigured()
  const liveEnabled  = configured && !!address

  // getMyBalance() reverts if called by non-employee — wagmi returns error gracefully
  const { data: balanceRaw, error: balanceError } = useReadContract({
    address: CONTRACTS.ConfidentialPayroll.address,
    abi: PAYROLL_ABI,
    functionName: 'getMyBalance',
    query: { enabled: liveEnabled },
  })

  const isEmployee = liveEnabled && !balanceError
  const balanceHandle = isEmployee && balanceRaw !== undefined
    ? handleToHex(balanceRaw as bigint)
    : undefined

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Earnings</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Your financial data is FHE-encrypted on Ethereum. Click Reveal to decrypt locally.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-zinc-500 mb-3 uppercase tracking-wide">Total Lifetime Earnings</div>
            {liveEnabled && balanceError ? (
              <div>
                <p className="text-zinc-400 text-sm">Not registered as an employee yet.</p>
                <p className="text-zinc-600 text-xs mt-1">
                  Ask your employer to call addEmployee with your wallet address.
                </p>
              </div>
            ) : (
              <EncryptedAmount
                size="lg"
                handle={balanceHandle}
                showLabel
                contractAddress={CONTRACTS.ConfidentialPayroll.address}
              />
            )}
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            🔐 FHE Encrypted on Ethereum
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'This Month' },
          { label: 'Last Month' },
          { label: 'Yield Earned' },
        ].map(card => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">{card.label}</div>
            <EncryptedAmount size="sm" handle={undefined} />
          </div>
        ))}
      </div>

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
