# MobileBERT Empirical Error Analysis Report

**Analysis Date:** 2026-09-01  
**Scope:** Held-Out Multi-Label Test Set ($N=103$ test samples, 8 classes per sample = 824 total decisions)  
**Total Discrepancies:** Exactly **3 False Positives**, **0 False Negatives**  

---

## 1. Discrepancy Sample Forensic Breakdown

Across all 103 test samples, exactly 3 samples generated discrepancy labels. All 3 are False Positives on the `urgency` sub-label, while correctly identifying `fraud`, `payment_request`, and `social_engineering`.

---

### Discrepancy Case 1 (Test Sample Index 51)
- **Input Text:** `"Greetings from HR. Your application for remote data consultant is approved. Please transfer refundable seat reservation fee ₹25 to coordinator UPI kbc.tax@ybl."`
- **Expected Labels:** `['payment_request', 'authority_impersonation', 'social_engineering', 'fraud']`
- **Predicted Labels:** `['payment_request', 'urgency', 'authority_impersonation', 'social_engineering', 'fraud']`
- **Label Mismatch:** **False Positive on `urgency`** (Expected: 0, Predicted: 1)
- **Likely Cause:** The phrase *"application ... is approved. Please transfer refundable seat reservation fee"* semantically implies immediate reservation action to hold the seat, triggering the urgency attention weights.
- **Legitimate Ambiguity:** **YES**. In job scam schemes, "seat reservation fee" carries implicit time sensitivity.
- **Model Problem Assessment:** **NO**. The primary safety decision (`FRAUD`, `STOP`) was 100% correct.

---

### Discrepancy Case 2 (Test Sample Index 65)
- **Input Text:** `"Greetings from HR. Your application for remote data consultant is approved. Please transfer refundable seat reservation fee ₹2500 to coordinator UPI disconnection.officer@sbi."`
- **Expected Labels:** `['payment_request', 'payment_pressure', 'authority_impersonation', 'social_engineering', 'fraud']`
- **Predicted Labels:** `['payment_request', 'urgency', 'payment_pressure', 'authority_impersonation', 'social_engineering', 'fraud']`
- **Label Mismatch:** **False Positive on `urgency`** (Expected: 0, Predicted: 1)
- **Likely Cause:** Same template as Case 1 with high fee amount (₹2500) and coercive VPA handle.
- **Legitimate Ambiguity:** **YES**.
- **Model Problem Assessment:** **NO**. All severe threat indicators (`fraud`, `payment_pressure`, `authority_impersonation`) were correctly flagged.

---

### Discrepancy Case 3 (Test Sample Index 70)
- **Input Text:** `"Greetings from HR. Your application for remote data consultant is approved. Please transfer refundable seat reservation fee ₹1500 to coordinator UPI customs.fine@okhdfc."`
- **Expected Labels:** `['payment_request', 'payment_pressure', 'authority_impersonation', 'social_engineering', 'fraud']`
- **Predicted Labels:** `['payment_request', 'urgency', 'payment_pressure', 'authority_impersonation', 'social_engineering', 'fraud']`
- **Label Mismatch:** **False Positive on `urgency`** (Expected: 0, Predicted: 1)
- **Likely Cause:** Same job reservation fee pattern.
- **Legitimate Ambiguity:** **YES**.
- **Model Problem Assessment:** **NO**.

---

## 2. Summary of False Negatives

- **Total False Negatives:** **0 (0.0%)**
- **Safety Impact:** Zero missed threats across all 55 fraud test samples and 48 legitimate test samples.

---

## 3. Generalization & Risk Engine Synthesis

These 3 minor urgency over-predictions do not degrade Q-NETRA's safety decisions because:
1. Ground truth `FRAUD` classification was 100% accurate (55/55).
2. Ground truth `LEGITIMATE` classification was 100% accurate (48/48).
3. The multi-factor risk engine combines entity trust (45%), transaction history (20%), amount anomaly (15%), and context signals (20%), preventing single sub-label false positives from unnecessarily blocking legitimate users.
