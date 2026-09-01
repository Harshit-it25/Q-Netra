# Q-NETRA AI — Live Demo Failure & Resilience Matrix

**Standard:** Zero-Downtime Presentation Resilience Matrix  
**Scope:** Every critical UI, AI, network, and voice path under failure injection  
**Date:** 2026-09-01  

---

## 1. Subsystem Failure & Graceful Degradation Matrix

| Feature / Action | Failure Mode Injected | System Response & UI State | Fallback Engine | User Safety Impact |
| :--- | :--- | :--- | :--- | :---: |
| **QR Code Scan** | Camera permission denied or revoked | Displays fallback modal with direct UPI VPA and Amount manual input fields. | Manual Entry Form | 🟢 Zero impact; payment check proceeds. |
| **QR Code Decode** | Damaged / unreadable / non-UPI QR | Shows clear amber caution badge: *"Non-standard QR code detected. Please enter merchant UPI ID manually."* | Form Input | 🟢 Safe caution state; no crash. |
| **MobileBERT Model** | Timeout (>500ms), runtime crash, or corrupt weights | Transparently invokes `heuristicContextService.ts`; sets `fallback_used: true`, `model_type: 'HEURISTIC'`. | Local Deterministic NLP | 🟢 0ms downtime; identical safety boundaries. |
| **BHASHINI TTS** | Network timeout, 401 unconfigured, or 502 upstream | Automatically invokes client-side `window.speechSynthesis` (Web Speech API). If unsupported, text displays silently. | Browser SpeechSynthesis / Text | 🟢 Complete text visible; audible fallback. |
| **BHASHINI STT** | Microphone permission denied or network offline | Automatically engages `webkitSpeechRecognition` browser fallback or falls back to text search input. | Browser Speech Recognition / Text Input | 🟢 Voice Q&A falls back to text prompt. |
| **Network Loss (Complete Offline)** | Internet severed (`navigator.onLine === false`) | Q-NETRA engages `createFallbackCheck()`; flags `VERIFY (Offline Mode)` and executes full on-device MobileBERT inference. | Local Offline Engine | 🟢 Offline payment verification protected. |
| **Backend API (Express)** | Server offline or unreachable | Client-side PWA architecture executes local `paymentRules.ts` and `localAIService.ts` entirely within client V8 JIT. | Local First PWA Engine | 🟢 Pre-payment intelligence continues offline. |
| **Corrupt LocalStorage** | Storage quota exceeded or cleared | Initializes clean fallback in-memory state; offers one-tap *"Reset to 3 Golden Demo Cases"* button in Settings. | In-Memory Defaults | 🟢 Instant recovery without app reload. |

---

## 2. Decision Tree Under Compound Failure

```
                  USER INITIATES PAYMENT
                            │
              ┌─────────────┴─────────────┐
              ↓                           ↓
      ONLINE CONNECTION           OFFLINE / NO NETWORK
              ↓                           ↓
      Backend Risk Engine          Client-Side Offline Engine
              ↓                           ↓
   [MobileBERT Available?]       [MobileBERT Available?]
        ├── YES → MobileBERT          ├── YES → MobileBERT (Local JIT)
        └── NO  → Heuristic NLP       └── NO  → Heuristic NLP (Local JIT)
              ↓                           ↓
      Q-NETRA Risk Engine         Q-NETRA Local Policy
              ↓                           ↓
      [BHASHINI Online?]          [Browser TTS Supported?]
        ├── YES → BHASHINI Cloud      ├── YES → Browser Speech
        └── NO  → Browser Speech      └── NO  → Clean Text-Only Display
              ↓                           ↓
       DECISION DELIVERED          DECISION DELIVERED
     (STOP / VERIFY / PROCEED)    (STOP / VERIFY / PROCEED)
```
