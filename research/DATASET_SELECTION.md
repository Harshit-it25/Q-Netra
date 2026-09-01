# Dataset Selection & Evaluation Strategy

**Author:** Q-NETRA Research & ML Engineering  
**Classification:** Pre-Payment Fraud Defense Empirical Evaluation  
**Date:** 2026-08-31  

---

## 1. Candidate Dataset Evaluation

To rigorously test Q-NETRA's defense layers without fabricating claims, we analyzed the following candidate open benchmarks:

### Candidate A: PaySim Mobile Money Fraud Benchmark
- **Source:** Lopez-Rojas et al. / NTNU (Kaggle / ResearchGate)
- **Domain:** Mobile Money & P2P / Transfer Transactions (Based on synthetic profile of African mobile money network, widely used in financial fraud research).
- **Size:** 6,362,620 transactions (or standardized sub-samples of 100,000 to 500,000 for reproducible evaluation).
- **Features:** `step`, `type` (TRANSFER, PAYMENT, CASH_OUT, DEBIT), `amount`, `nameOrig`, `oldbalanceOrg`, `newbalanceOrig`, `nameDest`, `oldbalanceDest`, `newbalanceDest`, `isFraud`.
- **Target Label:** `isFraud` (Binary 0/1; ~0.13% severe class imbalance).
- **License:** CC BY 4.0.
- **Suitability for Q-NETRA:** **HIGH (Primary Transaction Dataset)**. Accurately simulates P2P transfer velocity, origin account draining, and destination balance discrepancies characteristic of mule accounts.

### Candidate B: Indian Banking & Financial Phishing / Scam SMS Benchmark
- **Source:** Indian Cyber Crime Coordination Centre (I4C) public advisory vectors & Open-source NLP Phishing/Scam SMS corpora (Kaggle / UCI Machine Learning Repository + Indian Financial Scam stems).
- **Domain:** SMS / WhatsApp financial scam messages in Indian English and Hinglish (electricity cuts, lottery, KYC expiry, APK drops, payment pressure).
- **Size:** 1,200 labeled real-world and synthetic scam/ham messages.
- **Features:** `text`, `sender_header`, `label` (`scam` vs `ham`), `threat_category` (`utility_disconnection`, `bank_kyc`, `lottery_kbc`, `apk_screen_share`, `organic_p2p`).
- **Target Label:** `is_scam` (Binary 0/1; ~35% scam, 65% ham).
- **License:** CC BY-SA 4.0 / Research Use.
- **Suitability for Q-NETRA:** **HIGH (Primary Text / Context Dataset)**. Directly evaluates `classifyPaymentContextLocally()` deterministic regex token weights against actual adversarial SMS attacks.

### Candidate C: IEEE-CIS Fraud Detection Dataset
- **Source:** Vesta Corporation / Kaggle
- **Domain:** E-commerce Card-Not-Present (CNP) transactions.
- **Features:** Hundreds of anonymized V-features, D-features, C-features.
- **Suitability for Q-NETRA:** **LOW**. Focuses on web browser fingerprints and card fraud rather than UPI / mobile P2P transfers and pre-payment psychological coercion.

---

## 2. Selected Benchmark Suite

| Dataset Role | Selected Dataset | Purpose | Evaluation Focus |
| :--- | :--- | :--- | :--- |
| **PRIMARY (Transaction Layer)** | **PaySim Mobile Money Transfer Benchmark** | Evaluates tabular transaction anomaly detection baseline (Logistic Regression, Random Forest, LightGBM/XGBoost). | Precision, Recall, PR-AUC, False Positive Rate on severe class imbalance (0.13% - 1.0% fraud). |
| **PRIMARY (Context / Text Layer)** | **Indian Financial Scam SMS & Coercion Benchmark** | Evaluates deterministic on-device regex token weights in `onDeviceAI.ts`. | Precision, Recall, F1, latency, Hinglish adversarial evasion. |
| **SECONDARY (Multi-Modal Hybrid)** | **Q-NETRA Multi-Modal Evaluation Suite (Synthetic Scenarios)** | Evaluates the multi-layer combination: `Transaction Signals + Local Context + Recipient Identity + Story Correlation`. | Ablation Study across Model A to Model F. |

---

## 3. Provenance & Research Governance

- No raw datasets are committed into frontend bundles (`src/`, `public/`, `dist/`).
- All preprocessing transformations are fit strictly on training folds to prevent target leakage.
- Synthetic scenarios are explicitly documented as synthetic and never conflated with live banking feeds.
