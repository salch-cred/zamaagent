'use client'
import { useAccount } from 'wagmi'
import { isConfigured } from '@/lib/contracts'

// Stub page — sidebar links here but DEV FILES 3/4 don't define it.
export default function SettingsPage() {
  const { address } = useAccount()
  const configured = isConfigured()

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-zinc-500 text-sm mt-1">Manage your wallet, privacy, and notification preferences.</p>
      </div>

      {/* Profile */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-white mb-4">Wallet</h3>
        <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
          <span className="text-sm text-zinc-400">Connected address</span>
          <span className="text-sm font-mono text-white">
            {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not connected'}
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-zinc-400">Network</span>
          <span className="text-sm text-white">Sepolia (11155111)</span>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-white mb-4">Privacy</h3>
        <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
          <div>
            <div className="text-sm text-white">FHE encryption</div>
            <div className="text-xs text-zinc-500">All amounts encrypted client-side via fhevmjs</div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-brand/20 text-brand border border-brand/30">On</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm text-white">Reveal signing</div>
            <div className="text-xs text-zinc-500">EIP-712 re-encryption required to view balances</div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-brand/20 text-brand border border-brand/30">On</span>
        </div>
      </div>

      {/* Contracts status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Contracts</h3>
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-zinc-400">Deployment status</span>
          <span className={`text-xs px-2 py-1 rounded-full border ${
            configured
              ? 'bg-brand/20 text-brand border-brand/30'
              : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
          }`}>
            {configured ? 'Live on Sepolia' : 'Not deployed (mock mode)'}
          </span>
        </div>
      </div>
    </div>
  )
}
