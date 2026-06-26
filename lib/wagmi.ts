import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// FIX vs DEV FILE 1: added `ssr: true`. Without it, Next.js App Router
// throws "WagmiProvider must be used with ssr: true" because the root
// layout is a Server Component and the Providers wrapper hydrates on the
// client — wagmi requires the SSR flag to reconcile initial state.
export const config = createConfig({
  ssr: true,
  chains: [mainnet, sepolia],
  connectors: [
    metaMask(),
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`),
  },
})

export const supportedChains = { mainnet, sepolia }
