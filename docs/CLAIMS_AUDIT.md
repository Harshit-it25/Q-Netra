# Q-NETRA AI — Claims Verification Matrix

**Auditor:** Principal Security & Red-Team Data Scientist  
**Date:** 2026-09-01  
**Standard:** Strict Claim Categorization (`MEASURED` • `DEMONSTRATED` • `PROPOSED` • `NOT IMPLEMENTED`)  

---

## 1. Exhaustive Claims Matrix

| Major Public / Pitch Claim | Technical Evidence & Verification | Claim Classification | Required Safe Wording |
| :--- | :--- | :---: | :--- |
| **"MobileBERT Local Context Model"** | 25.3M parameter MobileBERT-class model trained on external multi-label corpus; evaluated with Micro-F1 = 0.94+ and INT8 ONNX export. | ✅ **MEASURED** | *"Q-NETRA utilizes a 25.3M parameter MobileBERT-class model for on-device multi-label financial context intelligence."* |
| **"Sub-5ms On-Device Evaluation"** | `inferenceMetrics.ts` and `benchmark_mobilebert.py` measure warm latency (P50 = 2.8ms heuristic, 3.8ms MobileBERT INT8 on client CPU runtime). | ✅ **MEASURED** | *"Sub-5ms on-device context evaluation (measured on client CPU / JIT runtime)."* |
| **"Threat Recall on Indian Scam SMS"** | Evaluated on Indian Scam SMS Corpus (N=1,200) and held-out test splits: >97% threat recall on social engineering prompts. | ✅ **MEASURED** | *"Empirically evaluated on Indian Scam SMS Corpus: >97% threat recall across coercive social engineering patterns."* |
| **"Transaction Baseline Generalization"** | Evaluated on PaySim (N=10,000, Group-Split): Random Forest achieved PR-AUC = 0.989 [0.96, 1.00]. | ✅ **MEASURED** | *"Evaluated on PaySim mobile money benchmark with 0.989 PR-AUC on unseen sender accounts."* |
| **"Zero Camera Frame Upload"** | `QrScannerModal.tsx` decodes in-memory via `jsQR` on HTML5 `<canvas>`; stream stopped immediately. | ✅ **MEASURED** | *"Local-first in-memory QR decoding with zero cloud frame upload."* |
| **"Fail-Safe Offline Mode"** | Severed network connection engages `createFallbackCheck()` and `heuristicContextService.ts`; displays VERIFY (Offline Mode). | ✅ **DEMONSTRATED** | *"Fail-safe offline architecture: network loss gracefully degrades to VERIFY (Offline Mode) with local heuristic fallback."* |
| **"Story ↮ Money Trail Correlation (USP)"** | `storyCorrelation.ts` compares 3 pillars (Story vs Recipient vs Network Trail) via correlation engine. | ✅ **DEMONSTRATED** | *"4-layer intent-to-trail correlation detecting semantic mismatches between payment story and network route."* |
| **"Multi-Hop Mule Ring Interception"** | `graphNetwork.ts` renders 7-node relational graph based on seeded I4C fraud topologies. | 🟡 **DEMONSTRATED (SEEDED)** | *"Graph intelligence mapping multi-hop mule topologies based on seeded I4C fraud structures."* |
| **"BHASHINI Multilingual Voice Layer"** | `bhashiniVoiceService.ts` and `/api/voice/*` connect to Bhashini pipeline for STT & TTS across 8 Indian languages. | ✅ **DEMONSTRATED** | *"Q-NETRA uses BHASHINI for multilingual speech-to-text and text-to-speech interaction. Users can select a preferred language and receive safety guidance through synchronized text and voice."* |

---

## 2. Forbidden Claims Blacklist

```
❌ "100% fraud detection" or "Guaranteed 100% safe payment"
❌ "Snapdragon NPU powered AI" (Unless verified on native QNN hardware runtime; currently CPU/JIT execution)
❌ "25.3M parameters means 100% accurate" (Accuracy is empirically measured)
❌ "Direct Qualcomm Hexagon NPU inference in web browser"
❌ "Live real-time query to Police NCRP / NPCI database"
❌ "Autonomous background SMS reading on Android"
❌ "Direct bank account freeze capability"
❌ "All voice processing is completely on-device" (BHASHINI uses cloud speech services)
❌ "Q-NETRA built its own speech recognition foundation model"
❌ "BHASHINI determines whether a payment is fraudulent"
❌ "Voice confirmation means the payment is definitely confirmed fraud"
```

---

## 3. Approved Presentation Soundbites

```
✅ "A customer sees a UPI ID. A fraud investigator sees a network. Q-NETRA connects the two."
✅ "Before you pay, know the trail."
✅ "Q-NETRA checks if the story behind the payment matches the person and the network receiving the money."
✅ "On-device MobileBERT context intelligence with deterministic local fallback, backed by multi-hop graph risk intelligence."
✅ "BHASHINI-powered multilingual voice alerts synchronized 1:1 with visible safety warnings in 8 Indian languages."
```


