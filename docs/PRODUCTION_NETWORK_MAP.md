# Q-NETRA AI — Production Network Map & Traffic Audit

**Audit Date:** 2026-08-31  
**Scope:** Complete Lifecycle Network Traffic Inspection  

---

## 1. Network Traffic by Lifecycle Stage

| Lifecycle Stage | Endpoint | HTTP Method | Data Transmitted | Privacy Guarantee |
| :--- | :--- | :--- | :--- | :--- |
| **App Startup** | `/` (Static Assets) | `GET` | None (Fetches `index.html`, JS, CSS) | Static bundle only; no user data |
| **QR Code Scan** | *None (Local)* | *N/A* | **ZERO network requests** | QR decoded in-memory via `jsQR`; camera frame discarded |
| **On-Device AI** | *None (Local)* | *N/A* | **ZERO network requests** | `classifyPaymentContextLocally` runs locally in 1ms–3ms |
| **Payment Risk Check** | `/api/analyze-payment` | `POST` | `{ recipient, amount, note, context }` | No camera frames, contacts, SMS inbox, or GPS coordinates |
| **RiskGraph View** | `/api/network-graph` | `GET` | Query params: `?vpa=<target>&risk=<risk>` | Returns 4-hop syndicate topology; read-only |
| **SMS Threat Analyzer** | `/api/analyze-message` | `POST` | `{ text }` (User pasted text) | Analyzes only user-submitted snippet |
| **Forensic Dossier** | `/api/office-kit/investigate` | `POST` | `{ vpa }` | Generates structured investigative report |
| **Ask Advisor** | `/api/ask-qnetra` | `POST` | `{ question }` | Cybersecurity guidance query only |
| **Health Probe** | `/api/health` | `GET` | None | Heartbeat status check |

---

## 2. Unexplained Traffic Audit

- **Third-Party Trackers:** 0
- **Background Analytics:** 0
- **Silent Clipboard Polling:** 0
- **Camera Frame Uploads:** 0
- **Hidden Telemetry:** 0

All network activity is strictly user-initiated, transparent, and bounded by the Data Minimization boundary documented in `docs/NETWORK_PRIVACY_AUDIT.md`.
