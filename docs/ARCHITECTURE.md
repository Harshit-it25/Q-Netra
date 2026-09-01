# Q-NETRA AI — Production Architecture

**Version:** 3.5.0-rel  
**Architecture Classification:** Privacy-First Hybrid (On-Device Heuristic + Multi-Hop Graph Risk Intelligence)

---

## 1. Architectural Principles

Q-NETRA AI is structured into strict, decoupled layers where UI presentation is completely isolated from domain logic, security policies, storage operations, and external API requests:

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Presentation                        │
│  (React 19, Tailwind CSS, Material Symbols, Micro-motions)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Frontend Services                     │
│  • onDeviceContextService      • qrScannerService           │
│  • upiParserService            • smsInspectionService       │
│  • speechRecognitionService    • paymentHistoryService      │
│  • centralized apiClient (paymentApi, networkApi, etc.)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         Domain Layer                        │
│  Pure business models, validation rules, normalization      │
│  (Zero UI / React / Browser dependencies)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP /api JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend App & Middleware                 │
│  • Environment CORS        • Strict Security Headers (CSP)  │
│  • Rate Limiting (IP/Path) • Error Masking & Sanitization   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Server Intelligence Services               │
│  • paymentRiskService      • storyCorrelationService        │
│  • riskGraphService        • identityService                │
│  • trustChainService       • messageAnalysisService         │
│  • geminiAdvisorService    • officeKitService               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Repositories & Data                     │
│  • entityRepository        • graphRepository                │
│  • Seeded Demo Data        • Research Isolation Boundary    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
q-netra-ai/
├── src/
│   ├── domain/               # Pure business models & validation rules
│   │   ├── payment/          # PaymentCheck, LocalPaymentContext, rules
│   │   ├── risk/             # RiskLevel, RiskEvaluationResult
│   │   ├── identity/         # RecipientIdentity KYC types
│   │   ├── network/          # NetworkNode, NetworkLink, NetworkGraphData
│   │   ├── story/            # IntentTrailCorrelation types
│   │   ├── trust/            # TrustChainStep types
│   │   ├── message/          # ThreatPattern, SmsAnalysisItem
│   │   └── voice/            # VoiceIntentType, VoiceAssistantState
│   ├── services/             # Frontend business operations & clients
│   │   ├── api/              # apiClient, paymentApi, networkApi, messageApi, advisorApi
│   │   ├── ai/               # onDeviceContextService
│   │   ├── qr/               # qrScannerService, upiParserService
│   │   ├── sms/              # smsInspectionService, linkSafetyService
│   │   ├── voice/            # speechRecognitionService, speechSynthesisService, voiceIntentService
│   │   ├── storage/          # localStorageService, paymentHistoryService
│   │   └── device/           # deviceCapabilityService
│   ├── data/                 # Explicit demo fixtures
│   │   └── demo/             # goldenCases, demoGraphs, demoSmsInbox
│   ├── components/           # Presentation & UI orchestration
│   ├── App.tsx               # Root component
│   └── types.ts              # Canonical type registry
│
├── server/
│   ├── app/                  # Server entry, config, route registry
│   │   ├── config.ts
│   │   ├── routes.ts
│   │   └── server.ts
│   ├── middleware/           # Production security middleware
│   │   ├── cors.ts
│   │   ├── rateLimit.ts
│   │   ├── securityHeaders.ts
│   │   └── errorHandler.ts
│   ├── repositories/         # Data access interfaces
│   │   ├── entityRepository.ts
│   │   └── graphRepository.ts
│   ├── services/             # Core fraud & forensic engines
│   │   ├── payment/          # paymentRiskService
│   │   ├── identity/         # identityService
│   │   ├── network/          # riskGraphService
│   │   ├── story/            # storyCorrelationService
│   │   ├── trust/            # trustChainService
│   │   ├── message/          # messageAnalysisService
│   │   ├── ai/               # geminiAdvisorService
│   │   └── officeKit/        # officeKitService
│   ├── controllers/          # HTTP request handlers
│   └── routes/               # Express router modules
│
├── research/                 # Completely isolated ML & empirical evaluation suite
├── tests/                    # Automated unit and integration test suite
└── docs/                     # Full architecture & security documentation
```
