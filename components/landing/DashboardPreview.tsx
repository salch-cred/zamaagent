'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

const nodes = [
  { name: 'Invoices',   x: 260, y:  77, details: 'Draft, send, and track FHE-encrypted invoices. Clients pay in USDC; amounts stay private on-chain.' },
  { name: 'Payouts',    x: 384, y: 135, details: 'Instant stablecoin settlement via x402 rails. Funds land in your wallet in seconds, not days.' },
  { name: 'Reputation', x: 425, y: 260, details: 'Every paid invoice mints an ERC-8004 on-chain credential. Your score grows silently with every job.' },
  { name: 'Payroll',    x: 384, y: 384, details: 'Confidential salary streams for collaborators. Amounts encrypted with TFHE.sol — nobody sees rates.' },
  { name: 'AI Agent',   x: 260, y: 443, details: 'The PayMate AI agent proactively drafts invoices, reminds clients, and flags overdue payments.' },
  { name: 'Contracts',  x: 135, y: 384, details: 'ConfidentialInvoice.sol, ConfidentialPayroll.sol, and ConfidentialAirdrop.sol deployed on Sepolia.' },
  { name: 'Reveal',     x:  95, y: 260, details: 'EIP-712 sign + fhevmjs reencrypt flow. Decrypt your own balance privately — no third party sees it.' },
  { name: 'cUSDT',      x: 135, y: 135, details: 'TokenOps confidential USDT bounty integration. Earn cUSDT rewards while keeping amounts hidden.' },
]

const headingAnim = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: 'easeOut' },
}

export function DashboardPreview() {
  const [activeNode, setActiveNode] = useState<string | null>(null)

  return (
    <section className="relative w-full overflow-hidden bg-[#09090B] pt-16 pb-20 md:pb-28 border-t border-zinc-800">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-fhe/5 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 flex flex-col items-center">

        <div className="w-full text-center mb-10 md:mb-16">
          <motion.h2
            {...headingAnim}
            className="m-0 text-[26px] md:text-[40px] font-normal leading-[115%] text-white mx-auto max-w-3xl"
          >
            <span>PayMate is your complete</span>
            <br />
            <span className="text-zinc-500">private freelance earnings platform</span>
          </motion.h2>
        </div>

        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* SVG Orbit Graphic */}
          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center bg-zinc-900/50 rounded-3xl border border-zinc-800 p-4">
            <svg viewBox="0 0 520 520" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="260" cy="260" r="183" stroke="rgba(139,92,246,0.12)" strokeWidth="1" />
              <circle cx="260" cy="260" r="90"  stroke="rgba(34,197,94,0.08)"  strokeWidth="1" />

              {nodes.map((node) => (
                <line
                  key={node.name}
                  x1="260" y1="260" x2={node.x} y2={node.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1.2" strokeDasharray="4 4"
                  className="orbit-line"
                />
              ))}

              {/* Central node */}
              <circle cx="260" cy="260" r="44" fill="#18181b" stroke="rgba(34,197,94,0.3)" strokeWidth="1.5" />
              <text x="260" y="257" textAnchor="middle" fill="#22C55E" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="1">PAYMATE</text>
              <text x="260" y="270" textAnchor="middle" fill="#8B5CF6" fontSize="7" fontFamily="monospace" letterSpacing="0.5">fhEVM</text>

              {/* Pulse dots */}
              {nodes.map((node, i) => {
                const pulseAnim = {
                  initial: { cx: 260, cy: 260 },
                  animate: { cx: node.x, cy: node.y },
                  transition: { duration: 2, delay: i * 0.25, repeat: Infinity, repeatType: 'loop' as const, ease: 'linear' },
                }
                return <motion.circle key={`pulse-${node.name}`} r="3" fill="#22C55E" {...pulseAnim} />
              })}
            </svg>

            {/* DOM overlays */}
            {nodes.map((node) => (
              <button
                key={node.name}
                onClick={() => setActiveNode(activeNode === node.name ? null : node.name)}
                onMouseEnter={() => setActiveNode(node.name)}
                onMouseLeave={() => setActiveNode(null)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono border transition-all duration-200 ${
                  activeNode === node.name
                    ? 'bg-brand border-brand text-black shadow-glow-green scale-105'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-brand hover:text-white'
                }`}
                style={{ left: `${(node.x / 520) * 100}%`, top: `${(node.y / 520) * 100}%` }}
              >
                {node.name}
              </button>
            ))}
          </div>

          {/* Details card */}
          <div className="flex-1 w-full max-w-[420px] flex flex-col justify-center">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">Module Directory</h3>
            <div className="min-h-[180px] p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-brand/10 border border-brand/30 text-brand text-[10px] font-mono tracking-wider font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  LIVE ON SEPOLIA
                </span>
                <h4 className="text-xl font-semibold text-white mt-2">
                  {activeNode ? `${activeNode} Module` : 'Select a Module'}
                </h4>
                <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                  {activeNode
                    ? nodes.find(n => n.name === activeNode)?.details
                    : 'Hover a node to explore PayMate\'s modules — from FHE-encrypted invoices to on-chain reputation and confidential payroll.'}
                </p>
              </div>
              <div className="text-[10px] text-zinc-600 font-mono mt-4 pt-4 border-t border-zinc-800">
                Built on: Zama fhEVM • Sepolia Testnet • ERC-8004
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
