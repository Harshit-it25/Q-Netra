# Q-NETRA AI — Prioritized Engineering & Claims Fix Backlog
**Auditor:** Principal Security & Product Architect  
**Date:** 2026-08-31  

---

## 1. Prioritized Findings Backlog (P0 - P3)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ P0: DEMO BLOCKER / LEGAL & TECHNICAL CREDIBILITY HAZARDS (FIX BEFORE EVENT)│
├──────────────────────────────────────────────────────────────────────────┤
│ P1: MAJOR SECURITY & RELIABILITY VULNERABILITIES                         │
├──────────────────────────────────────────────────────────────────────────┤
│ P2: LOGIC & EDGE-CASE QUALITY ISSUES                                     │
├──────────────────────────────────────────────────────────────────────────┤
│ P3: CODE CLEANUP & POLISH                                                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Task Breakdown

### 🔴 P0 — Credibility & Pitch Truth Calibration
- [ ] **Task P0-1: SMS Shield Reality Calibration**
  - *Issue:* SMS Shield is a pure Web UI component with simulated inbox; claiming native Android `READ_SMS` background interception is technically false.
  - *Fix:* Ensure all presentation slides, pitch docs, and UI badges state: *"On-device SMS scam inspection prototype"*.
- [ ] **Task P0-2: Snapdragon Hardware Claim Calibration**
  - *Issue:* Code executes regexes via V8 JIT on CPU, not direct Hexagon NPU QNN execution in browser.
  - *Fix:* Maintain safe label: *"Snapdragon platform detected (Executed locally via on-device client JIT engine)"*.
- [ ] **Task P0-3: Advisory Scope Clarification**
  - *Issue:* Judges may ask if Q-NETRA can freeze accounts or block UPI transactions.
  - *Fix:* Pitch and UI must clearly state: *"Pre-payment risk intelligence layer (advisory before UPI PIN entry)"*.

### 🟠 P1 — High-Priority Security & Defense Enhancements
- [ ] **Task P1-1: Add API Rate Limiting to Express Server**
  - *Issue:* Zero rate limiting on `/api/analyze-payment` and `/api/ask-qnetra`.
  - *Fix:* Add `express-rate-limit` (60 requests / minute per IP).
- [ ] **Task P1-2: Restrict CORS Wildcard**
  - *Issue:* `server.ts` uses `Access-Control-Allow-Origin: *`.
  - *Fix:* Restrict CORS to localhost and verified hostnames.
- [ ] **Task P1-3: Add Security Headers via Helmet**
  - *Issue:* Missing CSP, HSTS, X-Content-Type-Options, X-Frame-Options.
  - *Fix:* Implement `helmet()` middleware in Express.

### 🟡 P2 — Logic & Heuristic Bugs
- [ ] **Task P2-1: Fix ₹20,000 Verified Merchant Override False Positive**
  - *Issue:* `fraudEngine.ts` L56 treats `amount >= 20000` as high risk even if `known.category === 'merchant'` and `kycStatus === 'verified'`.
  - *Fix:* Modify condition to `(amount >= 20000 && known?.category !== 'merchant')`.
- [ ] **Task P2-2: Add Inter-character Whitespace Normalization**
  - *Issue:* Obfuscated text like `"p a y   n o w"` evades word-boundary regexes.
  - *Fix:* Pre-process input strings by stripping multi-spaces and checking normalized character strings.
- [ ] **Task P2-3: Basic Hinglish / Hindi Token Support**
  - *Issue:* Non-English payment threats (e.g. `bijli cut`, `kaat diya`) are missed by English-only patterns.
  - *Fix:* Add basic Hinglish stems (`bijli`, `kat`, `band`, `katwaye`, `police`, `giraftari`) to token weights.

### ⚪ P3 — Cleanup & Polish
- [ ] **Task P3-1: Update `package.json` Metadata**
  - *Issue:* Name field is `"react-example"`.
  - *Fix:* Rename to `"q-netra-ai"`.
- [ ] **Task P3-2: Small Screen (<360px) Note Wrap**
  - *Issue:* Long transaction notes wrap on very narrow viewports.
  - *Fix:* Add CSS `line-clamp-1` / `truncate` on history item subtitle.
