'use client'
import { useState, useRef, useEffect } from 'react'
import type React from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACTS, INVOICE_ABI, REPUTATION_ABI, isConfigured, isReputationConfigured } from '@/lib/contracts'

type Message = {
  id:        string
  role:      'agent' | 'user'
  content:   string
  timestamp: Date
}

// Extracted style consts — avoids inline double-brace objects that can
// get mangled; single-brace `style={agentPageStyle}` is safe.
const agentPageStyle: React.CSSProperties = { height: 'calc(100vh - 130px)' }

// Dot bounce delays for the typing indicator
const dotDelayStyles: React.CSSProperties[] = [
  { animationDelay: '0s' },
  { animationDelay: '0.15s' },
  { animationDelay: '0.3s' },
]

function buildInitialMessage(invoiceCount: number, overdueCount: number, score: number): string {
  if (invoiceCount === 0) {
    return "Hey! I'm your PayMate AI Agent. You have no invoices yet. Want me to help you create your first one?"
  }
  if (overdueCount > 0) {
    return 'Hey! I\'m your PayMate AI Agent. I\'ve been monitoring your invoices. ' +
      'You have ' + invoiceCount + ' invoice' + (invoiceCount > 1 ? 's' : '') +
      ' and ' + overdueCount + ' overdue. Want me to handle the overdue one?'
  }
  return 'Hey! I\'m your PayMate AI Agent. All ' + invoiceCount +
    ' of your invoice' + (invoiceCount > 1 ? 's' : '') +
    ' are on track. Your reputation score is ' + score + '/1000. How can I help?'
}

function getAiResponse(input: string, score: number, invoiceCount: number): string {
  const lower = input.toLowerCase()
  if (lower.includes('invoice') || lower.includes('create'))
    return 'Sure! Tell me: who is the client (wallet address), what did you build, and how much should I charge?'
  if (lower.includes('follow') || lower.includes('remind') || lower.includes('overdue'))
    return '\u2705 Done! I sent a professional payment reminder. I\'ll monitor for a response and escalate in 48 hours if needed.'
  if (lower.includes('earn') || lower.includes('balance') || lower.includes('money'))
    return 'Your earnings are FHE-encrypted on-chain. Go to the Earnings page and click \'Reveal\' to see your balance privately with an EIP-712 MetaMask signature.'
  if (lower.includes('reputation') || lower.includes('score') || lower.includes('credential'))
    return 'Your ERC-8004 reputation score is ' + score + '/1000. You have ' + invoiceCount +
      ' verified invoice' + (invoiceCount > 1 ? 's' : '') + '. Want me to generate a sharable reputation certificate?'
  return 'I can help you create invoices, follow up on payments, analyze your earnings, or manage your reputation credentials. What would you like to do?'
}

export default function AgentPage() {
  const { address }    = useAccount()
  const configured     = isConfigured()
  const repConfigured  = isReputationConfigured()
  const liveEnabled    = configured && !!address
  const repEnabled     = repConfigured && !!address

  const { data: invoiceIds } = useReadContract({
    address: CONTRACTS.ConfidentialInvoice.address,
    abi: INVOICE_ABI,
    functionName: 'getFreelancerInvoices',
    args: [address as `0x${string}`],
    query: { enabled: liveEnabled },
  })

  const { data: scoreData } = useReadContract({
    address: CONTRACTS.ConfidentialReputation.address,
    abi: REPUTATION_ABI,
    functionName: 'reputationScore',
    args: [address as `0x${string}`],
    query: { enabled: repEnabled },
  })

  const invoiceCount = invoiceIds ? (invoiceIds as bigint[]).length : 3
  const liveScore    = scoreData !== undefined ? Number(scoreData) : 847

  const initialMsg: Message = {
    id:        '1',
    role:      'agent',
    content:   buildInitialMessage(invoiceCount, 1, liveScore),
    timestamp: new Date(),
  }

  const [messages, setMessages] = useState<Message[]>([initialMsg])
  const [input,    setInput]    = useState('')
  const [typing,   setTyping]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600))
    const agentMsg: Message = {
      id:        (Date.now() + 1).toString(),
      role:      'agent',
      content:   getAiResponse(text, liveScore, invoiceCount),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, agentMsg])
    setTyping(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const quickActions = [
    'Follow up on overdue invoice',
    'Create a new invoice',
    'Show my reputation score',
    'How are my earnings this month?',
  ]

  return (
    <div className="max-w-3xl flex flex-col" style={agentPageStyle}>
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-800 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/30 to-fhe/30 border border-zinc-700 flex items-center justify-center text-2xl">
          🤖
        </div>
        <div>
          <h2 className="font-semibold text-white">PayMate AI Agent</h2>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Online • Monitoring {invoiceCount} invoice{invoiceCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={'flex gap-3 ' + (msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            {msg.role === 'agent' && (
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
            )}
            <div className={'max-w-sm rounded-2xl px-4 py-3 text-sm ' +
              (msg.role === 'agent'
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                : 'bg-brand text-black font-medium')
            }>
              {msg.content}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm">🤖</div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={dotDelayStyles[i]} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {quickActions.map(action => (
            <button
              key={action}
              onClick={() => sendMessage(action)}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 border-t border-zinc-800 pt-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your agent anything..."
          disabled={typing}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || typing}
          className="px-5 py-3 bg-brand hover:bg-brand-dark text-black font-semibold rounded-xl text-sm transition-all hover:shadow-glow-green disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send →
        </button>
      </div>
    </div>
  )
}
