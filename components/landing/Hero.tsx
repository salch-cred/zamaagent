'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

type Notif = { id: number; agent: string; action: string; time: string; color: string }

const notificationTemplates: Notif[] = [
  { id: 1, agent: 'PayMate Agent', action: 'Invoice #1042 paid — 3,200 USDC settled privately.', time: 'Just now', color: '#22C55E' },
  { id: 2, agent: 'Payouts',       action: 'Encrypted balance updated. Only you can decrypt it.', time: '1m ago',   color: '#8B5CF6' },
  { id: 3, agent: 'Reputation',    action: 'On-chain credential issued: 12 invoices paid on time.', time: '3m ago', color: '#3B82F6' },
  { id: 4, agent: 'PayMate Agent', action: 'Drafted invoice for Acme Studio — ready to send.',    time: '5m ago',   color: '#22C55E' },
  { id: 5, agent: 'Payroll',       action: 'Salary stream funded: 5,400 cUSDT, fully confidential.', time: '10m ago', color: '#F59E0B' },
]

// Motion configs defined as plain objects, spread into JSX with single-brace syntax.
// This avoids the double-brace JSX corruption that affected the original DEV FILES.
const fadeHeadline = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: 'easeOut' } }
const fadeSub      = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.1, ease: 'easeOut' } }
const fadeCta      = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2, ease: 'easeOut' } }
const cardMotion = {
  layout: true,
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, scale: 0.95 },
  transition: { duration: 0.4, ease: 'easeOut' },
}
const dot = (color: string): CSSProperties => ({ backgroundColor: color })

export function Hero() {
  const [notifications, setNotifications] = useState<Notif[]>(notificationTemplates.slice(0, 3))

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => {
        const nextId = (prev[0]?.id || 0) + 1
        const template = notificationTemplates[nextId % notificationTemplates.length]
        const newNotif: Notif = { ...template, id: nextId, time: 'Just now' }
        const updatedPrev = prev.map((n, i) => ({
          ...n,
          time: i === 0 ? '1m ago' : i === 1 ? '3m ago' : '5m ago',
        }))
        return [newNotif, ...updatedPrev.slice(0, 2)]
      })
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="site-hero" className="relative w-full min-h-screen overflow-hidden bg-[#09090b] flex items-center pt-24 pb-[184px]">
      <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950/50 to-black" />
      </div>

      {/* Floating radial orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-fhe/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-5 min-[476px]:px-8 md:px-5 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">

        {/* Left: Headline */}
        <div className="max-w-[720px] text-left">
          <motion.div {...fadeHeadline}>
            <span className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-fhe/30 bg-fhe/10 text-[12px] font-mono uppercase tracking-wider text-fhe">
              🔐 Powered by Zama fhEVM
            </span>
            <h1 className="m-0 font-normal hero-gradient-text max-w-[20ch] xl:max-w-[620px] text-[42px] leading-[110%] md:text-[56px] lg:text-[68px] tracking-tight filter drop-shadow-md text-white">
              Get paid privately. Run your freelance business on autopilot.
            </h1>
          </motion.div>

          <motion.p {...fadeSub} className="mt-6 max-w-[540px] text-[16px] md:text-[18px] leading-[150%] tracking-[0.15px] text-white/80">
            PayMate is your AI earnings agent: send invoices, settle in stablecoins instantly,
            and keep every amount encrypted on-chain with FHE.
            Your earnings. Your business. Nobody else&apos;s.
          </motion.p>

          <motion.div {...fadeCta} className="mt-8 flex flex-wrap items-center gap-4">
            <ConnectButton.Custom>
              {({ openConnectModal, account }) => (
                account ? (
                  <Link href="/app/dashboard" className="group relative inline-flex items-center justify-center no-underline whitespace-nowrap cursor-pointer h-[46px] px-5 rounded-[8px] btn-light-surface font-medium text-[15px]">
                    Launch app →
                  </Link>
                ) : (
                  <button onClick={openConnectModal} className="group relative inline-flex items-center justify-center no-underline whitespace-nowrap cursor-pointer h-[46px] px-5 rounded-[8px] btn-light-surface font-medium text-[15px]">
                    Connect wallet
                  </button>
                )
              )}
            </ConnectButton.Custom>

            <Link href="#how-it-works" className="group relative inline-flex items-center justify-center no-underline whitespace-nowrap cursor-pointer h-[46px] px-5 rounded-[8px] glass-pill-btn text-white text-[15px] font-medium">
              See how it works
            </Link>
          </motion.div>
        </div>

        {/* Right: Live Notification Stack */}
        <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center max-[1000px]:hidden">
          <div className="relative w-full flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  {...cardMotion}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={dot(notif.color)} />
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
