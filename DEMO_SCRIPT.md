# PayMate — 3-Minute Demo Script

> Optimized for Zama Developer Program Season 3 judges.

---

## 🎬 Structure (3 min)

### 00:00 — 00:25 | THE PROBLEM HOOK

**Say:** *"Every time someone pays a freelancer on-chain, the entire world sees the amount. Open Etherscan, search any wallet — you can see their income, their clients, their rates. PayMate fixes this with FHE."*

**Show:** Etherscan transaction with plaintext amount → then a PayMate transaction with encrypted `0x` handles

---

### 00:25 — 01:10 | LIVE DEMO: ENCRYPT & PAY

**Show the employer flow:**
1. Open PayMate → connect wallet (MetaMask on Sepolia)
2. Go to **Payroll** → Add Employee → enter salary amount
3. Show the fhevmjs encrypt step in browser console: `encrypt64(4200000000)` → ciphertext handle
4. Submit transaction → Etherscan shows: `0x3b4a...` (encrypted, not $4,200)
5. Say: *"The amount left as a ciphertext handle. Nobody on Etherscan sees $4,200."*

---

### 01:10 — 01:45 | THE RE-ENCRYPTION MAGIC

**Switch to employee wallet:**
1. Open PayMate as employee → Earnings page
2. Balance shows `•••••`
3. Click **"Reveal Balance"**
4. MetaMask popup: *sign EIP-712 permit*
5. Show KMS Gateway round-trip (brief loading)
6. Balance reveals: `$4,200.00`

**Say:** *"Only the employee's wallet key can decrypt this. The employer sees it's been paid. The employee sees the amount. Everyone else sees encrypted bytes."*

---

### 01:45 — 02:20 | COMPOSABLE PRIVACY

**Show 3 composability demos (fast):**

1. **Reputation** → Invoice paid → reputation score increments on-chain (public score, private amount) 
2. **Morpho Yield** → Idle payroll earns 5.8% APY. *"Funds earning yield while encrypted — no DeFi protocol sees your payroll data."*
3. **Airdrop** → TokenOps bounty page → admin uploads CSV, amounts encrypted, recipients self-decrypt

**Say:** *"This is Season 3's theme: composable privacy. FHE doesn't isolate — it composes."*

---

### 02:20 — 02:50 | AI AGENT

**Show Agent page:**
- AI agent reports: *"3 invoices overdue, 1 payment disputed"
- Agent never decrypts amounts — runs on FHE boolean comparisons
- Say: *"The agent knows invoices are overdue without knowing the amounts. That's FHE."*

---

### 02:50 — 03:00 | CLOSE

**Show:** Live Sepolia contract addresses on Etherscan

**Say:** *"PayMate — private payroll, composable by default, live on Sepolia. Four contracts, full test suite, real FHE."*

---

## 🎥 Recording Tips

- Use 1920×1080, 30fps minimum
- Show browser DevTools briefly to prove real FHE (not mocked)
- Keep wallet address visible so judges can verify on Etherscan
- No background music, clear narration
- Upload to YouTube (unlisted) or Loom

---

## ❗ What Judges Look For (Season 3)

1. ✅ Real FHE — not simulated. Show encrypted tx on Etherscan.
2. ✅ Re-encryption — can users actually reveal their own data?
3. ✅ Composability — more than one protocol involved
4. ✅ UX polish — especially for TokenOps bounty (judged primarily on UX)
5. ✅ Documentation — README with architecture, not just "clone and run"
6. ✅ Tests — working test suite proves contracts are production-ready
