export function Marquee() {
  const items = [
    '🔐 FHE-ENCRYPTED INVOICES',
    '⚡ INSTANT STABLECOIN SETTLEMENT',
    '🧠 AI EARNINGS AGENT',
    '🏅 ON-CHAIN REPUTATION',
    '💸 CONFIDENTIAL PAYROLL',
    '🔎 REENCRYPT & REVEAL',
    '📝 ERC-8004 CREDENTIALS',
    '🔐 ZAMA TFHE.SOL',
    '⚡ X402 PAYMENT RAILS',
    '🧠 PAYMATE AI AGENT',
    '💸 USDC SETTLEMENTS',
    '🏅 PORTABLE REPUTATION',
  ]
  const doubled = [...items, ...items]

  return (
    <section className="py-10 overflow-hidden border-y border-zinc-800 bg-zinc-950">
      <div className="flex animate-marquee gap-12 whitespace-nowrap w-max">
        {doubled.map((item, i) => (
          <span key={i} className="text-xs md:text-sm text-zinc-500 font-mono tracking-widest font-semibold">
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}
