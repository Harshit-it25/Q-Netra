# Q-NETRA AI — Network & Privacy Audit (Phase 5 Hardened)

This document provides a technical audit of all network transactions, on-device boundaries, data minimization guarantees, and privacy lifecycles verified in Q-NETRA AI.

---

## 1. Core Security & Privacy Philosophy

> "Collect less. Process locally. Transmit only what is needed. Never hide network activity. Fail safely."

Q-NETRA is built on a **local-first, data-minimizing architecture**. The application maintains a strict architectural boundary between **Data Security** (handling of user data, sensors, and tokens) and **Financial Fraud Risk** (evaluating whether a counterparty or syndicate is fraudulent).

---

## 2. Comprehensive Network Endpoint Inventory

| Endpoint | Method | Trigger Event | Transmitted Payload | Minimized / Excluded Data |
| :--- | :--- | :--- | :--- | :--- |
| `/api/analyze-payment` | `POST` | User initiates payment check via QR scan or manual entry | `{ recipient, amount, note, context: { payment_request, urgency, payment_pressure, authority_claim, threat_indicators, inference_engine, latency_ms } }` | **Excluded:** Camera images, raw QR frames, user contacts, SMS inbox, GPS coordinates, microphone audio. |
| `/api/network-graph` | `GET` | User opens Network Graph visualizer or investigates connected syndicates | Query parameters: `?vpa=<target>&risk=<risk>` | Read-only graph topology. No personal credentials or device secrets transmitted. |
| `/api/analyze-message` | `POST` | User inspects suspicious SMS text / APK download link | `{ text }` | Only user-submitted message snippet. No contact address book or unselected SMS threads. |
| `/api/ask-qnetra` | `POST` | User asks cybersecurity advisor a question | `{ question }` | User query string only. |
| `/api/health` | `GET` | System heartbeat / readiness probe | None | Returns `{ status: "ok", version, engine, time }`. |

---

## 3. Data Processing Boundary & Flow

```text
[ USER CAMERA / SCANNER ]
           │
           ▼
[ LOCAL JSQR DECODER ] (Decodes entirely on-device)
           │
           ├─► Immediately closes camera stream (stream.getTracks().forEach(t => t.stop()))
           ├─► Discards canvas pixel buffer from memory
           │
           ▼
[ LOCAL CONTEXT AI ] (On-Device Client V8 / JIT Execution)
           │
           ├─► Evaluates payment pressure, authority impersonation, urgency
           ├─► Computes threat indicators in <5ms with zero network transmission
           │
           ▼
[ MINIMAL DATA DISPATCH ] (HTTPS / TLS 1.3)
           │
           ▼
[ BACKEND RISK ENGINE & RISKGRAPH ]
           │
           ├─► Authoritative entity resolution & multi-hop syndicate detection
           ├─► 4-Layer Trust Chain computation
           │
           ▼
[ DECISION: PROCEED / VERIFY / STOP ]
```

---

## 4. Specific Privacy Guarantees & Verification Results

### A. Camera Privacy Lifecycle
- The camera is activated **only** while the QR Scanner modal is open and in `camera` mode.
- As soon as a QR code is detected:
  1. The frame loop (`requestAnimationFrame`) is cancelled immediately.
  2. All `MediaStreamTrack` instances are stopped (`track.stop()`).
  3. The video element `srcObject` is cleared (`null`).
  4. Raw pixel arrays are dereferenced and garbage-collected.
- **Audited:** Zero raw camera frames or image blobs are transmitted across any network boundary.

### B. Data Minimization
- The backend receives **only**:
  - Counterparty UPI identifier (VPA)
  - Requested transaction amount
  - Optional user-provided payment note
  - Pre-computed on-device risk flags (e.g., `payment_pressure: true`)
- No PII (personally identifiable information), device identifiers, phone numbers, contacts, or location data are bundled with the transaction request.

### C. Link & Redirection Protection
- When a scanned QR code contains a standard web URL (`http://` or `https://`) rather than a native `upi://` URI, Q-NETRA triggers a **Link Detection Warning**:
  - The URL is **not** automatically opened or navigated to.
  - The user is alerted that a web link was detected and given the choice to analyze the target or cancel.

### D. Safe-Failure Guard
- If a network request encounters a timeout, server interruption, or malformed response:
  - The system **fails safely** to on-device context evaluation.
  - An unresolved or interrupted check is **never silently marked as safe or auto-approved** (`VERIFY (Offline)` is shown).

---

## 5. Security Scan & Secrets Audit

A comprehensive repository audit for `API_KEY`, `SECRET`, `PASSWORD`, `TOKEN`, `JWT`, `console.log`, `TODO`, `FIXME` confirmed:
- No hardcoded API keys in frontend client bundles.
- `GEMINI_API_KEY` is loaded strictly on the backend Node.js process via `process.env`.
- No sensitive customer banking data or secrets leaked to logs.
