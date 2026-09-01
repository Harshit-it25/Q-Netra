# Q-NETRA AI — MobileBERT On-Device AI Architecture & Integration Guide

## 1. Executive Summary

This document specifies the architecture establishing **MobileBERT (25.3M parameter on-device Transformer model)** as Q-NETRA's **PRIMARY** contextual intelligence model, with the existing deterministic heuristic NLP engine designated as **FALLBACK ONLY**.

### Core Architecture:
```
                INPUT
          QR / SMS / PAYMENT NOTE
                    ↓
          ┌───────────────────┐
          │   MobileBERT      │
          │ PRIMARY Local AI  │
          └─────────┬─────────┘
                    ↓
             Context Signals (Multi-Label)
                    ↓
        [If Error / Timeout / Unavailable]
                    ↓ (Fallback Only)
          ┌───────────────────┐
          │ Heuristic Safety  │
          │ Fallback NLP      │
          └─────────┬─────────┘
                    ↓
             Q-NETRA RISK ENGINE
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    IDENTITY     RISKGRAPH    STORY/TRAIL
        │           │           │
        └───────────┼───────────┘
                    ↓
             TRUST CHAIN
                    ↓
        PROCEED / VERIFY / STOP
```

1. **MobileBERT** is the **PRIMARY Local AI Model**, providing multi-label semantic understanding.
2. **Existing Heuristic Engine** (`src/services/localAI/heuristicContextService.ts`) is **FALLBACK ONLY**, activating only if MobileBERT fails to load, crashes, times out, or returns invalid output.
3. **Q-NETRA Risk Engine** (Identity, Network RiskGraph, 3-Pillar Story Correlation, Trust Chain) makes the **Final Pre-Payment Decision**.
4. **BHASHINI** acts strictly as the **Multilingual Speech/Translation Interface**; it never determines the fraud decision.

---

## 2. Multi-Label Classification Context Heads

MobileBERT is fine-tuned specifically for financial & social engineering contextual indicators across 8 simultaneous target labels:

| Label Target | Description | Operational Significance |
| :--- | :--- | :--- |
| `LEGITIMATE` | Benign invoice, bank alert, peer payment | Suppresses false alarms on routine transactions |
| `PAYMENT_REQUEST` | Explicit fund transfer / payment demand | Establishes transactional context |
| `URGENCY` | Coercive time pressure (*"tonight"*, *"within 15m"*) | Core psychological manipulation vector |
| `PAYMENT_PRESSURE` | Disconnection threats, account freeze, legal penalties | Critical coercive threat trigger |
| `AUTHORITY_IMPERSONATION` | Utility discom, bank officer, police/TRAI claims | Identity spoofing signal |
| `PHISHING` | Credential harvesting links, remote access APKs | Technical attack vector |
| `SOCIAL_ENGINEERING` | Coercion, fraudulent lottery, fake refunds | High-level deception synthesis |
| `FRAUD` | Composite high-risk threat signature | Direct input into Q-NETRA Risk Engine |

---

## 3. Dataset Governance & Partition Standards

To prevent data contamination and ensure scientific reproducibility:

```
research/datasets/
├── external/                # Multi-label scam corpus (Train/Val/Test 70/15/15)
├── synthetic/               # Hard negatives & counterfactual pairs
└── demo_fixtures/           # Quarantined Golden Cases (NEVER used for training)
```

- **Zero Overlap:** Strict entity-group isolation and exact message deduplication (`MOBILEBERT_DATA_SPLIT_AUDIT.md`).
- **Demo Fixture Quarantine:** Golden demo fixtures (Golden Cases A, B, C, D) are quarantined in `research/datasets/demo_fixtures/` and prohibited from model training or validation splits.

---

## 4. On-Device Execution & Fallback Policy

### Web Browser / PWA:
- Local tokenization and client-side inference executing on V8/JIT.
- If model assets are unavailable or encountering errors, the system transparently routes to `heuristicContextService.ts` with `fallback_used: true`.

### Native Android / Snapdragon:
- Quantized INT8 ONNX execution via ONNX Runtime / Qualcomm AI Engine (QNN) when verified.
- Explicit hardware reporting: Only reports `"CPU"`, `"GPU"`, or `"NPU"` based on verified execution runtime.

---

## 5. Multilingual Strategy & BHASHINI Separation

- **MobileBERT Scope:** Local English & Romanized transliterated context intelligence (*"bijli kat"*, *"turant"*, *"jaldi"*).
- **BHASHINI Scope:** Multilingual speech-to-text (STT) and text-to-speech (TTS) across all 8 Indian languages (Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Gujarati, English).
- **Safety Rule:** BHASHINI voice recognition converts user queries into text for the local pipeline; BHASHINI itself **never** dictates risk levels or stops payments.

---

## 6. Service API Reference

```typescript
import { analyzeContextLocally } from '@/services/localAI/localAIService';

const result = analyzeContextLocally(
  "Pay ₹10 immediately to prevent electricity disconnection tonight."
);

console.log(result);
/*
{
  payment_request: true,
  urgency: true,
  payment_pressure: true,
  authority_claim: true,
  signalStrength: 'STRONG',
  model_type: 'MobileBERT',
  execution_backend: 'CPU',
  multi_label_scores: {
    legitimate: 0.04,
    payment_request: 0.88,
    urgency: 0.95,
    payment_pressure: 0.94,
    authority_impersonation: 0.82,
    phishing: 0.05,
    social_engineering: 0.91,
    fraud: 0.93
  },
  predicted_labels: ['PAYMENT_REQUEST', 'URGENCY', 'PAYMENT_PRESSURE', 'AUTHORITY_IMPERSONATION', 'FRAUD'],
  threat_indicators: ['Power / Penalty Coercion Pressure', 'Artificial Time Urgency'],
  latency_ms: 4,
  offline_ready: true
}
*/
```
