# Q-NETRA AI — Hostile Hackathon Judge Technical Defense

**Auditor & Lead Author:** Senior ML & Systems Security Architect  
**Purpose:** Direct, factual, unvarnished defense against 20 hostile technical questions. Zero exaggerations. Clear stated limitations.  

---

### Q1: What exact model are you using?
**Answer:** A fine-tuned **MobileBERT Bottleneck Transformer Encoder** with a multi-label classification head outputting 8 calibrated sigmoid context probabilities (`legitimate`, `payment_request`, `urgency`, `payment_pressure`, `authority_impersonation`, `phishing`, `social_engineering`, `fraud`).  
**Artifacts:** `research/models/mobilebert_context.pt`, `research/models/mobilebert_context_int8.onnx`, `public/models/mobilebert_context_int8.onnx`.  
**Reference:** [MODEL_ARCHITECTURE_AUDIT.md](file:///c:/Users/harsh/Downloads/q-netra-ai/research/reports/MODEL_ARCHITECTURE_AUDIT.md).

---

### Q2: How many parameters does the model have?
**Answer:** Exactly **10,424,776 parameters (10.42M)**.  
Earlier documentation ambiguously mentioned 25.3M (which is the parameter count of Google's full 24-layer MobileBERT). Our on-device deployment uses a 4-layer bottleneck transformer architecture engineered for sub-10ms mobile latency.  
**Reference:** `research/reports/MODEL_ARCHITECTURE_AUDIT.md` (layer-by-layer parameter audit).

---

### Q3: Where did the dataset come from?
**Answer:** Publicly available financial SMS datasets, SMS spam corpora (Kaggle/UCI SMS Spam Collection), Indian financial scam threat disclosures (1930 NCRP pattern disclosures), and multi-label financial context annotations.  
**Reference:** [MOBILEBERT_DATASET_FORENSIC_AUDIT.md](file:///c:/Users/harsh/Downloads/q-netra-ai/research/reports/MOBILEBERT_DATASET_FORENSIC_AUDIT.md).

---

### Q4: How large is the held-out test set?
**Answer:** Exactly **$N=103$ test samples** ($15.1\%$ of the 681-sample research corpus). Each sample is evaluated across 8 binary labels, yielding 824 total classification decisions. We do not inflate this number with synthetic duplicates.  
**Reference:** `research/reports/MOBILEBERT_DATASET_FORENSIC_AUDIT.md`.

---

### Q5: Is the test set independent?
**Answer:** Yes. There is **0 exact string overlap (0.0%)** between training and test sets. However, forensic analysis notes that **94.2% of samples share standard financial SMS notification templates** (e.g. *"Your electricity bill of ₹... is due"*), which is standard for banking alert formats.  
**Reference:** `research/reports/MOBILEBERT_DATASET_FORENSIC_AUDIT.md` (Section 3).

---

### Q6: How did you prevent data leakage?
**Answer:**
1. Hard partition split (`multilabel_train.csv` $N=476$, `multilabel_val.csv` $N=102$, `multilabel_test.csv` $N=103$).
2. Complete quarantine of product demo fixtures (`demo_cases.json`, Golden Cases A/B/C) and synthetic hard negatives (`hard_negatives.csv`).
3. Verification that specific recipient VPAs and test entities never appear in training text.  
**Reference:** `research/reports/MOBILEBERT_DATASET_FORENSIC_AUDIT.md`.

---

### Q7: What tokenizer do you use?
**Answer:** A genuine **Google MobileBERT WordPiece Tokenizer** using the official 30,522-token vocabulary (`vocab.txt`). It implements basic BERT normalization, punctuation isolation, and greedy longest-match subword segmenting with `##` continuation prefixes.  
**Reference:** [MOBILEBERT_TOKENIZER_AUDIT.md](file:///c:/Users/harsh/Downloads/q-netra-ai/research/reports/MOBILEBERT_TOKENIZER_AUDIT.md), [tokenizer.ts](file:///c:/Users/harsh/Downloads/q-netra-ai/src/services/localAI/tokenizer.ts).

---

### Q8: Is tokenization compatible with MobileBERT?
**Answer:** Yes, 100% compatible. Token IDs, subword splits, special tokens (`[PAD]=0`, `[UNK]=100`, `[CLS]=101`, `[SEP]=102`, `[MASK]=103`), and `attention_mask` match HuggingFace `google/mobilebert-uncased` across all reference unit tests.  
**Reference:** `tests/tokenizer_test.ts` (10/10 passed).

---

### Q9: What is the Micro-F1 score?
**Answer:** **0.9965 Micro-F1** (Precision: 99.31%, Recall: 100.00%) on the held-out test split ($N=103$).  
**Reference:** [MOBILEBERT_FINAL_EVALUATION.md](file:///c:/Users/harsh/Downloads/q-netra-ai/research/reports/MOBILEBERT_FINAL_EVALUATION.md).

---

### Q10: What is the Macro-F1 score?
**Answer:** **0.9946 Macro-F1** (Macro-Precision: 98.96%, Macro-Recall: 100.00%) across all 8 context classes.  
**Reference:** `research/reports/MOBILEBERT_FINAL_EVALUATION.md`.

---

### Q11: What are your false positives?
**Answer:** Across all 824 classification decisions, there were exactly **3 False Positives**, all occurring on the `urgency` sub-label for remote HR job scam messages asking for a *"refundable seat reservation fee"*. Ground truth `fraud` was correctly classified on all 3.  
**Reference:** [MOBILEBERT_ERROR_ANALYSIS.md](file:///c:/Users/harsh/Downloads/q-netra-ai/research/reports/MOBILEBERT_ERROR_ANALYSIS.md).

---

### Q12: What are your false negatives?
**Answer:** Exactly **0 False Negatives (0.0%)** on the held-out test set. All 55 fraud samples were successfully flagged.  
**Reference:** `research/reports/MOBILEBERT_ERROR_ANALYSIS.md`.

---

### Q13: Does Q-NETRA work offline?
**Answer:** Yes, for all core pre-payment protection features:
- On-device QR decoding (`jsQR` on HTML5 canvas)
- Local MobileBERT ONNX WebAssembly inference
- Local 3-Pillar Story Correlation & Heuristic Fallback
- Local speech synthesis (`window.speechSynthesis` / Android TTS)
**Limitation:** BHASHINI cloud STT/TTS requires an active internet connection. When offline, Q-NETRA falls back automatically to local device TTS and visible multilingual text warnings.  
**Reference:** `src/services/voice/speechSynthesisService.ts`.

---

### Q14: Is MobileBERT really running locally?
**Answer:** Yes. The 10.21 MB INT8 ONNX model (`mobilebert_context_int8.onnx`) is loaded into memory via `onnxruntime-web` WebAssembly and executes inference entirely on the client CPU. Zero text is transmitted to remote servers for classification.  
**Reference:** `src/services/localAI/mobileBertService.ts`, `src/services/localAI/modelLoader.ts`.

---

### Q15: Is Snapdragon NPU being used?
**Answer:** **NO**. In current browser and Cordova/Capacitor WebView runtimes, execution runs via `CPUExecutionProvider` (WebAssembly / SIMD). Native Qualcomm Hexagon NPU execution via QNN SDK is a **PROPOSED** future optimization pathway. We do not claim NPU execution.  
**Reference:** `CLAIMS_AUDIT.md`, `research/reports/SNAPDRAGON_REAL_DEVICE_TEST.md`.

---

### Q16: Where are BHASHINI credentials stored?
**Answer:** Stored strictly on the **server backend environment** (`BHASHINI_API_KEY`, `BHASHINI_USER_ID` in `.env` / backend server config). Zero credentials exist in the client frontend bundle, APK assets, or source maps.  
**Reference:** `server/routes/voiceRoutes.ts`, `tests/backend_and_security_test.ts`.

---

### Q17: Does the QR image leave the device?
**Answer:** **NO**. Camera frames are processed frame-by-frame in volatile GPU/CPU RAM via `jsQR` on an HTML5 `<canvas>`. Zero image bytes or video frames are transmitted over the network.  
**Reference:** `src/components/scanner/QRScanner.tsx`.

---

### Q18: Can BHASHINI change the fraud decision?
**Answer:** **NO**. BHASHINI is strictly an advisory speech translation layer (STT/TTS). The risk scoring engine (`riskScoringEngine.ts`) and safety decision (`STOP`, `VERIFY`, `PROCEED`) are computed deterministically prior to and independently of any voice synthesis.  
**Reference:** `src/services/risk/paymentSafetyEvaluator.ts`.

---

### Q19: What happens if the backend goes down?
**Answer:** Q-NETRA executes **complete client-side fail-safe protection**:
1. MobileBERT runs locally via WebAssembly.
2. If WebAssembly fails, the deterministic heuristic engine (`heuristicContextService.ts`) engages instantly.
3. Decision defaults to `VERIFY` (Caution) for unknown entities if repository lookup is unreachable.
4. Voice falls back to native device speech synthesis.  
**Reference:** `src/services/localAI/mobileBertService.ts` (lines 68–97).

---

### Q20: Which components are simulated or seeded?
**Answer:**
- **SEEDED:** The local entity knowledge base (`SEEDED_KNOWN_ENTITIES` in `server/data/demo/seededEntities.ts`) contains ~15 reference merchants and mule accounts simulating a bank registry.
- **SEEDED:** Demo fixtures (`demo_cases.json`, Golden Cases A/B/C) provide interactive presets for UI demonstrations.
- **REAL & COMPUTING:** WordPiece tokenizer, MobileBERT ONNX inference, Multi-Factor Risk Calculation, Dynamic Network Graph Synthesis, Bhashini Voice Pipeline, QR Scanner.  
**Reference:** [CLAIMS_AUDIT.md](file:///c:/Users/harsh/Downloads/q-netra-ai/CLAIMS_AUDIT.md).
