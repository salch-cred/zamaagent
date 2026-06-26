'use client'
import { useState } from 'react'
import { decryptMyBalance } from '@/lib/fhevm'
import { useAccount } from 'wagmi'
import { CONTRACTS } from '@/lib/contracts'

interface Props {
  handle?: `0x${string}`
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  // Which contract holds the ACL for this handle.
  // Defaults to ConfidentialPayroll (for balance reads).
  // Pass ConfidentialInvoice.address for invoice amount decryption.
  contractAddress?: `0x${string}`
}

export function EncryptedAmount({ handle, size = 'md', showLabel = true, contractAddress }: Props) {
  const { address } = useAccount()
  const [revealed, setRevealed] = useState(false)
  const [amount,   setAmount]   = useState<bigint | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const resolvedContract = contractAddress ?? CONTRACTS.ConfidentialPayroll.address
  const textSize = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-base'

  const handleReveal = async () => {
    if (!handle || !address) return
    setLoading(true)
    setError(null)
    try {
      const result = await decryptMyBalance(handle, resolvedContract, address)
      setAmount(result)
      setRevealed(true)
    } catch {
      setError('Decryption failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!handle) {
    return (
      <div>
        <span className={'font-mono font-bold text-zinc-600 ' + textSize}>•••••</span>
        {showLabel && <span className="text-zinc-500 text-sm ml-2">cUSDT</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <span
          className={'font-mono font-bold transition-all duration-500 ' +
            (revealed ? 'text-white' : 'text-zinc-400 blur-[5px] select-none') +
            ' ' + textSize}
        >
          {revealed && amount !== null
            ? Number(amount / BigInt(1_000_000)).toLocaleString()
            : '•••••'}
        </span>
        {showLabel && <span className="text-zinc-500 text-sm">cUSDT</span>}
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          🔐 FHE
        </span>
      </div>

      {!revealed && (
        <button
          onClick={handleReveal}
          disabled={loading}
          className="text-xs text-brand hover:text-brand-dark transition-colors flex items-center gap-1 disabled:opacity-50 mt-1"
        >
          {loading
            ? <><span className="animate-spin">↻</span> Signing with MetaMask...</>
            : <>🔓 Reveal my balance</>}
        </button>
      )}

      {revealed && (
        <button
          onClick={() => { setRevealed(false); setAmount(null) }}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mt-1"
        >
          🔒 Hide
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
