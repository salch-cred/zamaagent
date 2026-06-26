# PayMate Landing — Integration Notes

These 9 files are the **fixed** landing UI from DEV FILE 2. Drop them into an
existing Next.js 14 (App Router, TypeScript, Tailwind) project using the
`@/*` import alias.

## Files delivered

```
app/page.tsx                          ← landing route
components/landing/
├── Navbar.tsx
├── Hero.tsx
├── DashboardPreview.tsx
├── Marquee.tsx
├── Features.tsx
├── HowItWorks.tsx
├── CtaSection.tsx
└── Footer.tsx
```

## Required dependencies

```bash
npm install framer-motion @rainbow-me/rainbowkit wagmi viem
```

`Navbar`, `Hero`, and `CtaSection` use `<ConnectButton.Custom>` from
RainbowKit — they must be rendered inside `<WagmiProvider>` +
`<RainbowKitProvider>`. Your root `app/layout.tsx` needs a `<Providers>`
wrapper exactly as in DEV FILE 1 Step 3.

## Required Tailwind tokens (from DEV FILE 1 Step 2)

These components reference tokens that **must** exist in `tailwind.config.ts`
or the classes silently no-op:

| Token | Used by |
| --- | --- |
| `colors.brand` (`#22C55E`), `brand-dark` | Navbar, Hero, Features, CtaSection, Footer |
| `colors.fhe` (`#8B5CF6`) | Hero glow, AgentCard avatar |
| `backgroundImage['grid-zinc']` + `backgroundSize.grid` | Hero grid bg (`bg-grid-zinc bg-grid`) |
| `boxShadow['glow-green']` | Navbar / CtaSection hover |
| `animation.marquee` + `keyframes.marquee` | Marquee |
| `fontFamily.mono` → `var(--font-geist-mono)` | All the `font-mono` stat numbers |

Without `tailwindcss-animate` in plugins, `animate-pulse` etc. still work
(those are core), but `animate-marquee` is custom — keep the keyframes.

## Required CSS class (from DEV FILE 1 Step 4)

`globals.css` must define `.btn-primary`, used by Hero and CtaSection:

```css
.btn-primary {
  @apply bg-brand text-black font-semibold rounded-xl px-8 py-4 text-lg;
  @apply transition-all duration-200;
  @apply hover:bg-brand-dark hover:scale-105 hover:shadow-glow-green;
}
```

## Bugs I fixed vs. the original DEV FILE 2

The source doc had JSX corruption where `={{ ... }}` object expressions were
flattened to bare `= ...`, which **does not compile**. Reconstructed:

| File | Fix |
| --- | --- |
| `DashboardPreview.tsx` | `motion.div` — `initial` / `animate` / `transition` restored as object props |
| `Features.tsx` | `motion.div` — `initial` / `whileInView` / `viewport` / `transition` restored |
| `HowItWorks.tsx` | same `motion.div` fix |
| `Hero.tsx` | `fadeUp()` ease array typed `as const` (TS needs tuple, not `number[]`) |

Also a small correctness fix: the original Hero headline rendered the literal
apostrophe in `else's` unescaped — JSX would warn. Replaced with
`&quot;`/`&apos;`-style `Nobody else&apos;s`.

## Layout root note

`app/page.tsx` is a **Server Component**. It imports the client components
above (each has `'use client'`). That's the standard App Router pattern — no
changes needed, but make sure your `app/layout.tsx` wraps children in
`<Providers>` (Wagmi + RainbowKit) or the Connect buttons throw.

## Next step

When you're ready to wire up the app shell + dashboard (DEV FILE 3), the same
`DashboardPreview.tsx` bugs (motion props) reappear in DEV FILE 3's
`dashboard/page.tsx` and `agent/page.tsx` (broken `style={{ ... }}`). I'll
fix those the same way when we get there.
