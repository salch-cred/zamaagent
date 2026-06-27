'use client'
import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EncryptedAmount } from '@/components/app/EncryptedAmount'
import { CONTRACTS, PAYROLL_ABI, isConfigured } from '@/lib/contracts'
import { encryptAmount } from '@/lib/fhevm'
import { isAddress } from 'viem'

function handleToHex(h: bigint): `0x${string}` {
  return ('0x' + h.toString(16).padStart(64, '0')) as `0x${string}`
}

export default function PayoutsPage() {
  const { address } = useAccount()
  const configured  = isConfigured()
  const liveEnabled = configured && !!address

  const [amount, setAmount]     = useState('')
  const [dest,   setDest]       = useState('')
  const [error,  setError]      = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  // ── Read encrypted balance ─────────────────────────────────────────────────
  const { data: balanceRaw, error: balanceError } = useReadContract({
    address: CONTRACTS.ConfidentialPayroll.address,
    abi:     PAYROLL_ABI,
    functionName: 'getMyBalance',
    query: { enabled: liveEnabled },
  })

  const isEmployeeOnChain = liveEnabled && !balanceError
  const balanceHandle     = isEmployeeOnChain && balanceRaw !== undefined
    ? handleToHex(balanceRaw as bigint)
    : undefined

  // ── Write: requestWithdrawal ──────────────────────────────────────────────
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash })

  const destValid   = dest === '' || isAddress(dest)
  const amountValid = amount !== '' && parseFloat(amount) > 0
  const formReady   = amountValid && !!address

  const handleWithdraw = async () => {
    if (!address) return
    setError(null)
    setSuccess(false)

    try {
      const amountMicro = Math.round(parseFloat(amount) * 1_000_000)

      if (!isConfigured()) {
        // Dev mode: simulate
        await new Promise(r => setTimeout(r, 1200))
        setSuccess(true)
        return
      }

      const { handle, inputProof } = await encryptAmount(
        amountMicro,
        CONTRACTS.ConfidentialPayroll.address,
        address
      )

      const hash = await writeContractAsync({
        address:      CONTRACTS.ConfidentialPayroll.address,
        abi:          PAYROLL_ABI,
        functionName: 'requestWithdrawal',
        args:         [handle, inputProof],
      })
      setTxHash(hash)
      setSuccess(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
    }
  }

  const isLoading = isWritePending || isConfirming

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Payouts</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Withdraw your encrypted cUSDT balance via x402 rail. Amount stays FHE-encrypted.
        </p>
      </div>

      {/* Balance card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6 flex items-start justify-between">
        <div>
          <div className="text-sm text-zinc-500 mb-3 uppercase tracking-wide">Available to Withdraw</div>
          {liveEnabled && balanceError ? (
            <div>
              <p className="text-zinc-400 text-sm">Not registered as an employee.</p>
              <p className="text-zinc-600 text-xs mt-1">Ask your employer to add your wallet.</p>
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
        <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          ⚡ x402 Rails
        </span>
      </div>

      {/* Withdraw form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Withdraw</h3>
        <div className="space-y-4">

          {/* Optional destination address */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Destination Address <span className="text-zinc-600">(optional — defaults to your wallet)</span>
            </label>
            <input
              type="text"
              value={dest}
              onChange={e => setDest(e.target.value)}
              placeholder="0x... or leave blank for connected wallet"
              className={'w-full bg-zinc-950 border rounded-xl px-4 py-3 text-white placeholder-zinc-600 font-mono text-sm focus:outline-none transition-colors ' +
                (dest && !destValid
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-zinc-700 focus:border-brand')}
            />
            {dest && !destValid && (
              <p className="text-xs text-red-400 mt-1">Invalid Ethereum address</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Amount (cUSDT)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 pr-20 text-white placeholder-zinc-600 font-mono text-sm focus:outline-none focus:border-brand transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">cUSDT</span>
            </div>
            <p className="text-xs text-zinc-600 mt-1">
              🔐 Amount encrypted via fhEVM before broadcast — not visible on Etherscan
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="bg-brand/10 border border-brand/30 rounded-xl px-4 py-3 text-brand text-sm">
              ✅ Withdrawal requested! x402 rail will process your transfer.
              {txHash && (
                <a
                  href={'https://sepolia.etherscan.io/tx/' + txHash}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-zinc-400 hover:text-white mt-1 font-mono"
                >
                  Tx: {txHash.slice(0, 20)}...
                </a>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleWithdraw}
            disabled={!formReady || isLoading || success}
            className={'w-full py-4 font-semibold rounded-xl text-sm transition-all ' +
              (formReady && !isLoading && !success
                ? 'bg-brand hover:bg-brand-dark text-black hover:shadow-glow-green cursor-pointer'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed')}
          >
            {isLoading
              ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">↻</span> Encrypting & submitting...</span>
              : '⚡ Withdraw via x402 →'
            }
          </button>

          {!address && (
            <p className="text-center text-xs text-zinc-600">Connect your wallet to withdraw</p>
          )}
        </div>
      </div>
    </div>
  )
}
