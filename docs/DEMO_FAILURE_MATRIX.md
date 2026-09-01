# Q-NETRA AI — Live Demo Failure & Recovery Matrix
**Auditor:** Adversarial UX & Live Demo Resilience Reviewer  
**Date:** 2026-08-31  

---

## 1. 10-Second Panic Recovery Matrix

| What Fails Live on Stage | What Judge Sees | Immediate Action (Under 10s) | Technical Fallback Triggered |
| :--- | :--- | :--- | :--- |
| **Wi-Fi / Cellular Drops Completely** | App remains interactive; shows "Offline Mode" | Scan QR or tap preset normally | `createFallbackCheck()` in `App.tsx` renders `VERIFY (Offline Mode)` or `STOP (Local Threat)`. **Never crashes.** |
| **Express Backend Crashes / 500 Error** | Fetch fails silently | Continue demo flow | Catch handler in `App.tsx` catches network error and engages local fail-safe fallback immediately. |
| **Camera Permission Denied / Blocked** | Viewfinder displays "Camera restricted" | Switch tab in 1 click: **"Upload Image"** or **"Instant Presets"** | `QrScannerModal.tsx` provides 3 preset buttons (Case A, B, C) that trigger full analysis pipeline instantly. |
| **Microphone Permission Denied / Audio Fails** | SpeechRecognition error | Tap quick question buttons | `AskQNetraModal.tsx` has horizontal quick-action chips (`"Why did you stop this?"`, `"Who am I paying?"`). |
| **Demo History Polluted / Messed Up** | History shows unexpected test data | Go to Settings ──► Tap **"Reset to 3 Golden Demo Cases"** | `resetPaymentHistory()` in `paymentHistory.ts` restores pristine Case A, B, C state in <500ms. |
| **Scanned QR is Malformed / Incomplete** | Scanned text is corrupted | System auto-sanitizes | `parseUpiQrString()` parses fallback VPA without throwing unhandled exceptions. |
| **Scanned QR Contains Web Phishing Link** | Scanned URL e.g. `http://bit.ly/pay` | `URL_WARNING` modal opens | User taps **"Analyze Target VPA"** to proceed safely without auto-navigating. |

---

## 2. The 3 Golden Scenarios for Flawless Presentation

### Scenario 1: HERO CASE C — STOP (Electricity Scam)
- **Action:** Tap "SCAN QR" ──► Select "Case C: Electricity Scam STOP".
- **Evidence Screen:**
  - Giant Red **STOP** Card.
  - "The payment looks normal. The network behind it doesn't."
  - 3 Evidence Points: Payment pressure detected (Urgent penalty), Recipient elevated risk (`abc123@upi`), Network conflict.
  - 3-Pillar Mismatch: Claimed *State Electricity Discom* ↮ Actual *Masked Mule VPA* ↮ Trail *7 Nodes, 3 Mule Hops*.
- **Voice Follow-up:** Tap "VOICE Q&A" ──► Ask: *"Why did you stop this?"* ──► Q-NETRA speaks 3 clear reasons.

### Scenario 2: CASE B — VERIFY (Unverified Consulting)
- **Action:** Select "Case B: Unverified Handle VERIFY" (`priya.consulting@okhdfcbank` - ₹4,500).
- **Evidence Screen:**
  - Amber **VERIFY** Card.
  - Reason: Account active <16 days, sparse transaction graph, unverified KYC baseline.

### Scenario 3: CASE A — PROCEED (Clean Commercial Merchant)
- **Action:** Select "Case A: Verified Merchant PROCEED" (`swiggy@icici` - ₹850).
- **Evidence Screen:**
  - Calm Green **PROCEED** Card.
  - Reason: Bundl Technologies Pvt Ltd verified enterprise KYC, direct ICICI clearing settlement, 100% Intent-to-Trail alignment.

---

## 3. Demo Golden Rules
1. **Never perform terminal commands or code edits during a live demo.**
2. **Use the built-in "Reset to 3 Golden Demo Cases" button in Settings if state resets are needed.**
3. **If Wi-Fi is spotty at the venue, turn ON Airplane mode and demonstrate the Offline Fail-Safe mode deliberately as a privacy/security feature.**
