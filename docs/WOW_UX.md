# Q-NETRA AI — "WOW" Product UX & Judge Demonstration Architecture

**Design Philosophy:** *Restrained Financial Security Intelligence*  
**Core Product Statement:**  
> **"Before you pay, Q-NETRA checks the story, the person, and the trail behind the payment."**  
> **STORY → PERSON → TRAIL → DECISION**

---

## 1. The 4-Layer Intelligence Architecture

```
1. 🧠 CONTEXT (What are they asking me to do?)
   └── On-Device Local AI (<5ms) evaluates urgency, payment pressure, and claimed payment intent.

2. 👤 IDENTITY (Who am I paying?)
   └── Entity Intelligence checks VPA registration age, reputation, and KYC classification.

3. 🕸️ NETWORK (What is behind that recipient?)
   └── Multi-Hop RiskGraph maps connected nodes, layer-1 mule accounts, and crypto off-ramps.

4. 🔥 CORRELATION (Does the story match the money trail?)
   └── Intent-to-Trail Engine detects semantic-to-financial mismatches:
       • INCONSISTENT (Story contradicts money trail → STOP)
       • INTENT UNVERIFIED (Shallow unverified trust → VERIFY)
       • TRAIL ALIGNED (Intent matches verified corporate banking → PROCEED)
```

---

## 2. Hero Demo Experience (Continuous Trace)

### Scenario: Electricity Disconnection Scam
- **Amount & Recipient:** `₹10` → `abc123@upi`
- **Scam Note:** *"Pay ₹10 immediately to prevent electricity disconnection tonight."*

### Progressive Information Cascade:
1. **QR Scan & Protected Boundary:**
   - In-memory decoding with `jsQR` (zero frame upload).
   - Local AI intent evaluation in ~3ms.
2. **Story ↮ Money Trail Correlation:**
   - **🧠 Claimed Story:** Electricity disconnection payment (prevent power cut tonight)
   - **👤 Recipient Reality:** Unverified / Masked Virtual Handle (`abc123@upi`)
   - **🕸️ Network Trail:** Suspicious connected entities (7 nodes, 3-hop mule ring → USDT crypto off-ramp)
   - **🔥 Correlation Verdict:** `INCONSISTENT` (*"The available payment context is inconsistent with recipient and network evidence."*)
3. **Decision Domination:**
   - 🔴 **STOP** — High risk detected. *"Do not proceed with this payment."*
   - **WHY WE STOPPED:**
     - ❌ Payment pressure detected (Urgent power disconnection threat)
     - ❌ Recipient has elevated risk indicators (`abc123@upi`, non-KYC handle)
     - ❌ Available network evidence conflicts with the payment context
   - **Action Banner:** `DO NOT PROCEED`

---

## 3. The Three Distinct Decisions

| Decision State | Visual Tone | Core Message | Evidence Highlighted |
| :--- | :--- | :--- | :--- |
| 🔴 **STOP** | Alert Red (`#ffb4ab`) | *"High risk detected. Do not proceed with this payment."* | Inconsistent story-to-trail, 3-hop mule syndicate, power cut coercion |
| 🟡 **VERIFY** | Caution Amber (`amber-400`) | *"Additional verification recommended. Recipient identity could not be sufficiently verified."* | Handle active <30 days, sparse P2P transaction history |
| 🟢 **PROCEED** | Calm Green (`#abd600`) | *"No significant risk indicators detected. Q-NETRA found no significant mismatch."* | Verified enterprise KYC, direct scheduled commercial bank settlement |

---

## 4. Investigative RiskGraph & Office Kit Handoff

- **Investigative Topology:** Interactive SVG network mapping the exact flow from User → Recipient (`abc123@upi`) → Layer-1 Mules (`mule_781@axis`) → Destination (`P2P USDT Crypto Off-Ramp`).
- **Relationship Badges:** Clean data-backed annotations: *"Rapid Fan-Out (12s)"*, *"Split Transaction"*, *"Shared Device Root"*.
- **Conceptual Handoff:**
  ```text
  📱 DETECT (Phone stops payment in real-time)
         ↓
  💻 INVESTIGATE (Desktop traces syndicate topology & generates Investigation Summary)
  ```

---

## 5. Mobile-First & Technical Integrity

- **Strict Mobile Optimization:** Full layout responsiveness across 360px – 420px viewports with zero horizontal scrolling.
- **Accessible Touch Targets:** Minimum 48px interactive touch zones.
- **Truth in Reporting:** Seeded demonstration topologies are clearly labeled with `[DEMO INVESTIGATION DATA]`.
