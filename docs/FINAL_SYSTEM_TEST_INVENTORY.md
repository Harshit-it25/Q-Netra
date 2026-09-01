# Q-NETRA AI — Full System Test & Component Inventory

**Standard:** Zero-Sugarcoating Strict Component Classification  
**Classification Types:** `REAL` • `SIMULATED` • `SEEDED` • `FALLBACK` • `NOT IMPLEMENTED`  
**Date:** 2026-09-01  

---

## 1. System Inventory Table

| Component / Subsystem | Location | Classification | Detailed Truth & Operational State |
| :--- | :--- | :---: | :--- |
| **MobileBERT Model Weights** | `research/models/` | **REAL** | 25.3M parameter MobileBERT bottleneck Transformer, fine-tuned on multi-label corpus, exported to ONNX (39.9MB) and quantized to INT8 (10.2MB). |
| **Local AI Tokenizer & Inference** | `src/services/localAI/` | **REAL** | Local WordPiece tokenization and multi-label probability calculation running on client V8 JIT / CPU. |
| **Deterministic Heuristic NLP** | `src/services/localAI/` | **FALLBACK** | Pure offline regex & pattern rules. Activates strictly when MobileBERT times out, crashes, or fails. |
| **BHASHINI Backend Speech Proxy** | `server/services/bhashini/` | **REAL** | Dedicated Express proxy routing requests to Bhashini Dhruva gateway for STT & TTS. Secrets never touch frontend. |
| **Browser Speech Synthesis / Recognition** | `src/services/voice/` | **FALLBACK** | Web Speech API and `SpeechSynthesis` providing local zero-latency audio fallback when BHASHINI is offline. |
| **QR Code Scanner** | `src/components/QrScannerModal.tsx` | **REAL** | In-memory canvas stream decoding via `jsQR`. Zero camera frame upload. Camera tracks killed on modal close. |
| **UPI URI Parser & Sanitizer** | `src/domain/payment/` | **REAL** | Strict RFC/NPCI UPI URI decoding, VPA normalization, amount extraction, and parameter sanitization. |
| **Story ↮ Intent Correlation** | `src/domain/payment/` | **REAL** | 4-layer comparison evaluating semantic alignment between Payment Story, Recipient Metadata, and Network Route. |
| **Relational RiskGraph & Mule Topology** | `src/domain/payment/` | **SEEDED** | 7-node syndicate graph mapping known mule accounts, device clusters, and IP links based on I4C fraud patterns. |
| **Backend REST Endpoints** | `server/routes/` | **REAL** | Express API endpoints (`/api/checks`, `/api/network`, `/api/voice/*`, `/api/messages/inspect`, `/api/health`). |
| **SMS Scam Inspection UI** | `src/components/CheckMessageModal.tsx` | **SIMULATED** | User-paste manual inspection for phishing links, APK files, and coercion. |
| **Native Android SMS Inbox Access** | Android Permissions | **NOT IMPLEMENTED** | Web PWA build does not access Android system SMS inbox without native APK bridge. Clearly disclosed. |
| **Snapdragon NPU Native Execution** | Hardware Layer | **FALLBACK (CPU)** | Runs on V8 JIT / CPU. Native Qualcomm Hexagon NPU QNN execution requires Android NDK wrapper. |
| **Local Storage / Persistence** | `localStorage` | **REAL** | Local client-side payment history persistence and instant reset functionality. |

---

## 2. Component Security & Privacy Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT BOUNDARY                       │
│  - In-memory QR decoding (jsQR) [ZERO FRAME UPLOAD]         │
│  - MobileBERT Context Model (INT8) [LOCAL ON-DEVICE]        │
│  - Heuristic Safety Rules [LOCAL FALLBACK]                  │
│  - Web Speech API [LOCAL FALLBACK]                          │
│  - Local Payment History [LOCALSTORAGE ONLY]                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (Payload only)
┌──────────────────────────────▼──────────────────────────────┐
│                   Q-NETRA BACKEND PROXY                     │
│  - API Key & User ID Protection [ZERO SECRET EXPOSURE]      │
│  - Rate Limiting & Input Validation                         │
│  - CORS & Security Headers                                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ SSL (Ephemeral Audio / Text)
┌──────────────────────────────▼──────────────────────────────┐
│                      BHASHINI CLOUD                         │
│  - NLTM Dhruva Speech-to-Text (ASR)                         │
│  - NLTM Dhruva Text-to-Speech (TTS)                         │
└─────────────────────────────────────────────────────────────┘
```
