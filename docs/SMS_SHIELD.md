# Q-NETRA AI — Optional SMS Shield & Scam Protection Architecture

**Product Principle:**  
> *"Q-NETRA doesn't need access to your messages to protect you. But if you choose to enable SMS Shield, it can turn the message that started the scam into the first piece of evidence."*

---

## 1. Two Operational Modes

| Mode | SMS Permission | Active Capabilities |
| :--- | :--- | :--- |
| **🔒 PRIVATE MODE (Default)** | `SMS_PERMISSION_OFF` | QR scanning, manual message inspection, payment analysis, on-device AI, RiskGraph, Story Correlation, Trust Chain, Voice Q&A. **Zero SMS inbox access.** |
| **🛡️ SMS SHIELD (Optional)** | `SMS_PERMISSION_GRANTED` | User-controlled on-device inspection of permitted SMS messages for payment pressure, authority claims, and malicious links. |

---

## 2. On-Device Analysis & Link Safety Intercept

1. **100% On-Device Processing:**
   - Evaluates messages using client-side JavaScript/V8 in `<5ms`.
   - Raw message bodies are **never transmitted** to cloud LLMs or remote servers.
2. **Link Safety (Zero Auto-Navigation):**
   - Dissects URL scheme, domain, shortening patterns (e.g. `bit.ly`), and `.apk` indicators without following or downloading payloads.
   - Provides safe options: `[Do Not Open]` and `[Copy Link Only]`.

---

## 3. The SMS → Payment Correlation Bridge

When an SMS scam message (e.g. Electricity Disconnection ₹10) is inspected:
```
SMS Story: "Pay Rs 10 to prevent power disconnection tonight"
          ↓
[ Tap "Correlate with Payment Shield" ]
          ↓
Target Recipient: abc123@upi (₹10)
          ↓
Network Trail: 7 connected nodes, 3-hop mule ring
          ↓
Story ↮ Money Trail Correlation: INCONSISTENT
          ↓
🔴 Decision: STOP
```

---

## 4. Voice Q&A Integration

- **Permission-Aware:**
  - If OFF: *"I don't have permission to access your SMS. You can enable SMS Shield in Settings, or paste the message in Check a message."*
  - If ON: *"SMS Shield is active on-device. I inspected your recent messages: one high-risk electricity disconnection scam was flagged."*
- **Privacy Assurance:**
  - *"SMS Shield is optional. Without SMS permission, Q-NETRA does not access your messages."*
