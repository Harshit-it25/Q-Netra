# Q-NETRA AI — Final Bug & Vulnerability Register

**Standard:** Zero-Sugarcoating Defect Tracking (P0 Critical • P1 High • P2 Medium • P3 Low)  
**Date:** 2026-09-01  

---

## 1. Defect Register

| Bug ID | Severity | Description & Root Cause | Reproduction Steps | Fix Implemented | Status |
| :--- | :---: | :--- | :--- | :--- | :---: |
| **BUG-01** | **P1** | Backend `/api/checks` route returned 404 when clients posted directly to `/api/checks` instead of legacy `/api/analyze-payment`. | `POST /api/checks` with valid payload -> 404 Not Found. | Added `/checks` route alias in `server/routes/paymentRoutes.ts`. | **RESOLVED & VERIFIED** |
| **BUG-02** | **P1** | `POST /api/voice/synthesize` returned HTTP 502 instead of HTTP 400 when payload exceeded 2000 character validation limit. | `POST /api/voice/synthesize` with 2500 character text -> HTTP 502. | Updated `server/controllers/voiceController.ts` to return HTTP 400 on `TEXT_TOO_LONG` and `INVALID_TEXT`. | **RESOLVED & VERIFIED** |
| **BUG-03** | **P2** | `GET /api/health` response omitted `service` identifier required for automated gateway health probes. | `GET /api/health` returned json without `service` property. | Added `service: 'q-netra-ai-backend'` in `server/controllers/healthController.ts`. | **RESOLVED & VERIFIED** |
| **BUG-04** | **P2** | `PaymentController` did not alias `recipientVpa` or `intentNote` parameter formats from certain client versions. | `POST /api/checks` with `{ recipientVpa: '...' }` resulted in unpopulated VPA. | Added fallback aliasing (`req.body.recipient ?? req.body.recipientVpa`) in `paymentController.ts`. | **RESOLVED & VERIFIED** |
| **BUG-05** | **P3** | Header and payload sanitization did not explicitly strip HTML script tags from intent recommendation outputs. | Send `<script>alert(1)</script>` in intent note. | Integrated regex sanitization in `paymentRiskService.ts` and `paymentRules.ts`. | **RESOLVED & VERIFIED** |

---

## 2. Verification Log

All 5 registered defects were diagnosed, remediated, and verified using automated test suites (`tests/backend_and_security_test.ts` and `tests/run_all_tests.ts`). Zero P0 or P1 blocking bugs remain open.
