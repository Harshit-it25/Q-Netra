# Q-NETRA AI — iQOO & OriginOS Hardware Gap Analysis
**Auditor:** Senior Android Engineer & Hardware QA Lead  
**Date:** 2026-08-31  

---

## 1. Hardware & Platform Separation Table

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│   CATEGORY 1: VERIFIED ON CURRENT ENVIRONMENT                          │
│   • Desktop Chrome / Edge V8 JIT CPU execution                         │
│   • Standard Android Chrome / Mobile WebView rendering                 │
│   • In-memory jsQR 2D canvas frame decoding (sub-15ms)                 │
│   • Web Speech API speech synthesis & recognition (en-IN)              │
│   • Offline fail-safe state switching                                  │
│   • LocalStorage persistence & deterministic golden demo reset         │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   CATEGORY 2: EXPECTED ON IQOO (BASED ON SPECS)                        │
│   • Snapdragon 8 Gen 2 / Gen 3 high-performance Kryo CPU cores        │
│   • 120Hz AMOLED touch responsiveness                                  │
│   • OriginOS WebView hardware acceleration                             │
│   • Sub-2ms regex token classification latency                         │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   CATEGORY 3: UNKNOWN UNTIL PHYSICAL LOANER TEST                       │
│   • OriginOS camera permission dialog behavior & auto-focus speed      │
│   • WebNN NPU driver availability in Vivo/iQOO default browser         │
│   • OriginOS background memory management & aggressive tab freezing   │
│   • SpeechRecognition language model availability on OriginOS CN/Global│
│   • Thermal throttling impact during continuous 50-scan stress testing │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. OriginOS-Specific Technical Risks & Gaps

### 1. Web Speech API on OriginOS / Vivo Devices
- **Risk:** Some OriginOS/Vivo default browsers disable or replace Google's Speech-to-Text backend with proprietary engines or fail silently on `webkitSpeechRecognition`.
- **Mitigation / Fallback:** `AskQNetraModal.tsx` contains text input fallback and quick-question buttons. If STT fails, user can type or tap preset questions with zero friction.

### 2. Camera Stream Lifecycle & Green Privacy Dot
- **Risk:** OriginOS security monitors camera access strictly. If a WebRTC stream is left open in background, OriginOS will display a persistent warning toast.
- **Verification:** In `QrScannerModal.tsx`, `stopCamera()` halts all media tracks immediately upon matrix decode.

### 3. Aggressive Background Process Termination
- **Risk:** OriginOS is known for strict battery management policies that kill background web tabs.
- **Impact:** Q-NETRA state stored in React memory might reset if the user switches apps.
- **Mitigation:** All active state is backed by `localStorage` (`qnetra_checks`). When reopened, `loadPaymentHistory()` deterministically recovers the active checks.

---

## 3. On-Site Loaner Device 10-Minute Validation Checklist (Pune)

1. [ ] **Step 1:** Connect iQOO loaner device to event Wi-Fi.
2. [ ] **Step 2:** Open Chrome on iQOO and navigate to local demo URL.
3. [ ] **Step 3:** Open Camera Scanner — verify OriginOS camera permission prompt and check autofocus on physical QR.
4. [ ] **Step 4:** Verify instant camera shutdown upon QR scan (check green dot disappearance).
5. [ ] **Step 5:** Test Voice Q&A ("Hi Q-NETRA, why did you stop this?") — verify TTS audio output on iQOO speaker.
6. [ ] **Step 6:** Disconnect Wi-Fi (Airplane mode) — test scanning Golden Case C offline; verify fail-safe offline alert.
7. [ ] **Step 7:** Tap "Reset to 3 Golden Demo Cases" in Settings — verify deterministic state restoration in <1 second.
