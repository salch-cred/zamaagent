import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#09090B] border-t border-zinc-800 py-12 px-6">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* PayMate Wordmark */}
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-brand text-black font-bold text-[13px]">P</span>
          <span className="text-white font-semibold text-[16px] tracking-tight">PayMate</span>
          <span className="text-zinc-600 text-xs font-mono ml-3">© 2026 PayMate</span>
        </div>

        {/* Links */}
        <div className="flex gap-6 text-xs font-mono text-zinc-500">
          <a
            href="https://github.com/salch-cred/zamaagent"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.zama.org"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            Zama
          </a>
          <a
            href="https://docs.zama.org"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            fhEVM Docs
          </a>
          <Link href="/app/dashboard" className="hover:text-white transition-colors">
            Launch app
          </Link>
        </div>

        {/* Powered by */}
        <p className="text-[10px] text-zinc-600 font-mono">
          Powered by Zama fhEVM • Built for Zama Developer Program Season 3
        </p>

      </div>
    </footer>
  )
}
