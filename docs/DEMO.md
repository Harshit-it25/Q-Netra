# Q-NETRA AI — Live Demonstration Guide & Golden Scenarios

**Audience:** Hackathon Technical Judges & Security Reviewers  
**Target:** 100% Deterministic, Continuous Live Flow (No Terminal Commands, No Database Resets)  
**Core USP:** STORY → PERSON → TRAIL → DECISION (*"Does the story behind the payment match the person receiving the money and the network behind them?"*)

---

## 1. The Three Deterministic Golden Scenarios

| Scenario | Target VPA | Amount | Note | Correlation Status | Decision | Key Evidence Displayed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Case C — STOP (Hero: Electricity Disconnection Scam)** | `abc123@upi` | ₹10 | `Pay ₹10 immediately to prevent electricity disconnection tonight.` | **INCONSISTENT** | **STOP** | • **🧠 Context:** Power disconnection penalty coercion (3ms)<br>• **👤 Identity:** VPA active 4 days on non-KYC handle<br>• **🕸️ Network:** 7 connected entities, 3-hop mule ring<br>• **🔥 Correlation:** Claimed utility bill contradicts personal mule trail |
| **Case B — VERIFY (Unverified Counterparty)** | `priya.consulting@okhdfcbank` | ₹4,500 | `Consulting retainer advance` | **INTENT UNVERIFIED** | **VERIFY** | • **🧠 Context:** Clean organic intent (2ms)<br>• **👤 Identity:** Handle active 16 days, unverified commercial KYC<br>• **🕸️ Network:** Sparse 4-node P2P graph<br>• **🔥 Correlation:** Insufficient evidence to establish consistency |
| **Case A — PROCEED (Legitimate Merchant)** | `swiggy@icici` | ₹850 | `Order #8921 food delivery` | **TRAIL ALIGNED** | **PROCEED** | • **🧠 Context:** Standard retail payment intent (2ms)<br>• **👤 Identity:** Bundl Technologies (Swiggy) verified corporate KYC<br>• **🕸️ Network:** Direct scheduled commercial bank settlement (ICICI)<br>• **🔥 Correlation:** Merchant intent matches verified enterprise banking |

---

## 2. The 5-Stage Conceptual Trust Chain

Every transaction check executes and displays the strict 5-stage conceptual verification cascade:

1. **PAYMENT CONTEXT:** What are they asking me to do? (*Payment pressure detected / Standard organic request*)
2. **RECIPIENT:** Who am I paying? (*Elevated risk indicators found / Verified corporate merchant*)
3. **NETWORK:** What is behind that recipient? (*Suspicious connected entities detected / Direct primary bank route*)
4. **STORY CORRELATION:** Does the payment story match the available recipient/network evidence? (*Inconsistent / Intent Unverified / Trail Aligned*)
5. **DECISION:** What should the user do? (*STOP — Do not proceed / VERIFY / PROCEED*)

---

## 3. Continuous Judge Walkthrough (Under 3 Minutes)

1. **Open Q-NETRA AI:** Open the mobile PWA or web app on the Android device (`http://localhost:3000` or production HTTPS).
2. **Initiate Scan:** Tap the **Protected QR Scanner** on the Home screen.
3. **Trigger Case C:** Select **Case C: Electricity Scam STOP (`abc123@upi - ₹10`)** from Instant Presets or scan test QR.
4. **Observe Protected Analysis Boundary:**
   - QR decoded locally in-memory (`jsQR`).
   - Camera frame immediately discarded.
   - On-Device context AI evaluates payment pressure in ~2ms.
   - Minimal non-PII payload dispatched to Risk Engine.
5. **Hero Result: # STOP:**
   - Red hero card: *"The payment looks normal. The network behind it doesn't."*
   - **Story ↮ Money Trail Correlation Card:**
     - 🧠 **Claimed Story:** Electricity disconnection payment (prevent power cut tonight)
     - 👤 **Recipient Reality:** Unverified/high-risk recipient (`abc123@upi`)
     - 🕸️ **Network Trail:** Suspicious connected entities (7 nodes, 3-hop mule ring)
     - 🔥 **Correlation Status:** `INCONSISTENT` (*"The available payment context is inconsistent with recipient and network evidence."*)
   - Direct user action: **"Action: Do NOT proceed with this payment"**.
6. **Inspect 5-Stage Trust Chain:** Tap **"Why?"** to walk the judge through the 5 layers (Payment Context → Recipient → Network → Story Correlation → Decision: STOP).
7. **Explore Multi-Hop RiskGraph:** Tap **"View Network"** to visualize the 7-node syndicate with layer-1 rapid fan-out and P2P USDT crypto conversion.
8. **View Investigation Summary:** Tap **"Investigation Summary"** to inspect contextual case data and advisory actions.
9. **Legitimate Merchant Comparison:** Return to Home → Scan **Case A: Verified Merchant (`swiggy@icici - ₹850`)** → Observe instant green **PROCEED** with `TRAIL ALIGNED`.
10. **Instant Demo Reset:** Go to **Settings** → Tap **"Reset to 3 Golden Demo Cases"** to restore pristine state for the next judge.
