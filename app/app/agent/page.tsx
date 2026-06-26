'use client'
import { useState, useRef, useEffect } from 'react'

type Message = {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: Date
  actions?: { label: string; onClick: () => void }[]
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'agent',
    content: 'Hey! I\'m your PayMate AI Agent. I\'ve been monitoring your invoices. Here\'s a quick summary: 3 invoices sent, 1 paid, 1 overdue. Want me to handle the overdue one?',
    timestamp: new Date(),
  },
]

const AI_RESPONSES: Record<string, string> = {
  default: 'I can help you create invoices, follow up on payments, analyze your earnings, or manage your reputation credentials. What would you like to do?',
  invoice: 'Sure! Tell me: who is the client (wallet address), what did you build, and how much should I charge?',
  followup: '✅ Done! I sent a professional payment reminder to 0x3e5f...2b7d. I\'ll monitor for a response and escalate in 48 hours if needed.',
  earnings: 'Your encrypted earnings this month are above your 30-day average. I can\'t reveal the exact amount here — go to the Earnings page and click "Reveal" to see your balance privately.',
  reputation: 'Your ERC-8004 reputation score is 847/1000. You have 12 verified paid invoices and 0 disputes. Want me to generate a reputation certificate you can share?',
}

function getAiResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('invoice') || lower.includes('create')) return AI_RESPONSES.invoice
  if (lower.includes('follow') || lower.includes('remind') || lower.includes('overdue')) return AI_RESPONSES.followup
  if (lower.includes('earn') || lower.includes('balance') || lower.includes('money')) return AI_RESPONSES.earnings
  if (lower.includes('reputation') || lower.includes('score') || lower.includes('credential')) return AI_RESPONSES.reputation
  return AI_RESPONSES.default
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput]       = useState('')
  const [typing, setTyping]     = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id:        Date.now().toString(),
      role:      'user',
      content:   text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 800))

    const agentMsg: Message = {
      id:        (Date.now() + 1).toString(),
      role:      'agent',
      content:   getAiResponse(text),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, agentMsg])
    setTyping(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const quickActions = [
    'Follow up on overdue invoice',
    'Create a new invoice',
    'Show my reputation score',
    'How are my earnings this month?',
  ]

  return (
    <div
      className="max-w-3xl flex flex-col"
      // FIX: was `style= height: 'calc(100vh - 130px)' ` (invalid JSX)
      style={{ height: 'calc(100vh - 130px)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-800 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/30 to-fhe/30 border border-zinc-700 flex items-center justify-center text-2xl">
          🤖
        </div>
        <div>
          <h2 className="font-semibold text-white">PayMate AI Agent</h2>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Online • Monitoring 5 invoices
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {msg.role === 'agent' && (
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm flex-shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-sm rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'agent'
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                  : 'bg-brand text-black font-medium'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm">🤖</div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
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

      {/* Input */}
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
