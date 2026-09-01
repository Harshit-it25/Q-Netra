# Q-NETRA AI — Known Limitations & Technical Boundaries

**Date:** 2026-08-31  
**Scope:** Honest Technical Disclosure for Technical Judges & Reviewers  

---

## 1. Runtime & Acceleration Boundaries

1. **Web / Browser Execution Context:**
   - In standard browser and WebView runtimes, on-device inference runs via the **Client JavaScript V8 / JIT engine on the CPU**.
   - Direct execution on the Qualcomm Hexagon NPU hardware accelerator requires native Android NDK C++ bindings (Qualcomm QNN SDK / Neural Processing SDK). The web version detects the Snapdragon hardware platform but executes JIT tokenization.

2. **Offline Graph Traversal Boundary:**
   - Local on-device AI performs regex & heuristic text classification without network access.
   - However, multi-hop graph traversal (looking up 7 connected mule entities across banks) requires access to the centralized RiskGraph backend.
   - **Mitigation:** When offline, the app fails safe to `VERIFY (Offline)` and never defaults to `SAFE`.

---

## 2. Data & Knowledge Base Boundaries

1. **Seeded Fraud Graph vs. Live NPCI Ingestion:**
   - The hackathon implementation is backed by seeded, high-fidelity fraud ring topologies mirroring real 1930 NCRP and I4C cases.
   - Full national production deployment requires live API feeds from NPCI central switch and scheduled commercial bank core banking systems.

2. **SMS Sandbox Boundary:**
   - Browser security sandboxes prevent background silent interception of the device's native SMS database without explicit user paste or native Android Accessibility Services.
   - The app provides an interactive SMS / Phishing Analyzer modal where users can paste suspicious messages or test common phishing vectors.
