# Q-NETRA AI — Research & Empirical Evaluation Suite

This directory contains the reproducible, leak-free research pipeline evaluating Q-NETRA's multi-pillar fraud defense architecture against open benchmarks.

## Directory Structure
```
research/
├── README.md                          # Reproduction guide & environment spec
├── DATASET_SELECTION.md               # Candidate dataset evaluation & selection rationale
├── datasets/
│   ├── README.md                      # Dataset isolation guidelines
│   ├── external/                      # Independently sourced benchmarks for generalization
│   │   ├── paysim_transactions.csv    (PaySim Mobile Money Benchmark, N=10,000)
│   │   └── indian_scam_sms.csv        (Indian Financial Scam SMS Corpus, N=1,200)
│   ├── synthetic/                     # Controlled noisy scenarios for architectural testing
│   │   └── controlled_ablation_corpus.csv (Multi-Pillar Benchmark with Realistic Noise, N=5,000)
│   ├── processed/                     # Group-aware train/test splits (zero leakage)
│   ├── paysim_transactions/DATA_CARD.md
│   ├── indian_financial_scam_sms/DATA_CARD.md
│   └── qnetra_multimodal_ablation/DATA_CARD.md
├── models/                            # Trained baseline artifacts (.joblib)
├── reports/
│   ├── SYNTHETIC_LEAKAGE_AUDIT.md     # Feature correlation & label proxy audit
│   ├── DATA_SPLIT_AUDIT.md            # Group-aware entity isolation & temporal split audit
│   ├── EXTERNAL_GENERALIZATION.md     # External dataset evaluations
│   ├── ERROR_ANALYSIS.md              # 10 False Positives & 10 False Negatives root cause analysis
│   └── Q_NETRA_EFFECTIVENESS_REPORT.md# Formal empirical research paper
└── scripts/
    ├── generate_benchmarks.py         # Standardized separated benchmark generator
    ├── audit_dataset.py               # Leakage & data split auditor
    ├── preprocess.py                  # Group-aware preprocessing pipeline
    ├── train_baselines.py             # ML baseline models (LogReg, RF, LightGBM, XGBoost)
    ├── eval_external_generalization.py# External context classifier evaluation
    ├── run_ablation_study.py          # Multi-layer ablation suite with bootstrap CIs
    └── generate_reports.py            # Artifact & report synthesizer
```

## Quick Reproduction
```bash
python research/scripts/generate_benchmarks.py
python research/scripts/audit_dataset.py
python research/scripts/preprocess.py
python research/scripts/train_baselines.py
python research/scripts/eval_external_generalization.py
python research/scripts/run_ablation_study.py
python research/scripts/generate_reports.py
```
