'use client'
import { useAccount } from 'wagmi'
import { CONTRACTS, isConfigured, isReputationConfigured } from '@/lib/contracts'

const ZERO = '0x0000000000000000000000000000000000000000'

function StatusBadge({ active, labels }: { active: boolean; labels: [string, string] }) {
  return (
    <span className={'text-xs px-2 py-1 rounded-full border ' + (
      active
        ? 'bg-brand/20 text-brand border-brand/30'
        : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
    )}>
      {active ? labels[0] : labels[1]}
    </span>
  )
}

export default function SettingsPage() {
  const { address }   = useAccount()
  const configured    = isConfigured()
  const repConfigured = isReputationConfigured()

  const contracts = [
    { label: 'ConfidentialPayroll',  address: CONTRACTS.ConfidentialPayroll.address },
    { label: 'ConfidentialInvoice',  address: CONTRACTS.ConfidentialInvoice.address },
    { label: 'ConfidentialAirdrop',  address: CONTRACTS.ConfidentialAirdrop.address },
    { label: 'ReputationRegistry',   address: CONTRACTS.ConfidentialReputation.address },
  ]

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-zinc-500 text-sm mt-1">Manage your wallet, privacy, and network preferences.</p>
      </div>

      {/* Wallet */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-white mb-4">Wallet</h3>
        <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
          <span className="text-sm text-zinc-400">Connected address</span>
          <span className="text-sm font-mono text-white">
            {address ? address.slice(0, 8) + '...' + address.slice(-6) : 'Not connected'}
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
          <StatusBadge active labels={['On', 'Off']} />
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm text-white">Reveal signing</div>
            <div className="text-xs text-zinc-500">EIP-712 re-encryption required to view balances</div>
          </div>
          <StatusBadge active labels={['On', 'Off']} />
        </div>
      </div>

      {/* Contract addresses */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Contracts</h3>
          <StatusBadge
            active={configured}
            labels={['Live on Sepolia', 'Not deployed (mock mode)']}
          />
        </div>
        <div className="space-y-1">
          {contracts.map(c => (
            <div key={c.label} className="flex items-center justify-between py-2.5 border-b border-zinc-800/50 last:border-0">
              <span className="text-sm text-zinc-400">{c.label}</span>
              <span className={'text-xs font-mono ' + (c.address === ZERO ? 'text-zinc-600' : 'text-zinc-300')}>
                {c.address === ZERO ? 'not deployed' : c.address.slice(0, 10) + '...' + c.address.slice(-8)}
              </span>
            </div>
          ))}
        </div>
        {!configured && (
          <p className="text-xs text-zinc-600 mt-3">
            Run <code className="text-zinc-500">npx hardhat deploy --network sepolia</code> and set the addresses in .env.local
          </p>
        )}
      </div>

      {/* Reputation status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">On-chain Reputation</h3>
            <p className="text-xs text-zinc-500 mt-0.5">ERC-8004 ReputationRegistry</p>
          </div>
          <StatusBadge
            active={repConfigured}
            labels={['Live', 'Not deployed']}
          />
        </div>
      </div>
    </div>
  )
}
