# FIXES.md — Bugs corrected vs. the original DEV FILES

The source DEV FILES had several classes of defect that would have prevented
the project from compiling or running. Every one is fixed in this repo.

## 1. JSX corruption: `={{ ... }}` flattened to `= ...` (would not compile)

The most damaging class. Object-valued JSX props were written without their
outer braces, producing invalid syntax. Fixed in:

| File | What broke |
| --- | --- |
| `components/landing/DashboardPreview.tsx` | `motion.div` `initial` / `animate` / `transition` |
| `components/landing/Features.tsx` | `motion.div` `initial` / `whileInView` / `viewport` / `transition` |
| `components/landing/HowItWorks.tsx` | same motion props |
| `app/app/dashboard/page.tsx` | `style={{ width: '84.7%' }}` |
| `app/app/agent/page.tsx` | `style={{ height: 'calc(100vh - 130px)' }}` |
| `app/app/reputation/page.tsx` | `style={{ transition: 'stroke-dasharray 1s ease' }}` |

All restored to valid `prop={{ ... }}` syntax.

## 2. Wagmi `ssr: true` missing (`lib/wagmi.ts`)

Next.js App Router renders the root layout on the server; wagmi requires
`createConfig({ ssr: true })` to reconcile hydration state. Without it the
app throws on boot. Added.

## 3. `lib/fhevm.ts` used a non-existent fhevmjs API

The original called `instance.generateKeypair()`,
`instance.createEIP712()`, and a 6-arg `instance.reencrypt(...)`. None of
those match the shipped fhevmjs surface. Rewritten against the real flow:
`createInstance` → `createEncryptedInput` / `createKeypair` →
`signTypedData` (EIP-712) → `reencrypt`. Handle type corrected from
`bigint` to `0x${string}` (bytes32) to match what on-chain view fns return.

> Still verify against the exact installed fhevmjs version on Day 6 — the
> reencrypt signature has shifted between 0.5 / 0.6 / 0.7. Isolated in
> `lib/fhevm.ts` so it's a one-file change.

## 4. Contract ↔ ABI ↔ form mismatch on `createInvoice`

- Solidity `ConfidentialInvoice.createInvoice` takes **5 args** incl. `dueDate`.
- DEV FILE 1 ABI listed **4 args** (no `dueDate`).
- DEV FILE 4 form never sent a `dueDate`.

The contract requires `dueDate > block.timestamp`, so the original would have
**reverted at runtime**. Fixed in three places:
- `lib/contracts.ts` → ABI has `dueDate`.
- `app/app/invoices/new/page.tsx` → converts the date input to a unix
  timestamp (defaults to +14d) and passes it as the 5th arg.

## 5. shadcn/ui token references with no Tailwind mapping

DEV FILE 1's `tailwind.config.ts` defined `brand`/`fhe` but omitted the
shadcn semantic tokens (`border`, `background`, `foreground`, `primary`,
`muted`, `card`, …). shadcn components reference `border-border`,
`bg-background`, etc. — without the mapping they'd render unstyled. Added the
full token set bound to the HSL CSS variables in `globals.css`, plus
`borderRadius` mapping.

## 6. `QueryClient` created at module scope (`components/Providers.tsx`)

Under App Router, a shared module-scope `QueryClient` leaks cache across
requests/users. Moved to `useState(() => new QueryClient())` inside the
component.

## 7. Apostrophes in JSX text unescaped

`Nobody else's`, `Here's`, `I'll`, `Ethereum's`, etc. — JSX warns on bare
apostrophes in text nodes. Replaced with `&apos;` / `&quot;` where needed.

## 8. Unescaped generic `catch (e: any)` under strict TS

`app/app/invoices/new/page.tsx` used `catch (e: any)` and `e?.message`.
With `strict: true` and the modern `useUnknownInCatchVariables` default,
`e` is `unknown`. Changed to `catch (e: unknown)` + `instanceof Error`
narrowing. Same for the `EncryptedAmount` catch (dropped the unused binding).

## 9. Missing pages the sidebar links to

`Sidebar.tsx` lists `/app/payouts` and `/app/settings`, but DEV FILES 3/4
never created those routes — clicking them would 404. Added both as
functional stubs (payouts withdraw form, settings showing wallet/privacy/
deploy status).

## 10. Build/tooling gaps

- Added `tsconfig.json` (excludes `contracts-workspace` so Hardhat's types
  don't collide with Next's).
- Added `next.config.mjs` with `transpilePackages: ['fhevmjs']` (fhevmjs is
  CJS; App Router needs this to import it from client code).
- Added `postcss.config.js`, `.gitignore`, `next-env.d.ts`,
  `.env.local.example`.
- `package.json` pins compatible versions across the wagmi/viem/rainbowkit
  v2 + Next 14 + React 18 set.

## 11. Contracts: template-version assumptions (documented, not silently "fixed")

The 3 contracts import `SepoliaZamaFHEVMConfig`, `GatewayCaller`, and the
tests import `./instance` + `./signers`. The exact names/paths of these have
changed across fhevm-hardhat-template versions, so I did **not** fabricate
them — instead `contracts-workspace/README.md` documents that these files
must be merged into the live template, which provides the helpers. Forcing
made-up import paths would just produce a different compile error.
