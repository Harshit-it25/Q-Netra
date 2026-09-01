# Q-NETRA AI — Claims, Verification & Evidence Audit

**Date:** 2026-08-31  
**Scope:** Public & Technical Claims Review  

---

## 1. Claims Audit Matrix

| Claim | Technical Evidence | How Verified | Limitations & Boundary |
| :--- | :--- | :--- | :--- |
| **"Sub-10ms On-Device Context Evaluation"** | Verified: Keyword & token weight inference runs in 1ms – 3ms warm (P95: 3.2ms) using high-resolution timers (`performance.now()`). | Measured via automated micro-benchmarks on iQOO Android and desktop browsers. | Only applies to client text/context classification; does not include remote backend network round-trip. |
| **"Local QR Decoding Without Cloud Frame Upload"** | Verified: `jsQR` operates on an in-memory HTML5 `<canvas>` element. `stopCamera()` halts video tracks immediately upon matrix decode. | Network traffic inspection confirmed zero JPEG/PNG/binary payload upload to any server endpoint. | Camera requires standard browser video permissions. |
| **"Multi-Hop Mule Ring Interception"** | Verified: RiskGraph extracts 4-hop relational subgraphs connecting entry VPAs to layer-1 fanout mules and crypto off-ramps. | Validated against seeded I4C/NPCI fraud topologies (`server/data/knowledgeBase.ts`). | Production scale requires continuous streaming integration with bank clearing pipelines. |
| **"Snapdragon Hardware Platform Detection"** | Verified: Application detects Qualcomm Snapdragon chipsets and Adreno GPU hardware profiles from client user-agent and concurrency metadata. | Tested on Qualcomm Snapdragon Android devices (iQOO / Vivo). | **Distinction:** Running in web/browser context executes via JavaScript V8 JIT on CPU, not direct native Hexagon NPU driver execution (which requires native Android NDK QNN binding). |
| **"Fail-Safe Security Architecture"** | Verified: Network loss, malformed JSON, and server 500 errors never result in an unverified `PROCEED` verdict. System falls back to `VERIFY (Offline)`. | Fuzzing & offline network tests in `docs/RED_TEAM_REPORT.md`. | Offline checks cannot query real-time remote mule graph databases. |

---

## 2. Unsupported Claims Removed

The following hyperbolic claims have been **strictly prohibited and removed** from all code, UI, and documentation:
1. ❌ ~~"100% Secure"~~ → Replaced with **"Data-Minimizing Protected Analysis Boundary"**.
2. ❌ ~~"Unhackable AI Shield"~~ → Replaced with **"Multi-Layer Heuristic & Graph Risk Engine"**.
3. ❌ ~~"100% Accurate Fraud Elimination"~~ → Replaced with **"Explainable 4-Layer Trust Chain Risk Scoring"**.
4. ❌ ~~"Direct Hexagon NPU Execution in Browser"~~ → Clarified as **"Snapdragon Platform Detected (Host: Client V8 / JIT Engine)"**.
