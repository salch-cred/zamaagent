'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { CheckCircle2, Terminal, FileText, TrendingUp } from 'lucide-react'

const stages = [
  {
    id: 'connect',
    tab: 'Connect Wallet',
    subtitle: 'Start in 30 seconds',
    desc: 'Connect your MetaMask or RainbowKit wallet on Sepolia. PayMate instantly detects your address and initialises the fhEVM instance ready for encryption.',
  },
  {
    id: 'invoice',
    tab: 'Create Invoice',
    subtitle: 'AI-drafted, FHE-encrypted',
    desc: 'Describe the project and amount. The AI agent creates the invoice, encrypts the amount with TFHE.sol, and sends it on-chain. The client sees a payment request — not the number.',
  },
  {
    id: 'reveal',
    tab: 'Reveal Balance',
    subtitle: 'EIP-712 sign → decrypt',
    desc: 'When you want to see your balance, sign a short EIP-712 message. fhevmjs re-encrypts the on-chain handle with your public key and decrypts it client-side. Nobody else can read it.',
  },
  {
    id: 'reputation',
    tab: 'Build Reputation',
    subtitle: 'Credentials that travel with you',
    desc: 'Every settled invoice mints an ERC-8004 on-chain credential. Your reputation score grows silently and travels to any platform that checks your wallet address.',
  },
]

const tabContentAnim = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -12 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

const previewAnim = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.2 },
}

const progressBarTransition = { duration: 0.8, ease: 'easeOut' }

export function HowItWorks() {
  const [activeStage, setActiveStage] = useState('connect')
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(42)

  useEffect(() => {
    if (activeStage === 'reveal') {
      setTerminalLogs([
        '> Initialising fhevmjs instance...',
        '> Generating reencryption keypair...',
        '> Requesting EIP-712 signature...',
      ])
      const lines = [
        '> Signature received: 0x3a9f...c12e',
        '> Calling gateway.reencrypt()...',
        '> Decryption complete.',
        '> Balance: 12,400 USDC (✅ private)',
      ]
      let idx = 0
      const t = setInterval(() => {
        if (idx < lines.length) setTerminalLogs(prev => [...prev, lines[idx++]])
        else clearInterval(t)
      }, 900)
      return () => clearInterval(t)
    }
  }, [activeStage])

  useEffect(() => {
    if (activeStage === 'reputation') {
      const t = setInterval(() => setProgress(p => Math.min(p + 1, 98)), 800)
      return () => clearInterval(t)
    } else {
      setProgress(42)
    }
  }, [activeStage])

  const connectMilestones = [
    { label: 'MetaMask detected',        done: true  },
    { label: 'Sepolia network confirmed', done: true  },
    { label: 'fhEVM instance ready',      done: true  },
    { label: 'ACL contract found',        done: false },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-[1100px] mx-auto px-6">

        <div className="w-full text-left mb-12">
          <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500">How It Works</span>
          <h2 className="text-[28px] md:text-[38px] font-normal leading-[115%] text-white mt-2 max-w-2xl">
            Private payments in four steps
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 mb-10 border-b border-zinc-800 pb-4">
          {stages.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeStage === s.id
                  ? 'bg-brand text-black shadow-glow-green'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {s.tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch">

          <div className="lg:col-span-5 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {stages.filter(s => s.id === activeStage).map(s => (
                <motion.div key={s.id} {...tabContentAnim} className="flex flex-col">
                  <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider">Step</span>
                  <h3 className="text-2xl font-bold text-white mt-2">{s.subtitle}</h3>
                  <p className="text-zinc-400 text-sm md:text-base mt-4 leading-relaxed">{s.desc}</p>
                  <div className="mt-8 flex gap-3">
                    <button className="h-[40px] px-5 rounded-lg bg-brand text-black text-xs font-semibold hover:bg-brand-dark transition-all">
                      Try it live
                    </button>
                    <a
                      href="https://docs.zama.org"
                      target="_blank"
                      rel="noreferrer"
                      className="h-[40px] px-5 rounded-lg text-xs text-zinc-500 font-medium hover:text-zinc-200 transition-colors flex items-center"
                    >
                      fhEVM docs →
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-7 bg-zinc-900/60 rounded-2xl p-6 border border-zinc-800 flex items-center justify-center min-h-[320px]">
            <AnimatePresence mode="wait">

              {activeStage === 'connect' && (
                <motion.div key="connect" {...previewAnim} className="w-full max-w-[420px] flex flex-col gap-3 bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-1">
                    <span className="text-xs font-mono font-bold text-zinc-200">Wallet Connection</span>
                    <span className="text-[10px] bg-brand/10 border border-brand/20 px-2 py-0.5 rounded font-mono text-brand">3/4 Ready</span>
                  </div>
                  {connectMilestones.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      {m.done
                        ? <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-zinc-700 shrink-0" />}
                      <span className="text-xs text-zinc-300">{m.label}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeStage === 'invoice' && (
                <motion.div key="invoice" {...previewAnim} className="w-full max-w-[420px] flex flex-col gap-3 bg-zinc-950 p-5 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-mono font-bold text-zinc-200">Invoice #1042</span>
                    <span className="ml-auto text-[10px] bg-fhe/10 border border-fhe/20 px-2 py-0.5 rounded font-mono text-fhe">🔐 Encrypted</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-zinc-900 rounded-lg">
                      <span className="text-zinc-500 font-mono">To</span>
                      <span className="text-zinc-200">acme-studio.eth</span>
                    </div>
                    <div className="flex justify-between p-2 bg-zinc-900 rounded-lg">
                      <span className="text-zinc-500 font-mono">Amount</span>
                      <span className="text-zinc-500 font-mono">••••• USDC</span>
                    </div>
                    <div className="flex justify-between p-2 bg-zinc-900 rounded-lg">
                      <span className="text-zinc-500 font-mono">Status</span>
                      <span className="text-brand font-mono font-semibold">Sent on-chain</span>
                    </div>
                  </div>
                  <div className="p-3 bg-fhe/5 border border-fhe/20 rounded-lg text-[11px] text-fhe font-mono">
                    Amount encrypted with TFHE.sol. Only you and the gateway can process it.
                  </div>
                </motion.div>
              )}

              {activeStage === 'reveal' && (
                <motion.div key="reveal" {...previewAnim} className="w-full flex flex-col bg-zinc-950 text-zinc-300 font-mono text-xs rounded-xl overflow-hidden border border-zinc-800">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
                    <Terminal className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400">fhevmjs decrypt terminal</span>
                  </div>
                  <div className="p-4 h-[180px] overflow-y-auto flex flex-col gap-1.5">
                    {terminalLogs.map((log, idx) => (
                      <div key={idx} className={log.includes('✅') ? 'text-brand font-semibold' : 'text-zinc-400'}>{log}</div>
                    ))}
                    <div className="w-2 h-4 bg-zinc-500 animate-pulse mt-0.5" />
                  </div>
                </motion.div>
              )}

              {activeStage === 'reputation' && (
                <motion.div key="reputation" {...previewAnim} className="w-full max-w-[420px] flex flex-col gap-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                    <TrendingUp className="w-4 h-4 text-brand" />
                    <span className="text-xs font-mono font-bold text-zinc-200">On-chain Reputation Score</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-lg">
                      <span className="text-[10px] text-zinc-500 font-mono">INVOICES PAID</span>
                      <p className="text-2xl font-bold text-white font-mono mt-1">12</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-lg">
                      <span className="text-[10px] text-zinc-500 font-mono">ERC-8004 CREDS</span>
                      <p className="text-2xl font-bold text-brand font-mono mt-1">12</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-mono text-zinc-500">
                      <span>Reputation Level</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-brand rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={progressBarTransition}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}
