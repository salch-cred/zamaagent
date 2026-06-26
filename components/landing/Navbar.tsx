'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features',     href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Reputation',   href: '#reputation' },
  { label: 'FAQ',          href: '#faq' },
]

const drawerMotion = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2, ease: 'easeOut' },
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[201] flex justify-center bg-transparent border-b border-white/0 transition-all duration-300">
        <div className="w-full max-w-[1440px] mx-auto px-5 min-[476px]:px-8 md:px-5 py-4 min-[1000px]:py-0 min-[1000px]:pt-[26px] min-[1000px]:pb-[23px] flex items-center justify-between">

          {/* PayMate Wordmark */}
          <Link href="/" aria-label="PayMate home" className="shrink-0 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-brand text-black font-bold text-[15px]">P</span>
            <span className="text-white font-semibold text-[18px] tracking-tight">PayMate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden min-[1000px]:flex items-center gap-3">
            <nav className="flex items-center gap-3">
              <div className="relative flex h-[41px] items-center pl-[14px] pr-[10px] rounded-[8px] glass-pill">
                {NAV_LINKS.map((link) => (
                  <span key={link.href} className="group relative inline-flex items-center justify-center rounded-[4px] py-[2px] px-[5px] hover:bg-white/10 transition-colors">
                    <Link
                      className="nav-link relative z-10 no-underline whitespace-nowrap px-[6px] text-[15px] leading-[150%] tracking-[0.15px] text-white/80 hover:text-white font-medium"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </span>
                ))}
              </div>

              <ConnectButton.Custom>
                {({ openConnectModal, account }) => (
                  account ? (
                    <div className="flex items-center gap-3">
                      <Link href="/app/dashboard" className="group relative flex h-[41px] items-center justify-center rounded-[8px] px-[14px] glass-pill hover:bg-white/20 transition-all text-white text-[15px] font-medium">
                        Dashboard
                      </Link>
                      <Link href="/app/dashboard" className="cta-btn group relative inline-flex items-center justify-center no-underline whitespace-nowrap cursor-pointer h-[41px] px-[16px] rounded-[8px] text-[15px] font-semibold text-black">
                        Launch app
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button onClick={openConnectModal} className="group relative flex h-[41px] items-center justify-center rounded-[8px] px-[14px] glass-pill hover:bg-white/20 transition-all text-white text-[15px] font-medium">
                        Log in
                      </button>
                      <button onClick={openConnectModal} className="cta-btn group relative inline-flex items-center justify-center no-underline whitespace-nowrap cursor-pointer h-[41px] px-[16px] rounded-[8px] text-[15px] font-semibold text-black">
                        Connect wallet
                      </button>
                    </div>
                  )
                )}
              </ConnectButton.Custom>
            </nav>
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center min-[1000px]:hidden gap-3">
            <ConnectButton.Custom>
              {({ openConnectModal, account }) => (
                account ? (
                  <Link href="/app/dashboard" className="cta-btn inline-flex items-center justify-center h-[41px] px-3.5 rounded-[8px] text-[14px] font-semibold text-black">
                    Launch app
                  </Link>
                ) : (
                  <button onClick={openConnectModal} className="cta-btn inline-flex items-center justify-center h-[41px] px-3.5 rounded-[8px] text-[14px] font-semibold text-black">
                    Connect
                  </button>
                )
              )}
            </ConnectButton.Custom>

            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="relative flex h-[41px] w-[41px] items-center justify-center rounded-[8px] glass-pill hover:bg-white/20 transition-colors"
            >
              {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...drawerMotion}
            className="fixed inset-0 top-[73px] z-[200] bg-[#09090b] px-6 py-8 flex flex-col gap-6 min-[1000px]:hidden border-t border-white/5"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  onClick={() => setIsOpen(false)}
                  href={link.href}
                  className="text-xl text-zinc-100 py-2 border-b border-zinc-800/40"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto pb-8">
              <ConnectButton.Custom>
                {({ openConnectModal, account }) => (
                  account ? (
                    <Link
                      onClick={() => setIsOpen(false)}
                      href="/app/dashboard"
                      className="w-full flex items-center justify-center py-4 bg-brand text-black font-semibold rounded-xl text-lg"
                    >
                      Launch app
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        openConnectModal()
                      }}
                      className="w-full py-4 bg-brand text-black font-semibold rounded-xl text-lg"
                    >
                      Connect wallet
                    </button>
                  )
                )}
              </ConnectButton.Custom>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
