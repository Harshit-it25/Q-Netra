# Q-NETRA AI — Data Flow Architecture

This document maps the end-to-end data lifecycle from input capture to risk decision and UI presentation.

---

## 1. Primary Pre-Payment Risk Pipeline

```
QR Scan / SMS / Manual Input
            │
            ▼
┌───────────────────────────────────────┐
│     QR / SMS / Payment Service        │
│ • Local in-memory camera decode       │
│ • Camera tracks immediately released  │
│ • Pure UPI parser extracts VPA/amount │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│      On-Device AI Context Service     │
│ • Evaluates urgency & coercion tokens │
│ • Runs deterministically in <5ms      │
│ • Produces LocalPaymentContext        │
└───────────────────┬───────────────────┘
                    │
                    ▼ (Encrypted JSON Payload to /api/analyze-payment)
┌───────────────────────────────────────┐
│      Payment Risk Service (Backend)   │
│                                       │
│ 1. Identity Resolution                │
│    └── entityRepository KYC lookup    │
│                                       │
│ 2. Network Graph Analysis             │
│    └── riskGraphService (fan-out)     │
│                                       │
│ 3. 3-Pillar Story Correlation         │
│    └── Claimed Story vs Money Trail   │
│                                       │
│ 4. Trust Chain Synthesis              │
│    └── 4-Stage Evidence Timeline      │
│                                       │
│ 5. AI Forensic Explanation            │
│    └── Gemini 3.7 Flash / Fallback    │
└───────────────────┬───────────────────┘
                    │
                    ▼ (Canonical Decision Object)
┌───────────────────────────────────────┐
│           UI Decision Screen          │
│ • Decision Badge (STOP/VERIFY/PROCEED)│
│ • Trust Chain 4-Step Breakdown        │
│ • Multi-Hop Network Topology SVG      │
│ • Local Payment History Persisted     │
└───────────────────────────────────────┘
```

---

## 2. Privacy Guarantees Across the Flow

1. **Zero Video Uploads:** QR code matrices are processed in-memory via HTML5 canvas and jsQR on the client device. Video frames are never transmitted over network.
2. **Camera Resource Protection:** Media tracks are unconditionally stopped upon QR detection or modal dismissal.
3. **Bounded Context Payload:** Only structured text tokens (urgency flags, extracted amounts) are sent to backend analysis.
4. **Local History Ownership:** Transaction logs are stored strictly within client-side localStorage and can be individually deleted or completely purged by the user at any time.
