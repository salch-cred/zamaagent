'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { CheckCircle2, Play, Terminal, Mail, TrendingUp, Sparkles } from 'lucide-react'

const stages = [
  {
    id: 'start',
    title: 'How to start',
    subtitle: 'A full roadmap tailored to your company',
    desc: 'Cofounder guides you through all the steps to get a real business started, and kicks off agents for milestones as you build.',
    preview: 'start'
  },
  {
    id: 'build',
    title: 'How to build',
    subtitle: 'Build products and manage infrastructure',
    desc: 'Design, build, and deploy products with engineering agents. Once you are live, infrastructure and security agents monitor and fix issues.',
    preview: 'build'
  },
  {
    id: 'sell',
    title: 'How to sell',
    subtitle: 'Automate sales and marketing with agents',
    desc: 'Cofounder handles inbox warming, email outbound campaigns, content creation, paid marketing, organic social, and analytics.',
    preview: 'sell'
  },
  {
    id: 'scale',
    title: 'How to scale',
    subtitle: 'Confidential payouts and agent-native operations',
    desc: 'Confidential payroll settles in stablecoins encrypted via Zama fhEVM. Portable reputation credentials travel across platforms as you scale.',
    preview: 'scale'
  }
]

export function HowItWorks() {
  const [activeStage, setActiveStage] = useState('start')
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  // Start milestone items
  const startMilestones = [
    { title: 'Initial Idea', type: 'User task', status: 'done' },
    { title: 'Pick a Company Name', type: 'User task', status: 'done' },
    { title: 'Setup Codebase', type: 'Agent task', status: 'pending' },
    { title: 'Incorporate LLC', type: 'Agent requires approval', status: 'pending' }
  ]

  // Build stage logs simulation
  useEffect(() => {
    if (activeStage === 'build') {
      setTerminalLogs(['Initializing agent...', 'Scanning directory structure...', 'Resolving dev dependencies...'])
      const timer = setInterval(() => {
        setTerminalLogs(prev => {
          const lines = [
            'Compiling Next.js application...',
            'Compiling smart contracts: hardhat/fhEVM...',
            'TFHE.sol imports successfully resolved.',
            'Deploying PayMate.sol to Sepolia testnet...',
            'Transaction hash: 0x9a8f276e...981c',
            'Deployed at address: 0x3f8a42b9...5e2f',
            'Verifying source code on Etherscan...',
            'Build SUCCESS. Local dev server running at: http://localhost:3000'
          ]
          if (prev.length < lines.length + 3) {
            return [...prev, lines[prev.length - 3]]
          }
          return prev
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [activeStage])

  // Scale stage DAU counter simulation
  useEffect(() => {
    if (activeStage === 'scale') {
      const timer = setInterval(() => {
        setProgress(p => (p + 1) % 100)
      }, 1500)
      return () => clearInterval(timer)
    }
  }, [activeStage])

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#F5F5F2] border-t border-zinc-200">
      <div className="max-w-[1100px] mx-auto px-6">
        
        <div className="w-full text-left mb-12">
          <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-400">Roadmap Guide</span>
          <h2 className="text-[28px] md:text-[38px] font-normal leading-[115%] text-zinc-900 mt-2">
            Build a real company with the help of specialized agents
          </h2>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-10 border-b border-zinc-300 pb-4">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeStage === stage.id
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-200/60 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {stage.title}
            </button>
          ))}
        </div>

        {/* Active Stage Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch">
          
          {/* Left Text details */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {stages.map((stage) => {
                if (stage.id !== activeStage) return null
                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col"
                  >
                    <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Active Stage</span>
                    <h3 className="text-2xl font-bold text-zinc-900 mt-2">{stage.subtitle}</h3>
                    <p className="text-zinc-600 text-sm md:text-base mt-4 leading-relaxed">{stage.desc}</p>
                    
                    <div className="mt-8 flex gap-3">
                      <button className="cta-btn h-[40px] px-5 rounded-lg text-xs font-semibold">
                        Launch {stage.title} agent
                      </button>
                      <button className="h-[40px] px-5 rounded-lg text-xs text-zinc-500 font-medium hover:text-zinc-900 transition-colors">
                        Documentation →
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Right Graphic Preview Container */}
          <div className="lg:col-span-7 bg-[#E7E7E3] rounded-2xl p-6 border border-zinc-300 flex items-center justify-center min-h-[350px]">
            <AnimatePresence mode="wait">
              {activeStage === 'start' && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-[420px] flex flex-col gap-3 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-2">
                    <span className="text-xs font-mono font-bold text-zinc-800">Launch Roadmap Checklist</span>
                    <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded font-mono text-zinc-500">2/4 Complete</span>
                  </div>

                  {startMilestones.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-100">
                      <div className="flex items-center gap-2">
                        {m.status === 'done' ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full border-2 border-zinc-300 shrink-0" />
                        )}
                        <span className="text-xs font-medium text-zinc-800">{m.title}</span>
                      </div>
                      <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                        m.type.includes('approval') ? 'bg-amber-50 border border-amber-100 text-amber-700' : 'bg-zinc-200 text-zinc-600'
                      }`}>
                        {m.type}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeStage === 'build' && (
                <motion.div
                  key="build"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex flex-col bg-zinc-950 text-zinc-300 font-mono text-xs rounded-xl overflow-hidden border border-zinc-800 shadow-lg"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800/60">
                    <Terminal className="w-4 h-4 text-zinc-500" />
                    <span>CTO Agent Terminal</span>
                  </div>
                  <div className="p-4 h-[180px] overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
                    {terminalLogs.map((log, idx) => (
                      <div key={idx} className={`${log.includes('SUCCESS') ? 'text-emerald-400 font-semibold' : 'text-zinc-400'}`}>
                        &gt; {log}
                      </div>
                    ))}
                    <div className="w-2 h-4 bg-zinc-400 animate-pulse mt-0.5" />
                  </div>
                </motion.div>
              )}

              {activeStage === 'sell' && (
                <motion.div
                  key="sell"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-[440px] flex flex-col gap-3 bg-white p-5 rounded-xl border border-zinc-200 shadow-sm"
                >
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 mb-1">
                    <Mail className="w-4 h-4 text-zinc-600" />
                    <span className="text-xs font-mono font-bold text-zinc-800">Email Outbound Editor</span>
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                      <span className="text-zinc-400 font-mono w-10">To:</span>
                      <span className="font-semibold text-zinc-700">sarah@acme-ventures.com</span>
                    </div>
                    <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                      <span className="text-zinc-400 font-mono w-10">Subject:</span>
                      <span className="text-zinc-600">Confidential stablecoin invoice #042</span>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-lg text-zinc-600 leading-relaxed font-sans text-[11px] max-h-[100px] overflow-y-auto">
                      Hi Sarah, I&apos;ve completed the smart contract integration audit for Acme. I&apos;ve generated a secure, FHE-encrypted invoice for 5,400 USDC via Zama fhEVM. You can view the payment gateway and settle instantly here.
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg mt-1">
                    <span className="text-[10px] font-mono text-emerald-800 font-semibold">CAMPAIGN CONVERSION</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">42% Open Rate</span>
                  </div>
                </motion.div>
              )}

              {activeStage === 'scale' && (
                <motion.div
                  key="scale"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-[420px] flex flex-col gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm"
                >
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <TrendingUp className="w-4.5 h-4.5 text-zinc-700" />
                    <span className="text-xs font-mono font-bold text-zinc-800">Confidential Scale Metrics</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-lg flex flex-col">
                      <span className="text-[10px] text-zinc-400 font-mono">ENCRYPTED PAYROLL</span>
                      <span className="text-lg font-bold text-zinc-800 font-mono mt-1">••••• cUSDC</span>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-lg flex flex-col">
                      <span className="text-[10px] text-zinc-400 font-mono">ACTIVE DEPARTMENTS</span>
                      <span className="text-lg font-bold text-emerald-600 font-mono mt-1">8 / 8 Swarms</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-mono text-zinc-600">
                      <span>Verification Credential</span>
                      <span>100% Minted</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-500" 
                        animate={{ width: `${60 + progress * 0.4}%` }}
                        transition={{ duration: 1.5 }}
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
