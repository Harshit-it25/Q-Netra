# Q-NETRA AI — Current Architecture Audit

**Date:** 2026-08-31  
**Auditor:** Senior Software Architect & Security Engineer  
**Classification:** Pre-Refactoring State Mapping  

---

## 1. System Inventory & Component Mapping

### A. Frontend Layer (`src/`)
- **Root Orchestration (`src/App.tsx`):**
  - Manages screen state (`home`, `check-result`, `trust-chain`, `network`, `settings`), modal states, local payment history synchronization, and API orchestration.
- **UI Presentation (`src/components/`):**
  - `Header.tsx`: Sticky navigation bar with shield and options triggers.
  - `BottomNavBar.tsx`: Fixed 4-tab mobile navigation bar.
  - `HomeScreen.tsx`: Hero stats, golden demo cards, scan trigger, SMS checker, and recent checks list.
  - `CheckResultScreen.tsx`: Decision card (STOP / VERIFY / SAFE), trust score, and action triggers.
  - `TrustChainScreen.tsx`: 4-stage evidence timeline (Context $\rightarrow$ Identity $\rightarrow$ Network $\rightarrow$ Correlation).
  - `NetworkGraphScreen.tsx`: SVG graph visualizer, 7-node syndicate topology, and investigation dossier modal.
  - `SettingsScreen.tsx`: Device capabilities, privacy audit disclosure, cache purge, demo reset.
  - `QrScannerModal.tsx`: Local `<video>` stream, in-memory `jsQR` decoder, UPI parser.
  - `CheckMessageModal.tsx`: SMS inspection, simulated demo inbox, text analyzer.
  - `EnterPaymentModal.tsx`: Manual UPI VPA & amount entry with real-time heuristic validation.
  - `AskQNetraModal.tsx`: Voice & text interactive Q&A cybersecurity assistant.
- **Client Libraries & Heuristics (`src/lib/`):**
  - `onDeviceAI.ts`: Local deterministic regex token weight classifier and hardware detector.
  - `paymentHistory.ts`: LocalStorage wrapper for payment history persistence and deletion.
  - `smsShield.ts`: Sample permitted demo inbox and regex scam heuristics.
  - `voiceAssistant.ts`: Web Speech API recognition, synthesis, and domain question matcher.
- **Fixtures & Types:**
  - `src/data.ts`: Golden Cases fixture, default 7-node high-risk graph, sample scam messages.
  - `src/types.ts`: Flat type definitions shared across frontend.

---

### B. Backend Layer (`server/` and `server.ts`)
- **Server Entry Point (`server.ts`):**
  - Express app with CORS middleware, rate limiters, security headers (CSP, HSTS, X-Frame-Options), and API route handlers (`/api/analyze-payment`, `/api/network-graph`, `/api/analyze-message`, `/api/ask-qnetra`, `/api/office-kit/investigate`, `/api/entities`, `/api/health`).
- **Data Fixtures (`server/data/knowledgeBase.ts`):**
  - `KNOWN_ENTITIES`: Seeded dictionary of demo VPAs (e.g. `abc123@upi`, `swiggy@icici`).
  - `DEFAULT_HIGH_RISK_GRAPH`: 7-node seeded graph structure.
- **Intelligence Engines (`server/intelligence/`):**
  - `fraudEngine.ts`: Master pre-payment risk evaluation function (`evaluatePaymentRisk`).
  - `storyCorrelation.ts`: 3-pillar mismatch matrix (`evaluateIntentTrailCorrelation`).
  - `graphNetwork.ts`: Topology generator for target entity (`buildGraphForEntity`).
  - `trustChain.ts`: 4-step explanation generator (`generateTrustChain`).
  - `messageAnalyzer.ts`: Server-side heuristic scanner (`analyzeMessageText`).
  - `geminiAdvisor.ts`: Gemini 3.7 Flash integration with domain fallbacks.
  - `officeKit.ts`: Forensic investigation dossier formatter (`investigateEntityForOfficeKit`).

---

### C. Research & Evaluation Layer (`research/`)
- Isolated from production runtime:
  - `research/datasets/external/`: PaySim CSV and Indian Scam SMS CSV.
  - `research/datasets/synthetic/`: Hardened adversarial ablation corpus & counterfactual pairs.
  - `research/datasets/processed/`: Group-aware train/test splits.
  - `research/models/`: Serialized `.joblib` baseline models.
  - `research/scripts/`: 8 standalone Python evaluation and reproduction scripts.
  - `research/reports/`: Empirical metrics, leakage audit, error analysis, and whitepaper.

---

## 2. Identified Architectural Issues Before Refactor

1. **Scattered Direct `fetch()` Calls:** `App.tsx`, `NetworkGraphScreen.tsx`, `CheckMessageModal.tsx`, and `AskQNetraModal.tsx` perform ad-hoc `fetch()` calls with inline error handling.
2. **Monolithic `server.ts`:** Route declarations, middleware, controllers, and validation are all packed into a single 250-line file.
3. **Mixed Concerns in UI Components:** Components directly instantiate Web Speech instances, handle video stream canvas captures, and perform regex matching.
4. **Scattered Fixture Data:** Seeded demo fixtures (`KNOWN_ENTITIES`, `INITIAL_CHECKS`, `DEFAULT_HIGH_RISK_GRAPH`) are spread across `src/data.ts` and `server/data/knowledgeBase.ts`.
5. **Lack of Automated Unit/Integration Tests:** No dedicated `tests/` directory verifying domain services independently of the UI.
