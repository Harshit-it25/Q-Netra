# Q-NETRA AI — Production Architecture Refactoring Report

**Date:** 2026-08-31  
**Architect:** Senior Software Architect & Security Engineer  
**Status:** Completed & Fully Validated  

---

## 1. Executive Summary

The Q-NETRA AI codebase has been refactored from a prototype architecture into a modular, enterprise-grade codebase. The restructuring enforced strict separation of concerns, centralized API clients, isolated pure domain models, modularized backend services and controllers, segregated demo fixtures, added automated unit/integration tests, and verified zero regressions across UI, security headers, rate limiters, and research suites.

---

## 2. Before vs. After Architecture Comparison

| Architectural Aspect | Before Refactor | After Refactor (Production-Grade) |
| :--- | :--- | :--- |
| **Domain Layer** | Mixed inside UI components & flat `types.ts` | Isolated pure domain models (`src/domain/payment`, `risk`, `identity`, `network`, `story`, `trust`, `voice`, `message`) with pure rules and zero React dependencies. |
| **API Client Layer** | Scattered `fetch()` calls in components (`App.tsx`, `NetworkGraphScreen.tsx`, etc.) | Centralized, typed API clients (`src/services/api/apiClient.ts`, `paymentApi.ts`, `networkApi.ts`, `messageApi.ts`, `advisorApi.ts`) with timeout and error normalization. |
| **On-Device AI Engine** | Monolithic `src/lib/onDeviceAI.ts` with ambiguous naming | Dedicated service (`src/services/ai/onDeviceContextService.ts`) + hardware detector (`deviceCapabilityService.ts`). |
| **Backend Architecture** | Monolithic 250-line `server.ts` containing routes, controllers, middleware, and logic | Modular Express architecture (`server/app/`, `server/middleware/`, `server/routes/`, `server/controllers/`, `server/services/`, `server/repositories/`). |
| **Demo Fixtures** | Mixed across `src/data.ts` and `server/data/knowledgeBase.ts` | Isolated in `src/data/demo/` and `server/data/demo/` with explicit demo disclosures. |
| **Automated Testing** | None | 13 automated unit & integration tests (`tests/run_all_tests.ts`, `npm test`). |

---

## 3. Inventory of Newly Created & Refactored Modules

### A. Frontend Services & Domain Layer
1. `src/domain/payment/types.ts` & `paymentRules.ts`: UPI normalization and validation.
2. `src/domain/risk/types.ts` & `riskRules.ts`: Canonical risk levels and evaluation contracts.
3. `src/domain/identity/types.ts`: Recipient KYC domain model.
4. `src/domain/network/types.ts`: Node and link graph types.
5. `src/domain/story/types.ts`: 3-Pillar Intent-to-Trail correlation types.
6. `src/domain/trust/types.ts`: Trust chain step interfaces.
7. `src/domain/message/types.ts`: SMS, phishing, and APK threat patterns.
8. `src/domain/voice/types.ts`: Voice assistant intent types.
9. `src/services/api/apiClient.ts`: Reusable HTTP client wrapper.
10. `src/services/api/paymentApi.ts`: Typed payment evaluation client.
11. `src/services/api/networkApi.ts`: Dynamic graph & office kit client.
12. `src/services/api/messageApi.ts`: Phishing threat analyzer client.
13. `src/services/api/advisorApi.ts`: Cybersecurity advisor client.
14. `src/services/ai/onDeviceContextService.ts`: Pure on-device context evaluation engine.
15. `src/services/device/deviceCapabilityService.ts`: Platform and hardware detector.
16. `src/services/qr/upiParserService.ts`: Strict UPI URI parser.
17. `src/services/qr/qrScannerService.ts`: Camera lifecycle & in-memory jsQR decoder.
18. `src/services/sms/linkSafetyService.ts` & `smsInspectionService.ts`: On-device SMS inspection.
19. `src/services/voice/speechRecognitionService.ts`, `speechSynthesisService.ts`, `voiceIntentService.ts`.
20. `src/services/storage/localStorageService.ts` & `paymentHistoryService.ts`.

### B. Backend Layer (`server/`)
1. `server/app/config.ts`: Centralized configuration.
2. `server/app/server.ts` & `routes.ts`: Modular server factory.
3. `server/middleware/cors.ts`: Environment-aware CORS guard.
4. `server/middleware/rateLimit.ts`: In-memory IP/route rate limiters.
5. `server/middleware/securityHeaders.ts`: Strict CSP, HSTS, X-Frame-Options.
6. `server/middleware/errorHandler.ts`: Safe error masking.
7. `server/repositories/entityRepository.ts` & `graphRepository.ts`: Data access layer.
8. `server/services/payment/paymentRiskService.ts`: Master fraud risk pipeline.
9. `server/services/identity/identityService.ts`: Entity KYC resolution.
10. `server/services/network/riskGraphService.ts`: Dynamic graph synthesis.
11. `server/services/story/storyCorrelationService.ts`: 3-Pillar mismatch engine.
12. `server/services/trust/trustChainService.ts`: 4-stage evidence timeline.
13. `server/services/message/messageAnalysisService.ts`: Phishing & APK threat detector.
14. `server/services/ai/geminiAdvisorService.ts`: LLM forensic explanations.
15. `server/services/officeKit/officeKitService.ts`: Investigation summary generator.
16. `server/controllers/` & `server/routes/`: Specialized controllers and Express routers for payment, network, message, advisor, and health.

---

## 4. Verification & Validation Metrics

| Test / Gate | Command | Result |
| :--- | :--- | :---: |
| **TypeScript Type Check** | `npm run lint` (`tsc --noEmit`) | **PASS (0 errors)** |
| **Automated Test Suite** | `npm test` (`tests/run_all_tests.ts`) | **PASS (13/13 passed)** |
| **Production Build** | `npm run build` | **PASS (3.09s, zero errors)** |
| **Security Vulnerability Audit** | `npm audit` | **PASS (0 vulnerabilities)** |
| **Research Reproduction Suite** | `python research/scripts/generate_reports.py` | **PASS (All datasets & reports intact)** |

---

## 5. Security & Privacy Enhancements Verified

- **Zero Camera Uploads:** In-memory frame processing; tracks terminated immediately.
- **Strict Rate Limiting:** 120 req/min for standard endpoints, 30 req/min for AI endpoints.
- **Security Headers:** Strict Content Security Policy (`frame-ancestors 'none'`, `object-src 'none'`), `nosniff`, `X-Frame-Options: DENY`.
- **CORS Protection:** Rejects unauthorized cross-origin browser requests.
- **Data Boundaries:** Seeded demo data explicitly segregated from production services and research datasets.
