# PayMate — Confidential Payroll & Invoicing on Zama Protocol

> **Private by design. Composable by default.**  
> Your salary is nobody's business — not your employer's competitors, not MEV bots, not anyone scanning Etherscan.

Built for the **Zama Developer Program Mainnet Season 3** — *Composable Privacy is the Key.*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org)
[![Network](https://img.shields.io/badge/Network-Sepolia-purple.svg)](https://sepolia.etherscan.io)
[![FHE](https://img.shields.io/badge/FHE-Zama%20Protocol-22C55E.svg)](https://docs.zama.org)

---

## 🔐 Why FHE — Not ZK, Not MPC

| Property | ZK Proofs | MPC | **FHE (PayMate)** |
|---|---|---|---|
| **Amounts hidden on-chain** | ❌ public | ✅ | ✅ |
| **Composable with DeFi** | Limited | ❌ | ✅ |
| **No trusted setup** | ⚠️ some schemes | ✅ | ✅ |
| **Compute on encrypted state** | ❌ | ❌ | ✅ |
| **EVM-native** | ⚠️ via circuits | ❌ | ✅ |
| **Recipient self-decrypt** | ❌ | ❌ | ✅ |

With FHE, salary amounts remain **encrypted at rest, in transit, and during computation**. A Morpho vault can earn yield on encrypted payroll balances. An AI agent can check if invoices are overdue without seeing the amounts. This is impossible with ZK or MPC.

---

## 🏗️ Architecture

```
╔══════════════════════════════════════════════════════════════════╗
║                        PAYMATE dAPP                              ║
╠══════════════════════════════════════════════════════════════════╣
║  Next.js 14 Frontend (App Router)                                ║
║  ┌─────────────┐  ┌───────────────┐  ┌─────────────────────┐    ║
║  │   Wagmi /   │  │  fhevmjs 0.6  │  │  Re-encryption UX   │    ║
║  │  RainbowKit │  │  encrypt()    │  │  reencrypt() flow   │    ║
║  └──────┬──────┘  └───────┬───────┘  └──────────┬──────────┘    ║
║         └─────────────────┴──────────────────────┘               ║
╠══════════════════════════════════════════════════════════════════╣
║  Ethereum Sepolia Testnet                                        ║
║  ┌───────────────────┐   ┌───────────────────┐                  ║
║  │ ConfidentialPayroll│  │ ConfidentialInvoice│                  ║
║  │  euint64 salaries  │  │  euint64 amounts   │                  ║
║  │  FHE underflow ✓   │  │  dispute logic     │                  ║
║  └────────┬──────────┘   └────────┬───────────┘                  ║
║           │                       │                               ║
║  ┌────────┴──────────┐   ┌────────┴───────────┐                  ║
║  │  ReputationRegistry│  │  ConfidentialAirdrop│                  ║
║  │  ERC-8004 scores   │  │  TokenOps bounty    │                  ║
║  │  dispute-weighted  │  │  encrypted allocs   │                  ║
║  └───────────────────┘   └────────────────────┘                  ║
╠══════════════════════════════════════════════════════════════════╣
║  Zama FHE Coprocessor (off-chain, threshold decryption)          ║
║  ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐      ║
║  │  ACL Contract│  │  KMS Gateway│  │  Encrypted handles │      ║
║  │  access ctrl │  │  reencrypt  │  │  euint64 → ehandle │      ║
║  └──────────────┘  └─────────────┘  └────────────────────┘      ║
╠══════════════════════════════════════════════════════════════════╣
║  Composability Layer (Season 3: Composable Privacy)              ║
║  ┌──────────────────────┐   ┌──────────────────────────────┐    ║
║  │   Morpho Vaults       │   │   x402 AI Agent Payments     │    ║
║  │   4-8% APY on idle    │   │   HTTP-native USDC micro-pay │    ║
║  │   payroll float       │   │   for AI tool calls          │    ║
║  └──────────────────────┘   └──────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## ✨ What Makes PayMate Different From Every Other Payroll dApp

### 1. True End-to-End Encryption
Every salary, invoice amount, and balance is a `euint64` ciphertext. The contract processes additions and comparisons **directly on encrypted data** — no decryption step ever runs on-chain.

### 2. Re-encryption: Only You See Your Balance
Using fhevmjs `reencrypt()`, employees can decrypt their own balance using their wallet key pair — but the employer, the blockchain, and every other observer sees only a ciphertext handle. This is the core FHE superpower.

### 3. Composable with Morpho Vaults
Idle payroll balances earn **4–8% APY** via Morpho USDC vaults between pay cycles. The yield compounds while amounts stay encrypted. No other payroll protocol does this.

### 4. AI Agent with FHE Awareness
The on-chain AI agent detects overdue invoices, salary disputes, and reputation drops — without ever reading the actual amounts. It operates on encrypted state via FHE comparison operators.

### 5. TokenOps Special Bounty: Confidential Airdrop
Full `/app/airdrop` module — admin uploads recipient list with encrypted amounts, recipients claim and self-decrypt their allocation. Directly targets Zama's 2,500 cUSDT Special Bounty.

---

## 📦 Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 App Router + TypeScript + Tailwind CSS |
| Wallet | RainbowKit + Wagmi v2 + Viem |
| FHE Client | fhevmjs 0.6 (Zama SDK) |
| Animations | Framer Motion |
| Contracts | Solidity 0.8.24 + TFHE.sol + fhEVM |
| Contract Dev | Hardhat + hardhat-deploy |
| Testing | Hardhat test suite (ReputationRegistry, Payroll, Airdrop) |
| Testnet | Ethereum Sepolia (chainId 11155111) |
| Composability | Morpho Vaults (yield), x402 (AI agent payments) |
| Standards | ERC-8004 (reputation), ERC-7984 (confidential token, roadmap) |

---

## 🗂️ Repository Structure

```
app/
├── layout.tsx                  ← Geist fonts + <Providers>
├── globals.css                 ← design tokens (#09090B bg, #22C55E brand)
├── page.tsx                    ← landing page
└── app/                        ← authenticated app shell
    ├── layout.tsx              ← Sidebar + TopBar
    ├── dashboard/page.tsx      ← live on-chain dashboard
    ├── invoices/page.tsx       ← invoice list with DISPUTED tab
    ├── invoices/new/page.tsx   ← create invoice with FHE encrypt
    ├── earnings/page.tsx       ← live payroll balance + reveal
    ├── reputation/page.tsx     ← on-chain ERC-8004 score
    ├── payouts/page.tsx        ← withdraw encrypted balance
    ├── airdrop/page.tsx        ← TokenOps Special Bounty ← NEW
    ├── agent/page.tsx          ← AI agent with live FHE context
    └── settings/page.tsx       ← contract addresses + deploy
components/
├── Providers.tsx
├── landing/                    ← 11 landing sections
└── app/
    ├── Sidebar.tsx
    ├── TopBar.tsx
    ├── EncryptedAmount.tsx     ← live euint64 decrypt
    ├── ReencryptButton.tsx     ← full re-encryption UX ← NEW
    ├── MorphoYieldCard.tsx     ← composability yield card ← NEW
    ├── InvoiceRow.tsx
    └── AgentProactiveCard.tsx
lib/
├── wagmi.ts                    ← chain config + SSR fix
├── contracts.ts                ← addresses + all ABIs
├── fhevm.ts                    ← encrypt + reencrypt helpers
└── reencrypt.ts                ← re-encryption flow hook ← NEW
contracts-workspace/
├── contracts/
│   ├── ConfidentialPayroll.sol  ← FHE underflow guard, removeEmployee
│   ├── ConfidentialInvoice.sol  ← dispute logic
│   ├── ConfidentialAirdrop.sol  ← TokenOps bounty contract
│   └── ReputationRegistry.sol   ← ERC-8004, dispute-weighted score
├── deploy/01_deploy_all.ts
└── test/                        ← 20+ tests
ARCHITECTURE.md                  ← deep architecture doc ← NEW
SECURITY.md                      ← FHE security model
LICENSE                          ← MIT
```

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_INFURA_KEY at minimum

# 3. Run (mock mode — no contracts needed)
npm run dev
# → http://localhost:3000
```

**Mock mode**: encrypted balances show `•••••`, all UI is fully clickable, re-encryption simulates success. Perfect for demo before deployment.

---

## 🔗 Go Live on Sepolia

```bash
# Contracts
cd contracts-workspace
npm install
npx hardhat compile
npx hardhat test          # 20+ tests must pass
npx hardhat deploy --network sepolia
# → prints 4 addresses

# Frontend
cd ..
# Fill .env.local with the 4 contract addresses
npm run build
npx vercel --prod
```

### Live Deployed Contracts (update after deploy)
| Contract | Sepolia Address |
|---|---|
| ConfidentialPayroll | `pending deploy` |
| ConfidentialInvoice | `pending deploy` |
| ConfidentialAirdrop | `pending deploy` |
| ReputationRegistry | `pending deploy` |

---

## 🏆 Tracks & Prizes

| Track | Prize | Status |
|---|---|---|
| **Builder Track** | 7,000 cUSDT (7 × 1,000) | Targeting ✅ |
| **Special Bounty (TokenOps)** | 2,500 cUSDT | Targeting ✅ |
| **Bounty Track** | 3,000 cUSDT | Targeting ✅ |

**Deadline: July 07 2026 23:59 AOE**  
**Submit:** https://forms.zama.org/developer-program-mainnet-season3-builder-track

---

## 🔐 FHE Security Model

See [SECURITY.md](./SECURITY.md) for detailed analysis of:
- Encrypted handle access control (ACL contract)
- Threshold decryption via KMS Gateway  
- FHE underflow guard in payroll contract
- Re-encryption vs public decryption
- What an attacker on Etherscan sees (only ciphertext handles)

---

## 📐 Composability Proof

Season 3 theme is *Composable Privacy*. PayMate demonstrates three FHE composability patterns:

1. **Payroll → ReputationRegistry**: invoice completion updates encrypted reputation score
2. **Payroll → Morpho Vault**: idle float earns yield while amounts stay encrypted  
3. **Invoice → AI Agent**: agent monitors encrypted invoices for overdue status via FHE comparisons

---

## 📹 Video Demo Script (3 min)

See [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for the judge-optimized 3-minute demo structure.

---

## 📄 License

MIT — see [LICENSE](./LICENSE)
