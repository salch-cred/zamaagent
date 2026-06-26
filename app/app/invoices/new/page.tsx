'use client'
import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { isAddress } from 'viem'
import { encryptAmount } from '@/lib/fhevm'
import { CONTRACTS, INVOICE_ABI, isConfigured } from '@/lib/contracts'
import { useRouter } from 'next/navigation'

export default function NewInvoicePage() {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const router = useRouter()

  const [form, setForm] = useState({
    client:      '',
    description: '',
    amount:      '',
    dueDate:     '',
  })
  const [loading, setLoading]     = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState(false)

  const handleAiFill = async () => {
    setAiLoading(true)
    // Simulate AI filling the form
    await new Promise(r => setTimeout(r, 1200))
    setForm(prev => ({
      ...prev,
      description: prev.description || 'Full-stack development: REST API + frontend dashboard',
      amount:      prev.amount      || '1500',
      dueDate:     prev.dueDate     || new Date(Date.now() + 14 * 864e5).toISOString().split('T')[0],
    }))
    setAiLoading(false)
  }

  // Pre-flight validation that mirrors the on-chain require() checks in
  // ConfidentialInvoice.createInvoice. Catching these client-side avoids
  // wasting gas on a transaction that would revert with an opaque message.
  const validate = (): string | null => {
    if (!address) return 'Connect your wallet first'
    if (!form.client || !form.description || !form.amount) return 'Fill all required fields'
    if (!isAddress(form.client)) return 'Client wallet address is not a valid Ethereum address'
    if (form.client.toLowerCase() === address.toLowerCase()) return 'Client cannot be your own wallet address'
    const amountNum = parseFloat(form.amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) return 'Amount must be greater than 0'
    if (form.dueDate) {
      const dueTs = Math.floor(new Date(form.dueDate).getTime() / 1000)
      if (!Number.isFinite(dueTs)) return 'Due date is invalid'
      if (dueTs <= Math.floor(Date.now() / 1000)) return 'Due date must be in the future'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError(null)

    try {
      // If contracts aren't deployed yet (dev mode), simulate success so the
      // UX is fully testable without a Sepolia deploy.
      if (!isConfigured()) {
        await new Promise(r => setTimeout(r, 1500))
        setSuccess(true)
        setTimeout(() => router.push('/app/invoices'), 1500)
        return
      }

      const amountMicro = Math.round(parseFloat(form.amount) * 1e6)

      // dueDate is a required arg on the contract (Solidity requires
      // `dueDate > block.timestamp`). Convert YYYY-MM-DD to a unix timestamp.
      // Default to +14d if left blank.
      const dueTs = form.dueDate
        ? Math.floor(new Date(form.dueDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000) + 14 * 86400

      // Encrypt the amount client-side before sending to contract
      const { handle, inputProof } = await encryptAmount(
        amountMicro,
        CONTRACTS.ConfidentialInvoice.address,
        address as `0x${string}`
      )

      // Call the smart contract — args match the ABI (5 args incl dueDate)
      await writeContractAsync({
        address: CONTRACTS.ConfidentialInvoice.address,
        abi:     INVOICE_ABI,
        functionName: 'createInvoice',
        args: [
          form.client as `0x${string}`,
          handle,
          inputProof,
          form.description,
          BigInt(dueTs),
        ],
      })

      setSuccess(true)
      setTimeout(() => router.push('/app/invoices'), 2000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Transaction failed. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-2">Invoice Created!</h2>
        <p className="text-zinc-400">Your invoice has been encrypted and sent on-chain.</p>
        <p className="text-zinc-600 text-sm mt-2">Redirecting to invoices...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Create Invoice</h2>
        <p className="text-zinc-500 text-sm mt-1">Amount will be FHE-encrypted — only you and your client can see it.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Client address */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Client Wallet Address <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={form.client}
            onChange={e => setForm(p => ({ ...p, client: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 font-mono text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Work Description <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="What did you build? Be specific..."
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Amount (cUSDT) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="1500.00"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pr-24 text-white placeholder-zinc-600 font-mono text-sm focus:outline-none focus:border-brand transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">cUSDT</span>
          </div>
          {/* FHE notice */}
          <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
            <span className="text-purple-400">🔐</span>
            This amount will be encrypted on-chain. Only you and your client can see it.
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        {/* AI Fill button */}
        <button
          type="button"
          onClick={handleAiFill}
          disabled={aiLoading}
          className="w-full py-3 border border-zinc-700 hover:border-zinc-500 rounded-xl text-sm text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {aiLoading ? (
            <><span className="animate-spin">↻</span> AI is filling the form...</>
          ) : (
            <>🤖 Let AI fill this for me</>
          )}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !address}
          className="w-full py-4 bg-brand hover:bg-brand-dark text-black font-semibold rounded-xl text-sm transition-all hover:shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">↻</span> Encrypting &amp; submitting...
            </span>
          ) : (
            '🔐 Create Encrypted Invoice →'
          )}
        </button>

        {!address && (
          <p className="text-center text-xs text-zinc-600">Connect your wallet to create invoices</p>
        )}
      </form>
    </div>
  )
}
