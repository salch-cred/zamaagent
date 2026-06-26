'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

const nodes = [
  { name: 'Legal', x: 260, y: 77, details: 'Incorporate LLC, draft terms, manage equity.' },
  { name: 'Finance', x: 384, y: 135, details: 'USDC invoices, wallet payouts, taxes, accounting.' },
  { name: 'Marketing', x: 425, y: 260, details: 'Outbound emails, newsletters, Twitter campaigns.' },
  { name: 'Support', x: 384, y: 384, details: 'Customer chat, ticket resolutions, refund processing.' },
  { name: 'Engineering', x: 260, y: 443, details: 'Write code, manage GitHub, run test scripts, build.' },
  { name: 'Operations', x: 135, y: 384, details: 'Verify domains, warm up emails, organize assets.' },
  { name: 'Design', x: 95, y: 260, details: 'Create brand kits, export SVG icons, Figma updates.' },
  { name: 'Sales', x: 135, y: 135, details: 'Scrape leads, warm inbox, schedule demo calls.' }
]

export function DashboardPreview() {
  const [activeNode, setActiveNode] = useState<string | null>(null)

  return (
    <section className="relative w-full overflow-hidden bg-[#F5F5F2] pt-16 pb-20 md:pb-28">
      {/* Dynamic backdrop shading */}
      <div aria-hidden="true" className="top-0 pointer-events-none absolute right-0 z-0 w-1/2 h-full bg-gradient-to-l from-zinc-200/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 flex flex-col items-center">
        
        {/* Title Header */}
        <div className="w-full text-center mb-10 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="m-0 text-[26px] md:text-[40px] font-normal leading-[115%] text-zinc-900 mx-auto max-w-3xl"
          >
            <span>Cofounder is an agent orchestration platform</span>
            <br />
            <span className="text-zinc-500">designed to help you run an entire business</span>
          </motion.h2>
        </div>

        {/* Graph Display Area */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* SVG Orbit Graphic */}
          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center bg-white rounded-3xl border border-zinc-200 shadow-sm p-4">
            
            <svg viewBox="0 0 520 520" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer Orbit Line */}
              <circle cx="260" cy="260" r="183" stroke="rgba(32,32,32,0.06)" strokeWidth="1" />
              
              {/* Inner Orbit Line */}
              <circle cx="260" cy="260" r="90" stroke="rgba(32,32,32,0.04)" strokeWidth="1" />

              {/* Connecting Radial Lines */}
              {nodes.map((node) => (
                <line
                  key={node.name}
                  x1="260"
                  y1="260"
                  x2={node.x}
                  y2={node.y}
                  stroke="rgba(32, 32, 32, 0.08)"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  className="orbit-line"
                />
              ))}

              {/* Central Node */}
              <g className="cursor-pointer">
                <circle cx="260" cy="260" r="44" fill="#F2F2EE" stroke="rgba(32, 32, 32, 0.15)" strokeWidth="1.5" />
                <text 
                  x="260" 
                  y="265" 
                  textAnchor="middle" 
                  fill="#202020" 
                  className="font-mono text-[10px] font-bold tracking-wider"
                >
                  COFOUNDER
                </text>
              </g>

              {/* Pulsing signal markers moving along lines */}
              {nodes.map((node, i) => (
                <motion.circle
                  key={`pulse-${node.name}`}
                  r="3.5"
                  fill="#10B981"
                  initial={{ cx: 260, cy: 260 }}
                  animate={{ cx: node.x, cy: node.y }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </svg>

            {/* Absolute-positioned DOM node overlays for mouse interaction */}
            {nodes.map((node) => {
              // Calculate percent positions relative to 520px container
              const leftPercent = `${(node.x / 520) * 100}%`
              const topPercent = `${(node.y / 520) * 100}%`
              
              return (
                <button
                  key={node.name}
                  onClick={() => setActiveNode(activeNode === node.name ? null : node.name)}
                  onMouseEnter={() => setActiveNode(node.name)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono border transition-all duration-200 ${
                    activeNode === node.name
                      ? 'bg-zinc-900 border-zinc-900 text-white shadow-md scale-105'
                      : 'bg-white border-zinc-200 text-zinc-600 shadow-sm hover:border-zinc-400 hover:text-zinc-900'
                  }`}
                  style={{ left: leftPercent, top: topPercent }}
                >
                  {node.name}
                </button>
              )
            })}
          </div>

          {/* Details side card */}
          <div className="flex-1 w-full max-w-[420px] flex flex-col justify-center">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3">Agent Swarm Directory</h3>
            <div className="min-h-[160px] p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-mono tracking-wider font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVE
                </span>
                <h4 className="text-xl font-semibold text-zinc-900 mt-2">
                  {activeNode ? `${activeNode} Agent` : 'Select an Agent Node'}
                </h4>
                <p className="text-zinc-600 text-sm mt-3 leading-relaxed">
                  {activeNode 
                    ? nodes.find(n => n.name === activeNode)?.details 
                    : 'Hover or click on any department node (e.g. Legal, Marketing, Engineering) to see what tasks the AI agent handles in your virtual cofounder company.'
                  }
                </p>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-4 pt-4 border-t border-zinc-100">
                Connected via: general-intelligence-company/superoptimizers
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
