# Research Datasets Directory

This directory stores raw and processed research datasets used for empirical evaluation of Q-NETRA's defense layers.

## Directory Structure
```
research/datasets/
├── raw/                  # Immutable raw datasets (downloaded or benchmark fixtures)
├── processed/            # Preprocessed, train/val/test split artifacts
├── paysim_transactions/  # Data Card & schema for PaySim Mobile Money Benchmark
├── indian_financial_scam_sms/ # Data Card & schema for Financial Scam SMS Benchmark
└── qnetra_multimodal_ablation/ # Data Card & schema for Multimodal Ablation Suite
```

## Security & Isolation Rules
1. **Zero Frontend Ingestion:** Nothing in this directory is imported into `src/` or bundled into `dist/`.
2. **Provenance Retention:** Every dataset must maintain its `DATA_CARD.md` documenting source, license, class balance, and schema.
3. **No PII:** Datasets must contain anonymized or synthetic identifiers only.
