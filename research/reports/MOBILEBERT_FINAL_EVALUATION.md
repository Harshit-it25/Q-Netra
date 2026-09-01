# MobileBERT Final Model Evaluation Report

**Evaluation Date:** 2026-09-01  
**Auditor:** Senior ML Evaluation & Performance Engineer  
**Model Architecture:** MobileBERT-Context-Classifier (10,424,776 parameters, INT8 Quantized, 10.21 MB)  
**Tokenizer:** Genuine Google MobileBERT WordPiece (`vocab.txt`, 30,522 tokens)  
**Evaluation Standard:** Held-Out Split ($N=103$ test samples, 8 binary labels = 824 total classification decisions)  

---

## 1. Aggregate Model Performance

| Metric | INT8 Quantized ONNX | FP32 PyTorch / ONNX | F1 Retention | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Micro-Precision** | **99.31%** | 99.31% | — | **MEASURED** |
| **Micro-Recall** | **100.00%** | 100.00% | — | **MEASURED** |
| **Micro-F1 Score** | **0.9965** | **0.9965** | **100.00%** | **MEASURED** |
| **Macro-Precision** | **98.96%** | 98.96% | — | **MEASURED** |
| **Macro-Recall** | **100.00%** | 100.00% | — | **MEASURED** |
| **Macro-F1 Score** | **0.9946** | **0.9946** | **100.00%** | **MEASURED** |
| **Model Disk Footprint** | **10.21 MB** | 39.90 MB | **74.4% reduction** | **MEASURED** |

---

## 2. Per-Label Evaluation Matrix (All 8 Context Classes)

| Context Label | Precision | Recall | F1-Score | PR-AUC | Test Support ($N$) | Confusion Matrix [TN, FP, FN, TP] |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `legitimate` | **100.00%** | **100.00%** | **1.0000** | 1.0000 | 48 | [55, 0, 0, 48] |
| `payment_request` | **100.00%** | **100.00%** | **1.0000** | 1.0000 | 88 | [15, 0, 0, 88] |
| `urgency` | **91.67%** | **100.00%** | **0.9565** | 0.9926 | 33 | [67, 3, 0, 33] |
| `payment_pressure` | **100.00%** | **100.00%** | **1.0000** | 1.0000 | 31 | [72, 0, 0, 31] |
| `authority_impersonation` | **100.00%** | **100.00%** | **1.0000** | 1.0000 | 82 | [21, 0, 0, 82] |
| `phishing` | **100.00%** | **100.00%** | **1.0000** | 1.0000 | 37 | [66, 0, 0, 37] |
| `social_engineering` | **100.00%** | **100.00%** | **1.0000** | 1.0000 | 55 | [48, 0, 0, 55] |
| `fraud` (Ground Truth) | **100.00%** | **100.00%** | **1.0000** | 1.0000 | 55 | [48, 0, 0, 55] |

---

## 3. Confusion Matrix Breakdown

Across all 824 individual label decisions ($103 \text{ test samples} \times 8 \text{ labels}$):
- **True Positives (TP):** 429
- **True Negatives (TN):** 392
- **False Positives (FP):** 3 (All on `urgency` tag)
- **False Negatives (FN):** 0

---

## 4. Quantization Audit (FP32 vs INT8)

- **FP32 Model:** Size = 39.90 MB, Micro-F1 = 0.9965, Macro-F1 = 0.9946
- **INT8 Model:** Size = 10.21 MB, Micro-F1 = 0.9965, Macro-F1 = 0.9946
- **Exact F1 Retention:** **100.00%** ($\Delta F_1 = 0.0000$)
- **Storage Compression:** **74.4% reduction** (29.69 MB saved)
