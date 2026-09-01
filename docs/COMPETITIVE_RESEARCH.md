# Q-NETRA AI — Competitive Landscape & Deep Research
**Auditor:** Fraud/AML Architect & Product Security Reviewer  
**Date:** 2026-08-31  

---

## 1. Competitive Capability Comparison Matrix

| Feature / Capability | Google Messages Scam Detection | Google Phone / Android Fraud Detection | Google Pay / UPI Fraud Shield | NPCI / Bank Core AML Engine | **Q-NETRA AI** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Domain** | SMS / RCS messaging | Real-time cellular calls | Payment app transaction confirmation | Interbank clearing & settlement | **Pre-Payment QR & Intent Interception** |
| **Execution Point** | When SMS is received | During live voice call audio | When user enters payment amount | Post-transaction batch / real-time clearing | **Before UPI PIN Entry (Scanning stage)** |
| **Underlying Tech** | On-device Gemini Nano / TFLite classifier | On-device Gemini Nano audio classifier | Centralized risk rules + unverified contact flags | SAS / Actimize / Graph AML databases | **Local AI Context + Multi-Hop Graph + Story Correlation** |
| **Privacy Model** | On-device text analysis | On-device audio processing | Cloud-connected user history | Full banking data access | **Local QR/Context + Minimal Data Graph Query** |
| **Story ↮ Money Trail Correlation** | ❌ No (Isolated text only) | ❌ No (Isolated call only) | ❌ No (Handles only) | ❌ No (Lacks pre-payment psychological context) | **✅ YES (Claimed Intent vs. Actual Clearing)** |
| **Explainable Reasoning** | ⚠️ Basic "Spam suspected" badge | ⚠️ "Likely scam call" banner | ⚠️ "You are sending money to a new contact" | ❌ Blackbox bank internal score | **✅ 4-Layer Explainable Trust Chain** |
| **Direct Fund Blocking** | ❌ No | ❌ No | ⚠️ Warning dialog; user can override | ✅ Can freeze account / reject clearing | ❌ Advisory only (Directs user to halt) |

---

## 2. Deep Dive on Competitors

### 1. Google Messages Scam Detection (Android 15+)
- **What they do:** Evaluates inbound SMS/RCS messages using on-device Private Compute Core / Gemini Nano to detect fake package deliveries, urgent banking alerts, and job scams.
- **Where Q-NETRA differs:** Google Messages only protects inside the SMS inbox. Once a user clicks a link, receives a QR code on WhatsApp, or opens a payment app, Google Messages has zero context on the financial counterparty or the money trail.
- **Q-NETRA's Moat:** Q-NETRA bridges the **SMS narrative to the actual payment transaction** (SMS Story -> VPA Recipient -> Bank Clearing Route).

### 2. Google Pay / PhonePe / Paytm Native Fraud Checks
- **What they do:** Display a basic warning if a user is transferring money to a new contact or unverified VPA for the first time.
- **Where they fail:** They do not know *why* the user is paying. If a victim believes they are paying an electricity bill to `abc123@upi`, the payment app displays the handle but does NOT flag that an electricity bill should never route to a newly registered personal VPA with 3-hop mule fan-out.
- **Q-NETRA's Moat:** **Story-to-Trail Inconsistency Detection**.

### 3. NPCI / I4C (Indian Cybercrime Coordination Centre)
- **What they do:** Manage the 1930 Citizen Financial Cyber Fraud Reporting System and maintain blacklists of mule accounts across Indian banks (SBI, HDFC, ICICI, etc.).
- **Where they fail:** Action is predominantly **reactive (post-fraud)**. Victims report after money is stolen, triggering a race to freeze accounts within the "Golden Hour".
- **Q-NETRA's Moat:** **Pre-payment preventive interception**.

---

## 3. What Q-NETRA Can Defensibly Claim vs What It Must NOT Claim

### ✅ DEFENSIBLY CLAIMABLE:
1. *"Q-NETRA provides pre-payment risk intelligence by correlating the claimed payment story with recipient and multi-hop network evidence."*
2. *"Q-NETRA decodes QR codes locally in memory and stops the camera immediately upon matrix capture, preventing cloud frame transmission."*
3. *"Q-NETRA provides an explainable 4-layer Trust Chain that breaks down context, identity, network trail, and correlation."*
4. *"Q-NETRA is designed with offline fail-safe architecture: network loss never defaults to a silent PROCEED."*

### ❌ FORBIDDEN CLAIMS (DO NOT STATE):
1. ❌ *"We replace Google Pay's security engine."* (False — Q-NETRA is an advisory layer).
2. ❌ *"We can freeze bank accounts or cancel UPI transfers."* (False — Q-NETRA does not have direct NPCI switch or bank core banking API access).
3. ❌ *"We run a fine-tuned LLM on the Snapdragon Hexagon NPU in the browser."* (False — Current runtime is V8 JIT CPU).
4. ❌ *"We read all Android background SMS automatically."* (False — Web SPA cannot access Android `READ_SMS`).
