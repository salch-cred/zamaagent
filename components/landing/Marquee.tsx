export function Marquee() {
  const items = [
    '🤖 AI VOICE AGENT', '📺 YOUTUBE CHANNEL AGENT', '💻 CODING IDE SWARM', 
    '📰 NEWSLETTER FIRM', '👔 RECRUITING AGENT', '✍️ CONTENT WRITER', 
    '🤝 CONSULTING BOT', '📞 SUPPORT AGENT SWARM', '🚀 GROWTH MARKETING SWARM',
    '🤖 AI VOICE AGENT', '📺 YOUTUBE CHANNEL AGENT', '💻 CODING IDE SWARM',
  ]
  const doubled = [...items, ...items]

  return (
    <section className="py-12 overflow-hidden border-y border-zinc-200 bg-[#E7E7E3]">
      <div className="flex animate-marquee gap-12 whitespace-nowrap w-max">
        {doubled.map((item, i) => (
          <span key={i} className="text-xs md:text-sm text-zinc-500 font-mono tracking-widest font-semibold">{item}</span>
        ))}
      </div>
    </section>
  )
}
