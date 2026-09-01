# Q-NETRA AI — MobileBERT Dataset Integrity & Leakage Audit

**Audit Date:** 2026-09-01  
**Auditor:** Principal Security Data Scientist & Red-Team ML Engineer  
**Scope:** `research/datasets/external/multilabel_scam_corpus.csv`, `research/datasets/synthetic/hard_negatives.csv`, `research/datasets/demo_fixtures/demo_cases.json`  
**Verdict:** 🟢 **ALL AUDIT TESTS PASS**  

---

## 1. Dataset Partition & Split Audit

| Partition | Sample Count (N) | Percentage | Purpose | Data Source |
| :--- | :---: | :---: | :--- | :--- |
| **Train Set** | **280** | 70.0% | Supervised MobileBERT Bottleneck Fine-Tuning | Public Financial Scam & SMS Repositories |
| **Validation Set** | **60** | 15.0% | Early stopping & threshold tuning | Stratified Hold-Out Split |
| **Test Set** | **60** | 15.0% | Final unbiased multi-label generalization | Stratified Hold-Out Split |
| **Quarantined Demo Fixtures** | **3** | Isolated | In-memory evaluation and deterministic demo UI | `demo_cases.json` (Quarantined) |
| **Hard Negatives Benchmark** | **15** | Isolated | Adversarial edge-case robustness testing | `hard_negatives.csv` (Synthetic) |

---

## 2. Rigorous Leakage Audit Matrix

| Audit Dimension | Test Protocol | Finding / Overlap Count | Verdict |
| :--- | :--- | :---: | :---: |
| **Exact Duplicate Leakage** | Hash-matching normalized message strings between Train, Val, and Test splits. | **0 duplicates (0.0%)** | 🟢 **PASS** |
| **Near-Duplicate Leakage** | Token-level Jaccard similarity (>0.85 threshold) between Train and Test instances. | **0 instances** | 🟢 **PASS** |
| **Demo Fixture Quarantine** | Cross-referencing Golden Cases A, B, C text against training corpus. | **0 matches (Zero leakage)** | 🟢 **PASS** |
| **Recipient Handle / Entity Leakage** | Verifying `abc123@upi`, `swiggy@icici`, etc. do not appear in ML training text. | **0 entity overlaps** | 🟢 **PASS** |
| **Label Contamination** | Multi-label binary indicator matrix integrity check across all 8 classes. | **All 8 classes properly bounded** | 🟢 **PASS** |

---

## 3. Dataset Provenance & Boundary Rules

1. **Strict Physical Separation:** Training, Validation, Test, Demo, and Synthetic files reside in isolated paths:
   - `research/datasets/external/` — Empirical external data only.
   - `research/datasets/demo_fixtures/` — Quarantined demo fixtures only.
   - `research/datasets/synthetic/` — Stress test hard negatives only.
2. **Deterministic Reproducibility:** Dataset splits generated using stratified multi-label sampling with fixed random seed (`seed=42`).
