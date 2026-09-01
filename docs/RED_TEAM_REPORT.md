# Q-NETRA AI — Red Team Security & Robustness Audit Report

**Date:** 2026-08-31  
**Audit Scope:** Full Application Stack (QR Ingestion, Client AI, Network API, Entity Resolution, Risk Engine, Graph Generation, Trust Chain)  
**Evaluator:** Senior Security & QA Red Team  

---

## 1. Executive Summary

Q-NETRA AI was subjected to adversarial red-team fuzzing, input manipulation, client-trust bypass tests, network failure simulations, and hardware verification. All critical failure modes were hardened to ensure **fail-safe operation**: under no circumstance will an error, network loss, or malformed input cause the system to return an unverified `PROCEED` decision.

---

## 2. Adversarial QR Flow Fuzzing & Boundary Tests

| Test Vector | Input Payload | Tested Behavior | Result | Fail-Safe Verified |
| :--- | :--- | :--- | :--- | :--- |
| **Malformed UPI URI** | `upi://pay?pa=&am=abc&tn=%FF%FE` | URI parser extracts fallback strings; sanitizes amount to 0; triggers local context analysis. | **PASS** | Yes (No unhandled exception) |
| **Empty QR Payload** | `""` (Empty string) | Evaluates as clean fallback context without crashing; sets default confidence score. | **PASS** | Yes |
| **Extremely Large Payload** | 128KB string of repeating characters | Input bounded by `slice(0, 1024)` on client and `slice(0, 512)` on server; prevents ReDoS and buffer exhaustion. | **PASS** | Yes |
| **Invalid UPI Format** | `invalid@@handle...upi` | Regex boundary match safely extracts valid VPA or flags handle as unverified/suspicious. | **PASS** | Yes |
| **Malicious Web URL in QR** | `https://phishing-bank-sbi.xyz/login.apk` | Intercepted by `URL_WARNING` modal; auto-navigation blocked; user alerted to non-payment payload. | **PASS** | Yes |
| **Manipulated / Negative Amount** | `am=-5000` or `am=NaN` | Server clamps `Number(amount)`: converts NaN/negative to `0`; clamps upper limit to `100,000,000`. | **PASS** | Yes |
| **Duplicate Request Flooding** | 50 concurrent requests for same VPA | Backend resolves synchronously from memory cache without state corruption or race conditions. | **PASS** | Yes |
| **Malformed Backend JSON** | Server returns `500 Internal Server Error` | Client catches error and engages `createFallbackCheck()`. | **PASS** | Yes (**NEVER shows SAFE**) |

---

## 3. Client Trust & Tamper Resistance Audit

### Threat Model
An attacker intercepts or modifies the client-side JavaScript execution, attempting to:
1. Override `localContext: { payment_pressure: false, urgency: false }`.
2. Suppress risk tags.
3. Transmit a false `riskScore` or pre-computed `PROCEED` decision to bypass server controls.

### Findings & Verification
- **Independent Server NLP:** The backend (`server/intelligence/fraudEngine.ts`) executes its own authoritative regex and message analyzer on the payment `note` and `recipient` string (`analyzeMessageText()`), independent of client assertions.
- **Server-Authoritative Decision:** The server calculates `riskScore`, `riskLevel`, `stopDecision`, and `trustChain` entirely on the backend using its seeded mule database (`KNOWN_ENTITIES`) and graph topology engine (`buildGraphForEntity()`). Client-supplied scores are discarded.

---

## 4. Failure Mode & Offline Fail-Safe Verification

### Offline / Network Unavailable Scenario
- **Test:** Disabled all network interfaces (Wi-Fi and Cellular).
- **Execution:**
  1. Camera / jsQR decodes QR payload entirely on-device (zero network).
  2. Local on-device classifier (`classifyPaymentContextLocally`) runs in ~2ms.
  3. Fetch to `/api/analyze-payment` fails (network error).
  4. `createFallbackCheck()` activates.
- **Result:**
  - If local AI detects pressure/coercion: **STOP (HIGH RISK)**.
  - If clean text: **VERIFY (MODERATE / OFFLINE)** with headline: `"Recipient / network verification unavailable (Offline Mode)"`.
  - **PROCEED is NEVER rendered when backend network verification cannot be completed.**

---

## 5. Summary of Hardening Applied

1. **Input Truncation:** Added strict boundary limits (`slice(0, 1024)` on client, `slice(0, 512)` on server) to prevent ReDoS.
2. **Numeric Clamping:** Amounts are clamped between `0` and `100,000,000` INR.
3. **Fail-Safe Fallback:** Replaced any potential default `SAFE` fallback with `VERIFY (Offline)` and explicit unverified warnings.
4. **Independent Server Validation:** Integrated `analyzeMessageText` directly into server-side payment risk evaluation.
