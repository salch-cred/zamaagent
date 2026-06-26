'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export function CtaSection() {
  return (
    <section id="cta" className="py-20 md:py-28 bg-[#09090B] border-t border-zinc-800">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="relative rounded-3xl p-12 md:p-20 text-center overflow-hidden border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">

          {/* Subtle glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-fhe/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-brand/30 bg-brand/10 text-[12px] font-mono uppercase tracking-wider text-brand">
              🔐 Zama fhEVM
            </span>

            <h2 className="text-[32px] md:text-[48px] font-normal leading-[110%] text-white mt-2 mb-6 max-w-2xl mx-auto">
              Start getting paid privately today.
            </h2>

            <p className="text-zinc-400 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed">
              Send encrypted invoices, settle instantly in stablecoins, and build your on-chain reputation — all without exposing your earnings.
            </p>

            <ConnectButton.Custom>
              {({ openConnectModal, account }) => (
                account ? (
                  <Link
                    href="/app/dashboard"
                    className="inline-flex items-center justify-center h-[50px] px-10 rounded-xl bg-brand text-black text-[15px] font-semibold shadow-glow-green hover:bg-brand-dark transition-all"
                  >
                    Launch app →
                  </Link>
                ) : (
                  <button
                    onClick={openConnectModal}
                    className="inline-flex items-center justify-center h-[50px] px-10 rounded-xl bg-brand text-black text-[15px] font-semibold shadow-glow-green hover:bg-brand-dark transition-all"
                  >
                    Connect wallet
                  </button>
                )
              )}
            </ConnectButton.Custom>

            <p className="mt-6 text-xs text-zinc-600 font-mono">
              Runs on Sepolia Testnet • Payments encrypted with Zama fhEVM
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
