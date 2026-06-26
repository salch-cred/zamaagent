import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// FIX vs DEV FILE 1: added `ssr: true`. Without it, Next.js App Router
// throws "WagmiProvider must be used with ssr: true" because the root
// layout is a Server Component and the Providers wrapper hydrates on the
// client. wagmi requires the SSR flag to reconcile initial state.
//
// FIX: the Sepolia RPC URL previously had stray brace artifacts wrapping a
// template literal, which broke the build. We build it with plain string
// concatenation (no template literal) and fall back to wagmi's default
// public RPC when no Infura key is set (http(undefined) -> chain default).
const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY
const sepoliaRpcUrl = INFURA_KEY
  ? 'https://sepolia.infura.io/v3/' + INFURA_KEY
  : undefined

export const config = createConfig({
  ssr: true,
  chains: [mainnet, sepolia],
  connectors: [
    metaMask(),
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(sepoliaRpcUrl),
  },
})

export const supportedChains = { mainnet, sepolia }
