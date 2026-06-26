# PayMate — Contracts Workspace

Smart contracts for PayMate (DEV FILE 5). These are written against Zama's
`fhevm-hardhat-template` and **must be merged into that template** — they are
not a standalone Hardhat project.

## ⚠️ Read this before running anything

DEV FILE 5's setup instructs you to clone the fhevm-hardhat-template and drop
these files in. That template provides several things these files **depend on
but do not include**:

| Dependency | Provided by template? | Used by |
| --- | --- | --- |
| `fhevm/lib/TFHE.sol`, `fhevm/config/ZamaFHEVMConfig.sol`, `fhevm/gateway/GatewayCaller.sol` | ✅ via npm `fhevm` package + remappings | all 3 contracts |
| `SepoliaZamaFHEVMConfig` symbol | ✅ — but the exact name/path has changed across fhevm versions. Older templates ship `ZamaFHEVMConfig` or per-network configs (`SepoliaConfig`). **Verify before compiling.** | all 3 contracts |
| `test/instance.ts` (`createInstances`) | ✅ shipped in template's `test/` | both test files |
| `test/signers.ts` (`initSigners`, `getSigners`) | ✅ shipped in template's `test/` | both test files |
| `hardhat.config.ts` with `hardhat-deploy` + fhevm network entry | ✅ | deploy script |

If `npx hardhat compile` fails on the imports above, it's a template-version
mismatch, not a bug in the contract logic. Open the template's own example
contract and copy the exact import lines / config base contract name it uses.

## Files

```
contracts/
├── ConfidentialPayroll.sol     ← encrypted salaries, employer↔employee
├── ConfidentialInvoice.sol     ← freelancer invoicing, encrypted amounts
└── ConfidentialAirdrop.sol     ← confidential token distribution (TokenOps bounty)
test/
├── ConfidentialPayroll.test.ts
└── ConfidentialInvoice.test.ts
deploy/
└── 01_deploy_all.ts            ← deploys all 3 + prints env vars for frontend
```

## Setup (from DEV FILE 5)

```bash
# Clone the official template — this becomes your Hardhat project
git clone https://github.com/zama-ai/fhevm-hardhat-template.git contracts-workspace-live
cd contracts-workspace-live
pnpm install

# Copy these files OVER the template's equivalents:
#   contracts/ConfidentialPayroll.sol
#   contracts/ConfidentialInvoice.sol
#   contracts/ConfidentialAirdrop.sol
#   test/ConfidentialPayroll.test.ts
#   test/ConfidentialInvoice.test.ts
#   deploy/01_deploy_all.ts

# Keep the template's own test/instance.ts and test/signers.ts — the tests import them.
```

## Run

```bash
npx hardhat compile
npx hardhat test
npx hardhat deploy --network sepolia          # after funding deployer on Sepolia
npx hardhat verify --network sepolia <ADDR>   # per contract
```

After deploy, copy the three printed addresses into the **frontend**
`../.env.local`:

```
NEXT_PUBLIC_PAYROLL_ADDRESS=0x...
NEXT_PUBLIC_INVOICE_ADDRESS=0x...
NEXT_PUBLIC_AIRDROP_ADDRESS=0x...
```

The frontend's `lib/contracts.ts` reads these; once all three are non-zero,
`isConfigured()` returns true and the UI switches from mock data to live
contract reads / writes.

## Contract ↔ Frontend consistency note

`ConfidentialInvoice.createInvoice` takes **5 args** including `dueDate`
(uint256). The frontend `INVOICE_ABI` and `app/app/invoices/new/page.tsx`
were corrected to match (the original DEV FILE 1 ABI had 4 args and omitted
`dueDate` — that would have reverted at runtime with the deployed contract).
