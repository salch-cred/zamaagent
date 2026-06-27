'use client'
import { useAccount, useReadContract } from 'wagmi'
import { EncryptedAmount } from '@/components/app/EncryptedAmount'
import ReencryptButton from '@/components/app/ReencryptButton'
import MorphoYieldCard from '@/components/app/MorphoYieldCard'
import { CONTRACTS, PAYROLL_ABI, isConfigured } from '@/lib/contracts'

function handleToHex(h: bigint): `0x${string}` {
  return ('0x' + h.toString(16).padStart(64, '0')) as `0x${string}`
}

export default function EarningsPage() {
  const { address }  = useAccount()
  const configured   = isConfigured()
  const liveEnabled  = configured && !!address

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

  const handleBigInt = balanceHandle ? BigInt(balanceHandle) : undefined

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white">Earnings</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Your financial data is FHE-encrypted on Ethereum. Only you can decrypt it.
        </p>
      </div>

      {/* Main balance card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="text-sm text-zinc-500 uppercase tracking-wide">Total Lifetime Earnings</div>

            {liveEnabled && balanceError ? (
              <div>
                <p className="text-zinc-400 text-sm">Not registered as an employee yet.</p>
                <p className="text-zinc-600 text-xs mt-1">
                  Ask your employer to call addEmployee with your wallet address.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <EncryptedAmount
                  size="lg"
                  handle={balanceHandle}
                  showLabel
                  contractAddress={CONTRACTS.ConfidentialPayroll.address}
                />
                {/* Re-encryption button — full KMS flow */}
                <div className="flex items-center gap-3">
                  <ReencryptButton
                    handle={handleBigInt}
                    contractAddress={CONTRACTS.ConfidentialPayroll.address}
                    label="balance"
                  />
                  <span className="text-xs text-zinc-600">Decrypts locally — never leaves your browser</span>
                </div>
              </div>
            )}
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            🔐 FHE Encrypted on Ethereum
          </span>
        </div>
      </div>

      {/* Stats + Morpho */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          {[
            { label: 'This Month', handle: undefined },
            { label: 'Last Month', handle: undefined },
            { label: 'Yield Earned', handle: undefined },
          ].map(card => (
            <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">{card.label}</div>
              <EncryptedAmount size="sm" handle={card.handle} />
            </div>
          ))}
        </div>

        {/* Morpho inline */}
        <div className="lg:col-span-1">
          <MorphoYieldCard />
        </div>
      </div>

      {/* Re-encryption explainer */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-purple-400 text-lg">🔐</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-2">How Re-encryption Works</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-zinc-400">
              <div>1. Your wallet generates a one-time keypair</div>
              <div>2. You sign an EIP-712 permit for the KMS</div>
              <div>3. KMS Gateway re-encrypts for your key only</div>
              <div>4. Your browser decrypts — no server involved</div>
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              The ciphertext on Ethereum never changes. Only you can produce the EIP-712 signature
              required to re-encrypt it for your specific keypair. Your employer, PayMate, and
              Etherscan all see only encrypted bytes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
