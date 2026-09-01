# MobileBERT Dataset Forensic Audit Report

**Audit Date:** 2026-09-01  
**Auditor:** Principal Security & ML Forensics Lead  
**Corpus Evaluated:** `research/datasets/external/multilabel_scam_corpus.csv`  
**Test Partition Standard:** Fixed Held-Out Split ($N=103$ samples, Zero String Duplication)  

---

## 1. Dataset Provenance & Split Architecture

| Partition | Sample Count ($N$) | Percentage | Purpose | Data Source |
| :--- | :---: | :---: | :--- | :--- |
| **Training Split (`multilabel_train.csv`)** | **476** | 69.9% | Supervised MobileBERT Bottleneck Model Training | Public Financial SMS, Scam SMS, UPI Corpus |
| **Validation Split (`multilabel_val.csv`)** | **102** | 15.0% | Early stopping & checkpoint selection | Stratified Hold-Out Split |
| **Test Split (`multilabel_test.csv`)** | **103** | 15.1% | Final unbiased multi-label evaluation | Stratified Hold-Out Split |
| **TOTAL CORPUS** | **681** | **100.0%** | Full Research Multi-Label Corpus | Verified Multi-Label Financial Text |
| **Quarantined Hard Negatives** | **15** | Isolated | Adversarial edge-case robustness suite | `research/datasets/synthetic/hard_negatives.csv` |
| **Quarantined Demo Fixtures** | **3** | Isolated | Golden Cases A, B, C UI verification | `research/datasets/demo_fixtures/demo_cases.json` |

---

## 2. Test Set Multi-Label Class Distribution ($N=103$)

Evaluates 8 binary context classes simultaneously:

| Context Class Label | Positive Instances | Negative Instances | Positive Ratio | Class Function |
| :--- | :---: | :---: | :---: | :--- |
| `legitimate` | 48 | 55 | 46.6% | Verified benign utility/merchant invoices & peer messages |
| `payment_request` | 88 | 15 | 85.4% | Direct call-to-pay or transfer request |
| `urgency` | 33 | 70 | 32.0% | Artificial time constraints (e.g. "within 10 mins", "tonight") |
| `payment_pressure` | 31 | 72 | 30.1% | Threat of harm/penalty (disconnection, account freeze, fine) |
| `authority_impersonation`| 82 | 21 | 79.6% | Impersonating bank officers, police, electricity boards |
| `phishing` | 37 | 66 | 35.9% | Malicious links, screen-sharing APK payloads |
| `social_engineering` | 55 | 48 | 53.4% | Manipulative narrative framing |
| `fraud` | 55 | 48 | 53.4% | Overall malicious fraud ground truth |

---

## 3. Forensic Leakage & Overlap Audit

| Audit Dimension | Forensic Test Method | Finding | Verdict |
| :--- | :--- | :---: | :---: |
| **Exact Train-Test Overlap** | Hash-matching normalized strings between `multilabel_train.csv` and `multilabel_test.csv`. | **0 exact matches (0.0%)** | 🟢 **PASS** |
| **Exact Train-Val Overlap** | Hash-matching normalized strings between `multilabel_train.csv` and `multilabel_val.csv`. | **0 exact matches (0.0%)** | 🟢 **PASS** |
| **Exact Val-Test Overlap** | Hash-matching normalized strings between `multilabel_val.csv` and `multilabel_test.csv`. | **0 exact matches (0.0%)** | 🟢 **PASS** |
| **Demo Fixture Quarantine** | Cross-checking Golden Cases A, B, C text strings against training set. | **0 matches (Strictly isolated)** | 🟢 **PASS** |
| **Entity Handle Leakage** | Searching training text for specific test recipient VPAs (`abc123@upi`, `swiggy@icici`). | **0 entity leaks** | 🟢 **PASS** |
| **Template Lexical Similarity** | Token-level Jaccard similarity ($>0.85$) across train and test folds. | **94.2% template overlap** | ⚠️ **NOTED FORENSIC FINDING** |

### Forensic Finding: Template Lexical Similarity
Financial and utility SMS alerts naturally share boilerplate notification templates (e.g., *"Dear customer, your bill of ₹... is due on..."*). While exact text strings are strictly partitioned ($0$ duplicates), template vocabulary overlap is high ($94.2\%$).

**Mitigation & Generalization Safeguard:**
To ensure the model has learned semantic intent rather than template memorization:
1. The **15-case Hard Negative Benchmark** tests whether the model distinguishes between subtle counterfactuals (e.g., hospital emergency payments vs. extortion).
2. The **Heuristic Safety Fallback** and **3-Pillar Story Correlation** engines provide defense-in-depth even for unseen out-of-distribution language.
