'use client'
import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { EncryptedAmount } from '@/components/app/EncryptedAmount'
import { CONTRACTS, PAYROLL_ABI, isConfigured } from '@/lib/contracts'
import { isAddress } from 'viem'

function handleToHex(h: bigint): `0x${string}` {
  return ('0x' + h.toString(16).padStart(64, '0')) as `0x${string}`
}

export default function PayoutsPage() {
  const { address }  = useAccount()
  const configured   = isConfigured()
  const liveEnabled  = configured && !!address

  const [dest,   setDest]   = useState('')
  const [amount, setAmount] = useState('')

  const { data: balanceRaw, error: balanceError } = useReadContract({
    address: CONTRACTS.ConfidentialPayroll.address,
    abi: PAYROLL_ABI,
    functionName: 'getMyBalance',
    query: { enabled: liveEnabled },
  })

  const isEmployee    = liveEnabled && !balanceError
  const balanceHandle = isEmployee && balanceRaw !== undefined
    ? handleToHex(balanceRaw as bigint)
    : undefined

  // Validation for withdraw form (wire to contract once withdraw fn is added)
  const destValid   = dest === '' || isAddress(dest)
  const amountValid = amount === '' || (parseFloat(amount) > 0)
  const formReady   = isAddress(dest) && parseFloat(amount) > 0

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Payouts</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Withdraw your encrypted cUSDT balance to any wallet or bank rail.
        </p>
      </div>

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

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Withdraw</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Destination Address</label>
            <input
              type="text"
              value={dest}
              onChange={e => setDest(e.target.value)}
              placeholder="0x... or ENS"
              className={'w-full bg-zinc-950 border rounded-xl px-4 py-3 text-white placeholder-zinc-600 font-mono text-sm focus:outline-none transition-colors ' +
                (dest && !destValid ? 'border-red-500 focus:border-red-500' : 'border-zinc-700 focus:border-brand')}
            />
            {dest && !destValid && (
              <p className="text-xs text-red-400 mt-1">Invalid Ethereum address</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Amount (cUSDT)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 font-mono text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <button
            disabled
            className={'w-full py-4 font-semibold rounded-xl text-sm cursor-not-allowed ' +
              (formReady && isEmployee
                ? 'bg-brand/40 text-black/60'
                : 'bg-zinc-800 text-zinc-600')}
            title="Withdraw function coming in next contract version"
          >
            ⚡ Withdraw via x402 →
          </button>
          <p className="text-center text-xs text-zinc-600">
            On-chain withdrawal is live once the x402 payout rail is wired to the contract.
          </p>
        </div>
      </div>
    </div>
  )
}
