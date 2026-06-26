# PayMate

> Your earnings. Your business. Nobody else's.

AI-powered payroll and invoicing for freelancers — instant stablecoin
settlements, FHE-encrypted payments (Zama fhEVM), and portable on-chain
reputation. Built for the Zama Developer Program / Season 3.

This repo is the **corrected, runnable** implementation of the 5 DEV FILES.
Every bug that would have blocked `npm run dev` or contract compile has been
fixed (see [FIXES.md](./FIXES.md) for the full list).

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind |
| Animations | Framer Motion |
| Wallet | RainbowKit + Wagmi + Viem |
| FHE client | fhevmjs (Zama) |
| Contracts | Solidity 0.8.24 + fhEVM + TFHE.sol |
| Contract dev | Hardhat + hardhat-deploy (in `contracts-workspace/`) |
| Testnet | Ethereum Sepolia |

## Structure

```
app/
├── layout.tsx                 ← root: Geist fonts + <Providers>
├── globals.css                ← design tokens + .btn-primary
├── page.tsx                   ← landing
└── app/                       ← app shell (Sidebar + TopBar via layout.tsx)
    ├── layout.tsx
    ├── dashboard/page.tsx
    ├── invoices/{page,new/page}.tsx
    ├── earnings/page.tsx
    ├── reputation/page.tsx
    ├── payouts/page.tsx       ← (stub — not in DEV FILES, sidebar needs it)
    ├── agent/page.tsx
    └── settings/page.tsx      ← (stub — not in DEV FILES, sidebar needs it)
components/
├── Providers.tsx
├── landing/                   ← 8 landing sections
└── app/                       ← Sidebar, TopBar, EncryptedAmount, InvoiceRow, AgentProactiveCard
lib/
├── wagmi.ts                   ← ssr:true fix
├── contracts.ts               ← addresses + ABIs (single source of truth)
└── fhevm.ts                   ← encrypt + reencrypt helpers
contracts-workspace/           ← Hardhat project (merge into fhevm-hardhat-template)
tailwind.config.ts, tsconfig.json, next.config.mjs, postcss.config.js
package.json, .env.local.example, .gitignore
```

## Quick start (frontend)

```bash
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_INFURA_KEY
npm run dev                         # http://localhost:3000
```

With contract addresses left at zero, the app runs in **mock mode**: encrypted
balances show `•••••`, "Reveal" is wired but no on-chain call fires, and
"Create Invoice" simulates success. This is intentional — you get a fully
clickable demo before deploying anything.

## Go live

1. Set up contracts: see [`contracts-workspace/README.md`](./contracts-workspace/README.md)
2. Deploy to Sepolia, copy the 3 printed addresses into `.env.local`
3. `npm run build && npx vercel --prod`

Once addresses are non-zero, `isConfigured()` flips true and the UI uses live
contract reads/writes.

## Docs

- [FIXES.md](./FIXES.md) — every bug fixed vs. the original DEV FILES
- [components/landing/INTEGRATION.md](./components/landing/INTEGRATION.md) — landing-only wiring notes
- [contracts-workspace/README.md](./contracts-workspace/README.md) — contract setup + caveats

## Status

- ✅ Day 1–2: Setup + landing + full app shell + all pages (done, compiles)
- ✅ Day 3–5 contracts: code + tests + deploy script written; **must be merged into the live fhevm-hardhat-template before they compile** (template provides TFHE imports + test helpers)
- ⚠️ Day 6 (reveal flow): `lib/fhevm.ts` is written against fhevmjs 0.6-style API — verify against the exact installed version on first run
- 🔲 Day 7+: TokenOps SDK, E2E test, polish, video, submit
