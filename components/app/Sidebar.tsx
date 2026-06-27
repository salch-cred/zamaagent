'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'

const navItems = [
  { icon: '🏠', label: 'Dashboard',  href: '/app/dashboard'  },
  { icon: '📄', label: 'Invoices',   href: '/app/invoices'   },
  { icon: '💰', label: 'Earnings',   href: '/app/earnings'   },
  { icon: '🔐', label: 'Vesting',    href: '/app/vesting'    },
  { icon: '🏆', label: 'Reputation', href: '/app/reputation' },
  { icon: '⚡',  label: 'Payouts',    href: '/app/payouts'    },
  { icon: '🎁', label: 'Airdrop',    href: '/app/airdrop',   badge: 'Bounty' },
  { icon: '🗂️', label: 'Wrappers',  href: '/app/wrappers',  badge: 'Bounty' },
  { icon: '📜', label: 'History',    href: '/app/history'    },
  { icon: '🤖', label: 'AI Agent',   href: '/app/agent'      },
  { icon: '⚙️', label: 'Settings',  href: '/app/settings'   },
]

export function Sidebar() {
  const pathname    = usePathname()
  const { address } = useAccount()

  const short = address
    ? address.slice(0, 6) + '...' + address.slice(-4)
    : 'Not connected'

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col z-40">

      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-black font-bold text-sm">
            P
          </div>
          <div>
            <span className="font-semibold text-white text-lg tracking-tight">PayMate</span>
            <div className="text-[10px] text-zinc-500 leading-none mt-0.5">Zama fhEVM • Season 3</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const baseClass = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all '
          const activeClass = 'bg-zinc-800 text-white font-medium'
          const inactiveClass = 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          return (
            <Link
              key={item.href}
              href={item.href}
              className={baseClass + (isActive ? activeClass : inactiveClass)}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* FHE Status */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse flex-shrink-0" />
          <span className="text-[10px] text-zinc-500">FHE coprocessor active</span>
        </div>
      </div>

      {/* Wallet footer */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center flex-shrink-0">
            <span className="text-xs">⚡</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-zinc-500">Connected</div>
            <div className="text-xs text-zinc-300 font-mono truncate">{short}</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}
