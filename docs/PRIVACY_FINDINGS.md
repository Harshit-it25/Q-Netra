# Q-NETRA AI — Privacy & Data Lifecycle Audit
**Auditor:** Senior Privacy Engineer & Data Protection Reviewer  
**Date:** 2026-08-31  

---

## 1. Camera Lifecycle & Frame Disposal

### Code Path Traced: `src/components/QrScannerModal.tsx`
```
User Opens Scanner ──► navigator.mediaDevices.getUserMedia() ──► <video> streams to HTML5 <canvas>
                                                                        │
                                                                        ▼
                                                       jsQR decodes image matrix (in memory)
                                                                        │
                                                                        ▼
                                                   stopCamera() called IMMEDIATELY:
                                                   stream.getTracks().forEach(t => t.stop())
                                                                        │
                                                                        ▼
                                                  Raw frame buffer garbage-collected in V8
                                                  ONLY decoded string passed to parser
```

### Privacy Verification Checklist
- [x] **Zero Cloud Upload:** Network proxy traces confirm zero JPEG, PNG, WebP, or raw pixel buffer bytes leave the client.
- [x] **Immediate Release:** `stopCamera()` halts all video tracks upon the first valid QR decode.
- [x] **Unmount Cleanup:** `useEffect` returns `stopCamera()`, releasing camera hardware when the modal is dismissed or the tab is switched.
- [x] **Android Privacy Indicator:** The green camera status indicator in Android 12+ turns on during viewfinder display and turns off immediately upon QR capture.

---

## 2. Microphone & Voice Assistant Data Boundary

### Code Path Traced: `src/components/AskQNetraModal.tsx` & `src/lib/voiceAssistant.ts`
- **Speech-to-Text (STT):** Uses browser-native Web Speech API (`webkitSpeechRecognition`).
  - Audio processing is managed by the browser engine.
  - Raw audio `.wav` or `.pcm` streams are **NEVER recorded, saved, or uploaded** to the Q-NETRA backend.
- **Intent Execution:**
  - `classifyVoiceIntent(query)` uses client-side regex matching to classify queries into 15 static intent tokens.
  - Responses are generated purely client-side from the active `PaymentCheck` context.
- **Text-to-Speech (TTS):**
  - Uses browser-native `SpeechSynthesisUtterance` locally.
  - No third-party cloud voice APIs (e.g. ElevenLabs, Google Cloud TTS) are invoked.
- **Microphone Termination:**
  - Recognition is set to `continuous = false`. The mic automatically halts after a single spoken utterance.

---

## 3. SMS Shield Data Minimization & Privacy

### Code Path Traced: `src/lib/smsShield.ts` & `src/components/CheckMessageModal.tsx`
1. **Default State (Private Mode):**
   - Without user action, `qnetra_sms_permission` is `SMS_PERMISSION_OFF`.
   - The application does not attempt any message inspection or background reading.
2. **Opt-In SMS Shield:**
   - In the web prototype, permitted messages are inspected **100% locally on-device**.
   - Raw message bodies are **NEVER sent to the backend** during standard operation.
   - Only when a user explicitly correlates a message to a payment (e.g. clicking "Correlate with Payment Shield") are the extracted VPA (`abc123@upi`) and amount transmitted to `/api/analyze-payment`.
3. **Data Isolation:**
   - Deleting an analysis record via `deleteSmsAnalysisById(id)` removes it from `localStorage`.
   - Q-NETRA has zero access or ability to alter the native Android SMS inbox.

---

## 4. Local Persistence & Storage Inventory

| Storage Medium | Key / Identifier | Data Stored | Lifetime | Privacy Impact |
| :--- | :--- | :--- | :--- | :--- |
| `localStorage` | `qnetra_checks` | Payment history array (Recipient, amount, note, trust chain) | Persistent until user deletion / browser wipe | **P2 (Medium)**: Unencrypted local data |
| `localStorage` | `qnetra_sms_permission` | Permission enum string (`SMS_PERMISSION_GRANTED`, etc.) | Persistent | None (Config flag) |
| `localStorage` | `qnetra_sms_history` | Analyzed SMS items array | Persistent until user deletion | **P2 (Medium)**: Unencrypted SMS excerpts |
| `sessionStorage` | None | None | Transient | Clean |
| `IndexedDB` | None | None | None | Clean |
| `Cache API` | `qnetra-static-v1` | Static assets only (`/`, `/index.html`, `/manifest.json`) | Managed by SW | Clean (No API data cached) |
| `Cookies` | None | None | None | Clean (Cookie-free architecture) |

---

## 5. Network Request Tracing & Destination Matrix

| Trigger | HTTP Method | Destination | Data Transmitted | Justification |
| :--- | :---: | :--- | :--- | :--- |
| **Scan QR** | None | Local Memory | Camera frame | Decoded on-device via `jsQR` |
| **Analyze Payment** | POST | `/api/analyze-payment` | `{ recipient, amount, note, context }` | Minimal payload required for graph lookup |
| **View Graph** | GET | `/api/network-graph` | `?vpa=...&risk=...` | Required to retrieve multi-hop node coordinates |
| **Ask Voice Q&A** | None | Local Memory | User spoken query | Resolved deterministically on client |
| **Forensic Dossier** | POST | `/api/office-kit/investigate` | `{ vpa }` | Generates summary for investigator handover |
| **Gemini Forensic Note** | POST (Server) | `generativelanguage.googleapis.com` | `{ vpa, amount, riskLevel, note, signals }` | Generates 2-sentence forensic security reason |

---

## 6. Service Worker Privacy Validation (`public/sw.js`)

```javascript
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // PRIVACY & SAFETY GUARD: NEVER cache dynamic API risk/payment/investigation requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  // ... static shell cache only
});
```
- **Verified:** All `/api/*` network requests bypass the Service Worker cache completely.
- **Result:** No sensitive payment analysis, SMS text, or graph node coordinates are stored in the Service Worker Cache Storage.
