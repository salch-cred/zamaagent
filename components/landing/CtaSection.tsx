'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-[#FBFBF8] border-t border-zinc-200">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="bg-[#E7E7E3] border border-zinc-300 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          
          <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500">Get Started</span>
          <h2 className="text-[32px] md:text-[46px] font-normal leading-[110%] text-zinc-900 mt-2 mb-6 max-w-xl mx-auto">
            Build your company with the help of specialized agents
          </h2>
          <p className="text-zinc-600 text-sm md:text-base mb-10 max-w-md mx-auto">
            Instantly spin up engineering, marketing, and finance workflows with secure stablecoin operations.
          </p>

          <ConnectButton.Custom>
            {({ openConnectModal, account }) => (
              account ? (
                <Link
                  href="/app/dashboard"
                  className="cta-btn inline-flex items-center justify-center h-[46px] px-8 rounded-lg text-sm font-semibold"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <button
                  onClick={openConnectModal}
                  className="cta-btn inline-flex items-center justify-center h-[46px] px-8 rounded-lg text-sm font-semibold"
                >
                  Run a company
                </button>
              )
            )}
          </ConnectButton.Custom>

          <p className="mt-6 text-xs text-zinc-500 font-mono">
            Requires Sepolia Wallet Connection • Confidentially Secured
          </p>
        </div>
      </div>
    </section>
  )
}
