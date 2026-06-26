import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// FIX vs DEV FILE 1: added `ssr: true`. Without it, Next.js App Router
// throws "WagmiProvider must be used with ssr: true" because the root
// layout is a Server Component and the Providers wrapper hydrates on the
// client — wagmi requires the SSR flag to reconcile initial state.
//
// FIX: the Sepolia RPC URL previously had stray ` ` braces wrapping the
// template literal (a Notion compressed-URL artifact) which broke the build.
// We now build the URL cleanly and fall back to wagmi's default public RPC
// when no Infura key is configured (http(undefined) -> chain default RPC).
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_INFURA_KEY
  ? `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
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
