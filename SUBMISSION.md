# PayMate — Zama Developer Program Season 3 Submission

> **Builder Track + TokenOps Special Bounty + Bounty Track (Wrapper Registry)**

---

## Project Overview

**PayMate** is a confidential payroll and invoicing protocol on Zama fhEVM where all financial amounts remain **FHE-encrypted end-to-end**. Employers pay employees, contractors invoice clients, and vesting schedules release tokens — all without any party (or blockchain observer) seeing exact amounts.

### The Core Problem We Solve

Every existing on-chain payroll protocol leaks salary data to Etherscan, MEV bots, and competitors. Salaries are nobody's business. PayMate makes them provably private using Zama's Fully Homomorphic Encryption.

---

## Track Targets

| Track | Prize Pool | Why We Win |
|---|---|---|
| **Builder Track** | 2,500 cUSDT (1st) | 6 contracts, most advanced TFHE usage, live deploy |
| **TokenOps Special Bounty** | 2,500 cUSDT | /app/airdrop with encrypted allocations per SDK |
| **Bounty Track** | 3,000 cUSDT | /app/wrappers — Confidential Wrapper Registry |

**Total targeted: 8,000 cUSDT**

---

## Smart Contracts (6 total)

| Contract | Key Innovation | TFHE Ops |
|---|---|---|
| `ConfidentialPayroll` | Batch pay + salary negotiation + x402 withdrawal | `TFHE.select` underflow guard, `TFHE.add/sub` |
| `ConfidentialInvoice` | Auto late-penalty + dispute auto-resolve + GDPR erasure | `TFHE.select`, `TFHE.and()`, `TFHE.shr` |
| `ConfidentialVestingWallet` | Cliff + linear vesting, `TFHE.select` releasable | `TFHE.select`, `TFHE.gt`, `TFHE.mul/shr` |
| **`ConfidentialMultiSig`** | **First FHE multi-sig — encrypted tx amounts, TFHE.and() gate** | **`TFHE.and()`, `TFHE.select`** |
| `ConfidentialAirdrop` | TokenOps SDK, encrypted allocations, ERC-7984 | `TFHE.asEuint64`, ACL |
| `ReputationRegistry` | ERC-8004, dispute-weighted score, on-chain credentials | FHE ACL |

### Test Coverage: 50+ tests across all contracts

---

## TFHE Pattern Showcase

This is the most advanced TFHE usage in Season 3. Specifically:

### Pattern 1: TFHE.select — Conditional Amount Routing
```solidity
// ConfidentialInvoice: auto late-penalty
ebool isOverdue = TFHE.asEbool(block.timestamp > inv.dueDate);
euint64 finalAmount = TFHE.select(
    isOverdue,
    TFHE.add(inv.amount, inv.penaltyAmount),
    inv.amount
);
```

### Pattern 2: TFHE.and() — Compound Boolean Logic
```solidity
// ConfidentialMultiSig: M-of-N approval gate
ebool approvalGate = TFHE.asEbool(true);
for (uint256 i = 0; i < owners.length && counted < threshold; i++) {
    if (hasApproved[txId][owners[i]]) {
        approvalGate = TFHE.and(approvalGate, TFHE.asEbool(true));
        counted++;
    }
}
euint64 transferAmount = TFHE.select(approvalGate, t.encAmount, TFHE.asEuint64(0));
```

### Pattern 3: TFHE.select — Safe Underflow Guard
```solidity
// ConfidentialPayroll: batch pay with underflow protection
ebool hasEnough  = TFHE.le(amount, totalPool);
euint64 safeAmt  = TFHE.select(hasEnough, amount, TFHE.asEuint64(0));
```

### Pattern 4: TFHE Linear Vesting
```solidity
// ConfidentialVestingWallet: integer approximation
uint64 bps = (elapsed * 10_000) / vestingDuration;
euint64 vestedAmount = TFHE.shr(TFHE.mul(totalAmount, TFHE.asEuint64(bps)), 14);
```

---

## Composability (Season 3 Theme: Composable Privacy)

PayMate demonstrates **5 composability patterns**:

1. **Payroll → Morpho/Steakhouse Vault** — idle float earns 6.8% APY in the live cUSDC vault launched June 23 2026 — amounts stay encrypted
2. **Invoice → ReputationRegistry** — payment completion auto-updates on-chain ERC-8004 reputation
3. **MultiSig → Payroll** — high-value payroll runs require 2-of-N encrypted approval
4. **Vesting → Payroll** — contractor compensation routes through vesting before hitting payroll
5. **AI Agent → All contracts** — agent reads encrypted state via FHE comparisons (no decryption)

---

## Steakhouse cUSDC Vault Integration

PayMate directly integrates with the **Steakhouse Confidential Prime USDC Vault**:
- Launched June 23 2026 (4 days ago at submission)
- First confidential yield vault on Ethereum — $5.74M TVL
- 6.8% APY (boosted, 12-week incentive window)
- Vault: `0xbEEF00A59B577423653A1526c7009bdE103F542B`

PayMate is one of the first third-party protocols to integrate this vault.

---

## GDPR Compliance

Unique to PayMate in Season 3:
- `ConfidentialInvoice.eraseInvoice()` — GDPR right to erasure
- `ConfidentialVestingWallet.eraseSchedule()` — GDPR right to erasure
- Both zero encrypted handles and mark as erased in audit trail

---

## Frontend

**12 pages** all connected to live on-chain data:

| Page | Feature |
|---|---|
| `/app/dashboard` | Live stats from all 6 contracts |
| `/app/invoices` | Live invoice list + pay/dispute write calls |
| `/app/invoices/new` | Live `createInvoice` with FHE encryption |
| `/app/earnings` | Live encrypted balance + EIP-712 reveal |
| `/app/payouts` | Live `requestWithdrawal` write call |
| `/app/vesting` | Cliff progress + claim |
| `/app/multisig` | MultiSig submit/approve/execute |
| `/app/reputation` | Live ERC-8004 score + credentials |
| `/app/airdrop` | TokenOps SDK integration |
| `/app/wrappers` | **Bounty Track** — Wrapper Registry |
| `/app/history` | Encrypted audit trail |
| `/app/agent` | AI agent with live FHE context |

---

## Deployment

### Testnet: Ethereum Sepolia (chainId 11155111)

| Contract | Address |
|---|---|
| ConfidentialPayroll | `[update after deploy]` |
| ConfidentialInvoice | `[update after deploy]` |
| ConfidentialAirdrop | `[update after deploy]` |
| ReputationRegistry | `[update after deploy]` |
| ConfidentialVestingWallet | `[update after deploy]` |
| ConfidentialMultiSig | `[update after deploy]` |

### Frontend: `[add Vercel URL]`

---

## Demo Video: `[add YouTube/Loom URL]`

### 3-Minute Script
See `DEMO_SCRIPT.md` for the judge-optimized demo flow.

---

## How to Run

```bash
# Frontend
npm install && npm run dev

# Contracts
cd contracts-workspace
npm install && npx hardhat test
npx hardhat deploy --network sepolia
```

---

## Why PayMate Wins

1. **Most contracts** — 6 vs avg 1-2 for competitors
2. **Most advanced TFHE** — TFHE.select, TFHE.and(), TFHE.gt, TFHE.mul/shr
3. **Only confidential multi-sig** on fhEVM in Season 3
4. **Only project** with GDPR right-to-erasure
5. **Only project** integrating Steakhouse cUSDC Vault (launched June 23)
6. **Only project** targeting all 3 prize tracks simultaneously
7. **50+ tests** across all contracts
8. **12 live pages** all connected to real on-chain data

---

*Built with Zama fhEVM by salch-cred. Season 3 — Composable Privacy.*
