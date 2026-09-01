# Q-NETRA AI — API Architecture & Contracts

All backend endpoints are prefixed with `/api` and governed by the `standardApiLimiter` (120 req/min) or `aiAdvisorLimiter` (30 req/min), CORS restrictions, and CSP security headers.

---

## 1. Endpoints Specification

### POST `/api/analyze-payment` (and `/api/v1/payment/check`)
Evaluates pre-payment risk by orchestrating on-device context, entity KYC, transaction velocity, multi-hop graph topology, story correlation, and trust chain synthesis.

- **Rate Limit:** 120 req/min
- **Request Body:**
  ```json
  {
    "recipient": "abc123@upi",
    "amount": 10,
    "note": "Electricity disconnection tonight",
    "context": {
      "payment_request": true,
      "urgency": true,
      "payment_pressure": true,
      "authority_claim": true,
      "signalStrength": "STRONG",
      "heuristicScore": 1.75,
      "threat_indicators": ["Power Disconnection Threat"],
      "latency_ms": 3,
      "offline_ready": true
    }
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "id": "chk-1740000000000",
    "recipient": "abc123@upi",
    "amount": 10,
    "riskLevel": "HIGH RISK",
    "stopDecision": true,
    "headline": "The payment looks normal. The network behind it doesn't.",
    "stopReason": "The available payment context is inconsistent with recipient and network evidence. Do not proceed.",
    "connectedEntities": 7,
    "elevatedRiskConnections": 3,
    "riskTags": ["Mule Account Flagged", "Story-Trail Inconsistency"],
    "storyCorrelation": { ... },
    "trustChain": [ ... ],
    "aiExplanation": "..."
  }
  ```

---

### GET `/api/network-graph`
Retrieves the dynamic multi-hop graph topology for a given VPA.

- **Query Parameters:** `vpa` (string), `risk` (`SAFE` | `MODERATE` | `HIGH RISK`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "vpa": "abc123@upi",
    "nodes": [ ... ],
    "links": [ ... ],
    "totalConnectedEntities": 7,
    "elevatedRiskConnections": 3,
    "clusterType": "Mule Ring Fan-Out (Layer-1 to P2P Crypto)"
  }
  ```

---

### POST `/api/analyze-message`
Scans raw text/SMS for phishing URLs, malware APKs, and coercion indicators.

- **Rate Limit:** 30 req/min
- **Request Body:** `{ "text": "Your electricity power will be cut tonight..." }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "isHighRisk": true,
    "riskLevel": "HIGH RISK",
    "signals": ["Fake Electricity Disconnection Scam"],
    "recommendation": "STOP: Do not click any links...",
    "aiExplanation": "..."
  }
  ```

---

### POST `/api/ask-qnetra`
Interactive cybersecurity assistant answering fraud-prevention queries.

- **Rate Limit:** 30 req/min
- **Request Body:** `{ "question": "Why is scanning a QR to receive money dangerous?" }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "answer": "Golden Security Rule: You NEVER need to scan a QR code or enter your UPI PIN to receive money..."
  }
  ```

---

### POST `/api/office-kit/investigate`
Generates a forensic investigation dossier for law enforcement handover.

- **Request Body:** `{ "vpa": "abc123@upi" }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "dossier": {
      "targetVpa": "abc123@upi",
      "identifiedSyndicate": "Mule Ring Alpha (Layer-1 Dispersal Node)",
      "totalRiskHops": 3,
      "flaggedMuleNodes": ["mule_781@axis", "quick_pay88@sbi"],
      "cryptoOffRamp": "P2P_Exch_Wallet#9 (USDT Escrow)",
      "recommendedAction": "HALT: Dial 1930 / Issue immediate LEA account freeze request..."
    }
  }
  ```

---

### GET `/api/health`
Status and environmental diagnostics.

- **Response (200 OK):** `{ "status": "ok", "app": "Q-NETRA AI", "version": "3.5.0-rel" }`
