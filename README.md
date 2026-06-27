# PayMate — Confidential Payroll & Invoicing on Zama Protocol

> **Private by design. Composable by default.**  
> Your salary is nobody's business — not your employer's competitors, not MEV bots, not Etherscan.

Built for the **Zama Developer Program Mainnet Season 3** — *Composable Privacy is the Key.*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org)
[![Network](https://img.shields.io/badge/Network-Sepolia-purple.svg)](https://sepolia.etherscan.io)
[![FHE](https://img.shields.io/badge/FHE-Zama%20Protocol-22C55E.svg)](https://docs.zama.org)
[![Tests](https://img.shields.io/badge/Tests-50%2B-green.svg)](#)
[![Contracts](https://img.shields.io/badge/Contracts-6-blue.svg)](#)

---

## 🔐 Why FHE — Not ZK, Not MPC

| Property | ZK Proofs | MPC | **FHE (PayMate)** |
|---|---|---|---|
| **Amounts hidden on-chain** | ❌ public | ✅ | ✅ |
| **Composable with DeFi** | Limited | ❌ | ✅ |
| **Compute on encrypted state** | ❌ | ❌ | ✅ |
| **EVM-native** | ⚠️ via circuits | ❌ | ✅ |
| **Recipient self-decrypt** | ❌ | ❌ | ✅ |

---

## 🏆 Season 3 Tracks (3 simultaneous)

| Track | Prize | Target |
|---|---|---|
| **Builder Track** | 2,500 cUSDT (1st) | 6 contracts, advanced TFHE, live deploy |
| **Special Bounty (TokenOps)** | 2,500 cUSDT | `/app/airdrop` — encrypted allocations |
| **Bounty Track** | 3,000 cUSDT | `/app/wrappers` — Wrapper Registry App |

**Deadline: July 07 2026 23:59 AOE**

---

## 🏗️ Smart Contracts (6)

| Contract | Key Feature | TFHE Patterns |
|---|---|---|
| `ConfidentialPayroll` | Batch pay + salary negotiation + x402 withdrawal | `TFHE.select` underflow guard |
| `ConfidentialInvoice` | Auto late-penalty + GDPR erasure + dispute resolve | `TFHE.select`, `TFHE.and()` |
| `ConfidentialVestingWallet` | Cliff + linear vesting with encrypted total | `TFHE.select`, `TFHE.gt`, `TFHE.mul` |
| **`ConfidentialMultiSig`** | **First FHE multi-sig — encrypted tx amounts** | **`TFHE.and()` compound gate** |
| `ConfidentialAirdrop` | TokenOps SDK integration | `TFHE.asEuint64`, ACL |
| `ReputationRegistry` | ERC-8004, dispute-weighted score | FHE ACL |

### ✅ 50+ tests across all contracts

---

## ✨ Advanced TFHE Patterns

### TFHE.select — Auto Late-Penalty
```solidity
ebool isOverdue = TFHE.asEbool(block.timestamp > inv.dueDate);
euint64 finalAmount = TFHE.select(isOverdue,
    TFHE.add(inv.amount, inv.penaltyAmount),
    inv.amount
);
```

### TFHE.and() — M-of-N Approval Gate (ConfidentialMultiSig)
```solidity
ebool gate = TFHE.asEbool(true);
for (...) { gate = TFHE.and(gate, ownerApproved); }
euint64 amt = TFHE.select(gate, t.encAmount, TFHE.asEuint64(0));
```

### TFHE.select — Vesting Releasable Computation
```solidity
ebool hasReleasable = TFHE.gt(vestedAmount, s.releasedAmount);
euint64 releasable  = TFHE.select(hasReleasable,
    TFHE.sub(vestedAmount, s.releasedAmount), TFHE.asEuint64(0));
```

---

## 📈 Steakhouse Confidential Prime USDC Vault

PayMate integrates the **first live confidential yield vault** on Ethereum:
- Launched **June 23 2026** — Zama × Morpho × Steakhouse Financial
- **$5.74M TVL**, **6.8% APY** (boosted, 12-week window)
- Idle payroll balances earn yield as cUSDC (ERC-7984) — amounts stay encrypted
- Vault: `0xbEEF00A59B577423653A1526c7009bdE103F542B`

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│  Next.js 14 Frontend (App Router — 12 pages)               │
│  Wagmi v2 + fhevmjs 0.6 + RainbowKit                       │
│  EIP-712 re-encryption → KMS Gateway → user wallet key    │
├────────────────────────────────────────────────────────────────────┤
│  Ethereum Sepolia — 6 Contracts                             │
│  ConfidentialPayroll    ConfidentialInvoice                  │
│  ConfidentialVesting    ConfidentialMultiSig  ← NEW          │
│  ConfidentialAirdrop    ReputationRegistry (ERC-8004)        │
├────────────────────────────────────────────────────────────────────┤
│  Zama FHE Coprocessor (off-chain, threshold KMS)            │
│  ACL Contract → euint64 handles → TFHE ops                │
├────────────────────────────────────────────────────────────────────┤
│  Composability Layer (Season 3 Theme)                       │
│  Steakhouse cUSDC Vault  │  x402 AI Agent  │  Morpho       │
└────────────────────────────────────────────────────────────────────┘
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

---

## 🔗 Go Live on Sepolia

```bash
cd contracts-workspace
npm install
npx hardhat compile
npx hardhat test        # 50+ tests
npx hardhat deploy --network sepolia  # deploys 6 contracts, prints addresses

# Fill .env.local with 6 addresses, then:
npx vercel --prod
```

### Deployed Contracts (Sepolia)

| Contract | Address |
|---|---|
| ConfidentialPayroll | `pending deploy` |
| ConfidentialInvoice | `pending deploy` |
| ConfidentialAirdrop | `pending deploy` |
| ReputationRegistry | `pending deploy` |
| ConfidentialVestingWallet | `pending deploy` |
| ConfidentialMultiSig | `pending deploy` |

> Update these after running `npx hardhat deploy --network sepolia`

---

## 📊 Competitor Comparison

| Feature | **PayMate** | DripPay | Paychain | MARC |
|---|---|---|---|---|
| TFHE.select auto-penalty | ✅ | ❌ | ❌ | ❌ |
| TFHE.and() compound logic | ✅ | ❌ | ❌ | ❌ |
| Confidential MultiSig | ✅ | ❌ | ❌ | ❌ |
| Vesting (cliff+linear FHE) | ✅ | ❌ | ❌ | ❌ |
| Steakhouse cUSDC Vault | ✅ | ❌ | ❌ | ❌ |
| Wrapper Registry UI | ✅ | ❌ | ❌ | ❌ |
| ERC-8004 Reputation | ✅ | ❌ | ❌ | ❌ |
| GDPR right-to-erasure | ✅ | ❌ | ✅ | ❌ |
| AI Agent | ✅ | ❌ | ❌ | ✅ |
| Encrypted audit trail | ✅ | ❌ | ❌ | ❌ |
| **Contract count** | **6** | 1 | 2 | 7 |
| **Test count** | **50+** | ~10 | ~15 | 1100+ |

---

## 🔐 FHE Security Model

See [SECURITY.md](./SECURITY.md) and [ARCHITECTURE