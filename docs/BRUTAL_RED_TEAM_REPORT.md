# Q-NETRA AI — BRUTAL RED-TEAM & PRE-EVENT AUDIT REPORT
**Classification:** Comprehensive Independent Technical, Security, Privacy, ML & Architecture Review  
**Date:** 2026-08-31  
**Audit Standard:** Zero Assumptions • No Polite Pass • Evidence-First Verification  

---

## EXECUTIVE SUMMARY & AUDIT RULING

| Dimension | Audit Score | Status | Primary Vulnerability / Gap |
| :--- | :---: | :---: | :--- |
| **Security & Trust Boundaries** | **7.5 / 10** | ⚠️ CONDITIONAL | Open CORS (`*`), zero API rate limiting, unauthenticated endpoints. |
| **Privacy & Data Minimization** | **9.0 / 10** | 🟢 STRONG | Excellent local QR & camera lifecycle; unencrypted localStorage history. |
| **Technical Correctness** | **8.5 / 10** | 🟢 SOLID | Clean TypeScript compilation; deterministic offline fail-safe logic. |
| **ML & AI Credibility** | **5.5 / 10** | 🔴 WEAK CLAIM | "AI/NPU" is actually client-side regex heuristics running on V8 JIT CPU. |
| **Novelty & Moat** | **7.0 / 10** | 🟡 MODERATE | Story ↮ Money Trail correlation is novel conceptually, heuristic in code. |
| **Android / iQOO Readiness** | **5.0 / 10** | 🔴 PROTOTYPE | Web SPA only; zero native Android bridge; SMS Shield cannot read native SMS. |
| **UX & Presentation Polish** | **9.5 / 10** | 🟢 EXCEPTIONAL | Responsive dark aesthetic, clear evidence cascade, interactive topology. |
| **Demo Reliability & Fallbacks** | **9.0 / 10** | 🟢 RESILIENT | Deterministic golden cases, offline graceful degradation, 10s recovery. |
| **Competitive Differentiation** | **7.5 / 10** | 🟡 DEFENSIBLE | Clear semantic pre-payment gap vs Google Pay & NPCI post-transaction rules. |
| **OVERALL SYSTEM SCORE** | **74.5 / 100** | 🟡 **STRONG DEMO, NEEDS HARDWARE VALIDATION & TRUTH-CALIBRATION** |

---

## 1. REPOSITORY TOPOGRAPHY & CODE INVENTORY

```
q-netra-ai/
├── src/
│   ├── App.tsx                          (Main orchestrator, modal manager, offline fail-safe fallback)
│   ├── data.ts                          (3 Golden checks, 7-node seeded graph topology, scam vectors)
│   ├── types.ts                         (Type definitions for checks, graphs, trust chains, contexts)
│   ├── components/
│   │   ├── AskQNetraModal.tsx           (Voice Q&A, Web Speech API integration, intent matcher)
│   │   ├── CheckMessageModal.tsx        (SMS / link safety analyzer, simulated inbox, link intercept)
│   │   ├── CheckResultScreen.tsx        (STOP/VERIFY/PROCEED cards, 3 evidence points, privacy panel)
│   │   ├── EnterPaymentModal.tsx        (Manual VPA/Amount entry form)
│   │   ├── HomeScreen.tsx               (Hero CTA, payment history list, deletion & reset triggers)
│   │   ├── NetworkGraphScreen.tsx       (SVG multi-hop graph visualization, dossier inspection)
│   │   ├── QrScannerModal.tsx           (jsQR canvas decoder, camera lifecycle manager, link intercept)
│   │   ├── SettingsScreen.tsx           (Permission controls, hardware profile display, demo reset)
│   │   └── TrustChainScreen.tsx         (5-layer progressive evidence timeline)
│   └── lib/
│       ├── onDeviceAI.ts                (Regex token weight classifier, latency timer, HW detector)
│       ├── paymentHistory.ts            (LocalStorage CRUD & deterministic demo reset)
│       ├── smsShield.ts                 (Local SMS threat evaluator, sample inbox, URL dissection)
│       └── voiceAssistant.ts            (Deterministic voice intent router & script synthesizer)
├── server.ts                            (Express HTTP server, Vite middleware, API routing)
├── server/
│   ├── data/
│   │   └── knowledgeBase.ts             (8 seeded VPAs, 7-node default high-risk graph)
│   └── intelligence/
│       ├── fraudEngine.ts               (Authoritative risk calculator, input sanitization, NLP scan)
│       ├── geminiAdvisor.ts             (Gemini 3.7 Flash integration + offline heuristic advisor)
│       ├── graphNetwork.ts              (Dynamic subgraph synthesizer & node decorator)
│       ├── messageAnalyzer.ts           (Server regex threat patterns & recommendation generator)
│       ├── officeKit.ts                 (Forensic dossier generator for desktop handover)
│       ├── storyCorrelation.ts          (Intent-to-Trail 3-pillar mismatch detection matrix)
│       └── trustChain.ts                (4-layer explainable reasoning generator)
├── public/
│   ├── manifest.json                    (PWA metadata)
│   └── sw.js                            (Service Worker, API-bypass caching policy)
└── package.json                         (React 19, TypeScript 5.8, Tailwind 4, Express 4, jsQR)
```

---

## 2. TRUST BOUNDARY & ARCHITECTURAL REALITY

### Actual Runtime Flow
```
[ USER INPUT (QR / SMS / Manual VPA) ]
                 │
                 ▼
[ CLIENT-SIDE (Browser / WebView / V8 JIT) ]
  ├── Local QR Decode (jsQR in memory canvas) ──► Camera tracks stopped
  ├── Context Classification (onDeviceAI.ts: regex token weights in 1-3ms)
  └── Format Payload: { recipient, amount, note, context: localContext }
                 │
                 ▼ (HTTP POST /api/analyze-payment) [UNAUTHENTICATED BOUNDARY]
[ SERVER-SIDE (Node.js Express on Port 3000) ]
  ├── Input Sanitization (String slice 256/512, Number clamp 0..100M)
  ├── Server NLP Scan (messageAnalyzer.ts - Independent of client claims)
  ├── Entity Lookup (knowledgeBase.ts - KNOWN_ENTITIES)
  ├── Intent-to-Trail Correlation (storyCorrelation.ts)
  ├── Trust Chain Synthesis (trustChain.ts)
  ├── Graph Subgraph Construction (graphNetwork.ts)
  └── Forensic Explanation (geminiAdvisor.ts via Gemini 3.7 Flash or Heuristic Fallback)
                 │
                 ▼ (JSON Response)
[ CLIENT DECISION RENDER ]
  ├── STOP (High Risk / Mismatch / Coercion)
  ├── VERIFY (Moderate / Unverified Handle)
  └── PROCEED (Verified Enterprise KYC + Clean Trail)
```

### Trust Boundary Analysis
1. **Client -> Server Boundary:**
   - **Trusted:** Nothing. The server re-evaluates `note` and `recipient` using independent regex patterns. If client lies (`riskScore: 0` on an urgent coercion note), the server flags high risk.
   - **Untrusted:** Client-provided `context.payment_pressure` is ingested as a secondary signal, but cannot suppress server-side high-risk tokens.
2. **Missing Boundary Controls:**
   - No API authentication tokens (API is completely public).
   - No rate limiting (infinite request flood possible).
   - Wildcard CORS (`*`) allows any web page to invoke backend risk endpoints.

---

## 3. SEEDED DATA & REALITY DISCLOSURE

| Entity / Asset | Source | Live vs Seeded | Reality Disclosure Required |
| :--- | :--- | :--- | :--- |
| `abc123@upi` | `knowledgeBase.ts` | **SEEDED** | Fictional mule handle used for Hero Case C demo. |
| `mule_781@axis` | `knowledgeBase.ts` | **SEEDED** | Fictional layer-1 rapid fan-out mule node. |
| `P2P_Exch_Wallet#9` | `knowledgeBase.ts` | **SEEDED** | Fictional crypto off-ramp endpoint. |
| `IMEI: 864209118942` | `knowledgeBase.ts` | **SEEDED** | Synthetic device fingerprint (no real telecom link). |
| `14 NCRP 1930 Reports` | `knowledgeBase.ts` | **SEEDED** | Hardcoded demo integer; not querying live I4C NCRP portal. |
| `Bundl Technologies (Swiggy)` | `knowledgeBase.ts` | **STATIC FIXTURE** | Hardcoded verified merchant baseline. |
| `Priya Verma Consulting` | `knowledgeBase.ts` | **STATIC FIXTURE** | Hardcoded unverified moderate-risk baseline. |
| `Gemini 3.7 Flash` | `geminiAdvisor.ts` | **LIVE API** | Live LLM call when `GEMINI_API_KEY` is provided; fallback if absent. |

---

## 4. CRITICAL VULNERABILITY & AUDIT FINDINGS (P0 - P3)

### P0 (Catastrophic / Credibility Blocker)
1. **SMS Shield Web Architecture Limitation:**
   - *Finding:* `smsShield.ts` and `CheckMessageModal.tsx` are pure web components. There is zero native Android layer (`AndroidManifest.xml`, `READ_SMS` permission).
   - *Impact:* Claiming "Autonomous Background SMS Protection on Android" during a pitch will be instantly dismantled by any Android engineer or judge.
   - *Remediation:* Explicitly declare SMS Shield as a **"Web prototype featuring on-device text inspection and simulated test inbox"**.

2. **Snapdragon NPU vs V8 JIT CPU Discrepancy:**
   - *Finding:* `onDeviceAI.ts` detects Qualcomm Snapdragon chipsets via User-Agent strings, but executes plain JavaScript regex loops on the CPU via V8 JIT. WebNN / Hexagon QNN execution is not compiled in this build.
   - *Impact:* Claiming "Model runs on Snapdragon Hexagon NPU" is technically false in the browser.
   - *Remediation:* Maintain strict wording: **"Snapdragon platform detected (Executed locally via on-device client JIT)"**.

### P1 (Major Security & Architecture Vulnerabilities)
3. **Unprotected API Endpoints & Missing Rate Limiting:**
   - *Finding:* Express server lacks `express-rate-limit`. An attacker can script 100,000 requests to `/api/analyze-payment` or `/api/office-kit/investigate`, exhausting server memory or Gemini API quotas.
4. **Permissive CORS Wildcard:**
   - *Finding:* `server.ts` line 19 sets `Access-Control-Allow-Origin: *`. Any malicious website running in a user's browser can query the local server instance.
5. **Uncalibrated Confidence Metrics:**
   - *Finding:* `onDeviceAI.ts` line 178 assigns `confidence = 0.96` if token score > 1.2. This is a heuristic step function, not a statistical ML confidence metric.

### P2 (Meaningful Reliability & UX Issues)
6. **Unencrypted LocalStorage History:**
   - *Finding:* Payment checks and analyzed SMS messages are stored in plain text in `localStorage` under `qnetra_checks` and `qnetra_sms_history`.
7. **Static RiskGraph Topology:**
   - *Finding:* Querying `/api/network-graph` for any high-risk entity renders the same 7-node topology with modified target label.

### P3 (Minor Polish & Cleanup)
8. **Package.json Metadata:**
   - *Finding:* `package.json` retains name `"react-example"`. Should be `"q-netra-ai"`.
9. **Single-line Note Truncation in History:**
   - *Finding:* Extremely long payment notes wrap awkwardly on small screen widths (<360px).

---

## 5. BRUTAL RED TEAM VERDICT

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   FINAL VERDICT: 🟡 STRONG DEMO, NEEDS HARDWARE VALIDATION               │
│                                                                         │
│   The prototype possesses exceptional visual polish, rock-solid         │
│   offline fail-safe logic, and a compelling 4-layer narrative.          │
│   However, all claims regarding "NPU Execution" and "Native Android     │
│   SMS Interception" MUST be accurately stated as client-side web        │
│   heuristics to survive technical scrutiny by hackathon judges.         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
