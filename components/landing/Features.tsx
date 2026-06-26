'use client'
import { motion } from 'framer-motion'
import { LockKeyhole, Zap, BadgeCheck } from 'lucide-react'

const features = [
  {
    icon: LockKeyhole,
    color: 'text-fhe',
    bg: 'bg-fhe/10 border-fhe/20',
    title: 'FHE-Encrypted Payments',
    desc: 'Every invoice amount and payroll figure is encrypted on-chain using Zama TFHE.sol. Nobody — not your client, not the network — can see your earnings. Only you can decrypt with your wallet.'
  },
  {
    icon: Zap,
    color: 'text-brand',
    bg: 'bg-brand/10 border-brand/20',
    title: 'AI Invoice Agent',
    desc: 'Describe the work, set the amount. PayMate\'s AI agent drafts the invoice, picks the right stablecoin, and triggers the on-chain settlement — all in one step. No spreadsheets, no chasing clients.'
  },
  {
    icon: BadgeCheck,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Portable On-chain Reputation',
    desc: 'Every paid invoice mints a verifiable ERC-8004 credential. Stack your reputation score silently — it travels with your wallet address across every platform and marketplace you join.'
  }
]

const cardFade = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
})

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-[#09090B] border-t border-zinc-800">
      <div className="max-w-[1100px] mx-auto px-6">

        <div className="w-full text-left mb-12 md:mb-16">
          <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500">Features</span>
          <h2 className="text-[28px] md:text-[38px] font-normal leading-[115%] text-white mt-2 max-w-2xl">
            The privacy stack for freelance earnings
          </h2>
          <p className="text-zinc-400 text-base mt-4 max-w-xl leading-relaxed">
            PayMate combines Fully Homomorphic Encryption with AI automation so you get paid faster
            without ever exposing your financials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                {...cardFade(i)}
                className="flex flex-col items-start gap-4 p-6 bg-zinc-900/60 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <div className={`p-3 rounded-xl border ${feature.bg}`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
