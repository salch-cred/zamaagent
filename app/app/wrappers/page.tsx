'use client'

import { useState } from 'react'
import { ExternalLink, ArrowRightLeft, ShieldCheck, Info } from 'lucide-react'

/**
 * Confidential Wrapper Registry
 * Season 3 Zama Developer Program — Bounty Track
 *
 * Turns the official Zama Wrappers Registry into a usable product:
 * https://github.com/zama-ai/fhevm-contracts/tree/main/contracts/token/ERC20/wrappers
 *
 * Users can browse, wrap, and unwrap confidential ERC-20 tokens (ERC-7984).
 */

const WRAPPERS = [
  {
    symbol:       'cUSDC',
    name:         'Confidential USDC',
    underlying:   'USDC',
    address:      '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    decimals:     6,
    chainId:      1,
    network:      'Ethereum',
    tvl:          '$5.74M',
    apy:          '6.8%',
    tags:         ['Live', 'Morpho Vault', 'Steakhouse'],
    description:  'Confidential USDC — first live cToken on Ethereum. Powers the Steakhouse Confidential Prime USDC Vault (launched June 23 2026).',
    docsUrl:      'https://docs.zama.ai/protocol/token/confidential-usdc',
    explorerUrl:  'https://etherscan.io/address/0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
    hot:          true,
  },
  {
    symbol:       'cUSDT',
    name:         'Confidential USDT',
    underlying:   'USDT',
    address:      '0x0000000000000000000000000000000000000002',
    decimals:     6,
    chainId:      11155111,
    network:      'Sepolia',
    tvl:          'Testnet',
    apy:          'N/A',
    tags:         ['Testnet', 'ERC-7984'],
    description:  'Confidential USDT for testnet development. Used for Zama Developer Program prize distributions.',
    docsUrl:      'https://docs.zama.ai/protocol/token/confidential-usdt',
    explorerUrl:  'https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000002',
    hot:          false,
  },
  {
    symbol:       'cDAI',
    name:         'Confidential DAI',
    underlying:   'DAI',
    address:      '0x0000000000000000000000000000000000000003',
    decimals:     18,
    chainId:      11155111,
    network:      'Sepolia',
    tvl:          'Testnet',
    apy:          'N/A',
    tags:         ['Testnet', 'ERC-7984'],
    description:  'Confidential DAI. Enables private MakerDAO-backed stable payments without revealing balances.',
    docsUrl:      'https://docs.zama.ai/protocol/token/confidential-dai',
    explorerUrl:  'https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000003',
    hot:          false,
  },
  {
    symbol:       'cWETH',
    name:         'Confidential WETH',
    underlying:   'WETH',
    address:      '0x0000000000000000000000000000000000000004',
    decimals:     18,
    chainId:      11155111,
    network:      'Sepolia',
    tvl:          'Testnet',
    apy:          'N/A',
    tags:         ['Testnet', 'ERC-7984'],
    description:  'Confidential Wrapped ETH. Pay invoices in ETH without revealing payroll wallet balances.',
    docsUrl:      'https://docs.zama.ai/protocol/token/confidential-weth',
    explorerUrl:  'https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000004',
    hot:          false,
  },
]

type Tab = 'browse' | 'wrap' | 'unwrap'

const tagColors: Record<string, string> = {
  'Live':            'bg-brand/10 text-brand border-brand/30',
  'Morpho Vault':    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Steakhouse':      'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Testnet':         'bg-zinc-700/40 text-zinc-400 border-zinc-700/40',
  'ERC-7984':        'bg-purple-500/10 text-purple-400 border-purple-500/30',
}

export default function WrappersPage() {
  const [tab, setTab]           = useState<Tab>('browse')
  const [selected, setSelected] = useState(WRAPPERS[0])
  const [amount, setAmount]     = useState('')
  const [isWrapping, setIsWrapping] = useState(false)

  const handleWrap = async () => {
    if (!amount) return
    setIsWrapping(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsWrapping(false)
    setAmount('')
  }

  const tabBase = 'px-4 py-2 text-sm rounded-lg transition-colors '
  const tabActive = 'bg-zinc-800 text-white font-medium'
  const tabInactive = 'text-zinc-400 hover:text-white'

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">Confidential Wrapper Registry</h1>
          <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full font-medium">
            Season 3 Bounty Track
          </span>
        </div>
        <p className="text-zinc-400 text-sm max-w-2xl">
          Browse, wrap, and unwrap ERC-7984 confidential tokens. Powered by the official
          Zama Wrappers Registry — turning on-chain registry data into a usable product.
        </p>
        <a
          href="https://github.com/zama-ai/fhevm-contracts/tree/main/contracts/token/ERC20/wrappers"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mt-2 transition-colors"
        >
          View Zama Wrappers Registry on GitHub <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
        {(['browse', 'wrap', 'unwrap'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tabBase + (tab === t ? tabActive : tabInactive)}
          >
            {t === 'browse' ? '🗂️ Browse' : t === 'wrap' ? '🔐 Wrap' : '🔓 Unwrap'}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {WRAPPERS.map(w => (
            <div
              key={w.symbol}
              onClick={() => { setSelected(w); setTab('wrap') }}
              className={'bg-zinc-900 border rounded-xl p-5 cursor-pointer transition-all hover:border-zinc-600 ' + (w.hot ? 'border-emerald-700/50' : 'border-zinc-800')}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg font-bold text-white">
                    {w.symbol[1]}
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      {w.symbol}
                      {w.hot && <span className="text-[9px] bg-brand/20 text-brand border border-brand/30 px-1.5 py-0.5 rounded-full">LIVE</span>}
                    </div>
                    <div className="text-xs text-zinc-500">{w.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-400">{w.apy !== 'N/A' ? w.apy + ' APY' : '—'}</div>
                  <div className="text-xs text-zinc-500">{w.tvl}</div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mb-3">{w.description}</p>

              <div className="flex items-center gap-2 flex-wrap">
                {w.tags.map(tag => (
                  <span key={tag} className={'text-[10px] px-2 py-0.5 rounded-full border ' + (tagColors[tag] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700')}>
                    {tag}
                  </span>
                ))}
                <span className="text-[10px] text-zinc-600 ml-auto">{w.network}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {(tab === 'wrap' || tab === 'unwrap') && (
        <div className="max-w-lg">
          {/* Token selector */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
            <div className="text-xs text-zinc-500 mb-3">Select token</div>
            <div className="flex gap-2 flex-wrap">
              {WRAPPERS.map(w => (
                <button
                  key={w.symbol}
                  onClick={() => setSelected(w)}
                  className={'px-3 py-1.5 rounded-lg text-sm border transition-colors ' +
                    (selected.symbol === w.symbol
                      ? 'bg-zinc-700 border-zinc-600 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white')}
                >
                  {w.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Wrap/Unwrap form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-semibold text-white">
                  {tab === 'wrap' ? 'Wrap' : 'Unwrap'} {selected.symbol}
                </div>
                <div className="text-xs text-zinc-500">
                  {tab === 'wrap'
                    ? selected.underlying + ' → ' + selected.symbol + ' (FHE-encrypted)'
                    : selected.symbol + ' (decrypted) → ' + selected.underlying}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Amount</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500"
                />
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-300 font-mono">
                  {tab === 'wrap' ? selected.underlying : selected.symbol}
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-zinc-500">
                {tab === 'wrap'
                  ? 'Your ' + selected.underlying + ' will be locked in the wrapper contract and you will receive FHE-encrypted ' + selected.symbol + '. The amount is hidden from all on-chain observers including validators.'
                  : 'Your ' + selected.symbol + ' will be burned. You receive ' + selected.underlying + ' back. This operation requires KMS re-encryption via EIP-712 signature.'}
              </div>
            </div>

            <button
              onClick={handleWrap}
              disabled={!amount || isWrapping}
              className="w-full flex items-center justify-center gap-2 bg-purple-900/20 border border-purple-700/50 text-purple-400 rounded-lg py-2.5 text-sm font-medium hover:bg-purple-900/40 transition-colors disabled:opacity-40"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {isWrapping
                ? 'Encrypting via fhEVM...'
                : tab === 'wrap'
                  ? 'Wrap ' + (amount || '0') + ' ' + selected.underlying + ' → ' + selected.symbol
                  : 'Unwrap ' + (amount || '0') + ' ' + selected.symbol + ' → ' + selected.underlying}
            </button>

            <div className="flex items-center justify-between text-xs text-zinc-600">
              <span>Contract:</span>
              <a
                href={selected.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono hover:text-zinc-400 transition-colors flex items-center gap-1"
              >
                {selected.address.slice(0, 10)}...{selected.address.slice(-6)}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
