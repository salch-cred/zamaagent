'use client'
import { motion } from 'framer-motion'

const guides = [
  { id: 1, chapter: 'Guide 1', title: 'Setup & Connect',  roman: 'I',   subtitle: 'Connect wallet, configure Sepolia, fund with test ETH.',          color: 'bg-zinc-900 text-zinc-100 border-zinc-700', accent: '#22C55E' },
  { id: 2, chapter: 'Guide 2', title: 'Create Invoice',   roman: 'II',  subtitle: 'Let the AI agent draft and send an FHE-encrypted invoice.',       color: 'bg-zinc-800 text-zinc-100 border-zinc-700', accent: '#8B5CF6' },
  { id: 3, chapter: 'Guide 3', title: 'Reveal Balance',   roman: 'III', subtitle: 'EIP-712 sign, reencrypt with fhevmjs, see your earnings.',         color: 'bg-zinc-900 text-zinc-100 border-zinc-700', accent: '#3B82F6' },
  { id: 4, chapter: 'Guide 4', title: 'Build Reputation', roman: 'IV',  subtitle: 'Paid invoices mint ERC-8004 on-chain credentials.',                 color: 'bg-zinc-800 text-zinc-100 border-zinc-700', accent: '#F59E0B' },
]

const bookFade = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
})

const hoverTilt = {
  whileHover: { rotateY: -6, scale: 1.04, translateY: -6 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

export function Guides() {
  return (
    <section id="guides" className="py-20 md:py-28 bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-[1100px] mx-auto px-6">

        <div className="w-full text-center mb-16">
          <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500">Guides</span>
          <h2 className="text-[28px] md:text-[38px] font-normal leading-[115%] text-white mt-2 max-w-2xl mx-auto">
            From zero to private payments in four steps
          </h2>
          <p className="text-zinc-400 text-sm md:text-base mt-4 max-w-xl mx-auto">
            Follow each guide to go from wallet connect to fully on-chain FHE-encrypted earnings.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {guides.map((guide, i) => (
            <motion.div
              key={guide.id}
              {...bookFade(i)}
              className="book-container flex flex-col items-center cursor-pointer"
            >
              <motion.div
                {...hoverTilt}
                className={`book-card relative w-[140px] md:w-[175px] aspect-[3/4.2] rounded-r-lg border shadow-xl flex flex-col justify-between p-4 md:p-5 ${guide.color}`}
              >
                {/* Spine accent — single braces, no double-brace issue */}
                <div
                  className="absolute top-0 bottom-0 left-[3px] w-[2px] rounded-full"
                  style= backgroundColor: guide.accent 
                />

                <div className="flex flex-col gap-1 border-b border-white/10 pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider opacity-50">{guide.chapter}</span>
                  <h3 className="text-sm md:text-base font-bold font-mono tracking-tight leading-tight">{guide.title}</h3>
                </div>

                <div
                  className="text-center font-serif italic opacity-20 my-3"
                  style= fontSize: '2.2rem' 
                >
                  {guide.roman}
                </div>

                <p className="text-[10px] leading-snug opacity-60">{guide.subtitle}</p>

                <div className="flex justify-between items-end border-t border-white/10 pt-2 text-[8px] md:text-[9px] font-mono opacity-50">
                  <span>PAYMATE</span>
                  <span>2026</span>
                </div>
              </motion.div>

              <span className="text-xs font-mono font-medium text-zinc-500 mt-5 hover:text-zinc-200 transition-colors">
                Read Guide {guide.roman} →
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
