'use client'
import { motion } from 'framer-motion'
import { Landmark, ShieldAlert, Cpu } from 'lucide-react'

const features = [
  {
    icon: <Landmark className="w-8 h-8 text-zinc-800" />,
    title: 'Agentic departments',
    desc: 'Cofounder is designed like a real company, with specialized departments, managers, and unified context mapping. Your CTO, CMO, and CFO agents communicate automatically to achieve goals.'
  },
  {
    icon: <ShieldAlert className="w-8 h-8 text-zinc-800" />,
    title: 'Human in the loop',
    desc: 'You stay in full control. Agents work alongside you, displaying detailed plans and requesting user approval before taking high-risk or potentially dangerous actions (like deploying live builds or executing payouts).'
  },
  {
    icon: <Cpu className="w-8 h-8 text-zinc-800" />,
    title: 'Fully extensible',
    desc: 'Easily connect Model Context Protocol (MCP) servers, custom API integrations, specialized developer skills, or plug in your entire existing codebase to customize your AI agents.'
  }
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-[#F5F5F2] border-t border-zinc-200">
      <div className="max-w-[1100px] mx-auto px-6">
        
        <div className="w-full text-left mb-12 md:mb-16">
          <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-400">Features</span>
          <h2 className="text-[28px] md:text-[38px] font-normal leading-[115%] text-zinc-900 mt-2">
            The infrastructure for agent-native companies
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-start gap-4 p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm"
            >
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/50">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">{feature.title}</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
