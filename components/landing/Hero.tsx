'use client'
import { motion } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const notificationTemplates = [
  { id: 1, agent: 'CMO Agent', action: 'Inbox warming complete. Outbound campaign ready.', time: 'Just now', color: '#10B981' },
  { id: 2, agent: 'CTO Agent', action: 'Created task: Landing Page Updates. Coding starts.', time: '1m ago', color: '#3B82F6' },
  { id: 3, agent: 'CFO Agent', action: 'Salary payment executed: 5,400 USDC settled.', time: '3m ago', color: '#8B5CF6' },
  { id: 4, agent: 'COO Agent', action: 'Incorporated LLC: Zama Labs Inc. registered.', time: '5m ago', color: '#F59E0B' },
  { id: 5, agent: 'Support Agent', action: 'Resolved ticket #148: Refund requested.', time: '10m ago', color: '#EF4444' }
]

export function Hero() {
  const [notifications, setNotifications] = useState(notificationTemplates.slice(0, 3))

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => {
        const nextId = (prev[0]?.id || 0) + 1
        const template = notificationTemplates[nextId % notificationTemplates.length]
        const newNotif = { ...template, id: nextId, time: 'Just now' }
        // Update times of older ones
        const updatedPrev = prev.map((n, i) => ({
          ...n,
          time: i === 0 ? '1m ago' : i === 1 ? '3m ago' : '5m ago'
        }))
        return [newNotif, ...updatedPrev.slice(0, 3)]
      })
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section id="site-hero" className="relative w-full min-h-screen overflow-hidden bg-[#09090b] flex items-center pt-24 pb-[184px]">
      
      {/* Animated Particle Canvas / CSS space background */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950/50 to-black"></div>
        {/* Animated stars */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
                            radial-gradient(1.5px 1.5px at 40px 70px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 80px 120px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1.5px 1.5px at 110px 80px, #eee, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 150px 200px, #fff, rgba(0,0,0,0))`,
          backgroundSize: '240px 240px',
          animation: 'dash 180s linear infinite'
        }} />
      </div>

      {/* Floating radial orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-fhe/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-5 min-[476px]:px-8 md:px-5 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Left Side: Headline and Subtitle */}
        <div className="max-w-[720px] text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="m-0 font-normal hero-gradient-text max-w-[20ch] xl:max-w-[580px] text-[42px] leading-[110%] md:text-[56px] lg:text-[68px] tracking-tight filter drop-shadow-md text-white">
              Cofounder lets you run an entire company with AI
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-[540px] text-[16px] md:text-[18px] leading-[150%] tracking-[0.15px] text-white/80"
          >
            Run engineering, sales, marketing, design, finance, and ops. All coordinates privately via fhEVM-encrypted payouts and modular agent swarms.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <ConnectButton.Custom>
              {({ openConnectModal, account }) => (
                account ? (
                  <Link href="/app/dashboard" className="group relative inline-flex items-center justify-center no-underline whitespace-nowrap cursor-pointer h-[46px] px-5 rounded-[8px] btn-light-surface font-medium text-[15px]">
                    Open Console →
                  </Link>
                ) : (
                  <button onClick={openConnectModal} className="group relative inline-flex items-center justify-center no-underline whitespace-nowrap cursor-pointer h-[46px] px-5 rounded-[8px] btn-light-surface font-medium text-[15px]">
                    Run a company
                  </button>
                )
              )}
            </ConnectButton.Custom>

            <Link href="#start-section" className="group relative inline-flex items-center justify-center no-underline whitespace-nowrap cursor-pointer h-[46px] px-5 rounded-[8px] glass-pill-btn text-white text-[15px] font-medium">
              Check out the roadmap
            </Link>
          </motion.div>
        </div>

        {/* Right Side: 3D Stacked Live Notifications */}
        <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center max-[1000px]:hidden">
          <div className="relative w-full flex flex-col gap-4" style={{
            perspective: '1000px',
            transform: 'rotateY(-12deg) rotateX(8deg) rotateZ(2deg) scale(0.95)',
            transformStyle: 'preserve-3d'
          }}>
            <AnimatePresence initial={false}>
              {notifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: -40, scale: 0.8, rotateX: -10 }}
                  animate={{ 
                    opacity: 1 - index * 0.25, 
                    y: 0, 
                    scale: 1 - index * 0.05,
                    zIndex: 10 - index
                  }}
                  exit={{ opacity: 0, x: 80, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: notif.color }} />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider font-semibold">{notif.agent}</span>
                      <span className="text-[13px] text-zinc-100 font-medium mt-0.5">{notif.action}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono self-start mt-0.5">{notif.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  )
}
