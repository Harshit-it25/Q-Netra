# Data Card: Q-NETRA Multi-Modal Ablation Benchmark

## Summary
- **Dataset Name:** Q-NETRA Multi-Modal Fraud & Coercion Ablation Benchmark
- **Classification:** Controlled Evaluation Scenarios (Explicitly Labeled Synthetic Research Benchmark)
- **Domain:** Unified Pre-Payment Evaluation across 4 Defense Pillars:
  1. Transaction Features (Amount, Velocity, Balance Ratios)
  2. Context Features (Urgency, Psychological Coercion, Impersonation)
  3. Identity Features (Handle Age, KYC Verification, Category Mismatch)
  4. Network Features (Mule Node Proximity, Fan-out Hops, Cluster Risk)
- **Target Variable:** `is_fraud` (Binary 0/1)

## Purpose in Ablation Study
Used strictly to conduct controlled ablation experiments comparing:
- **Model A:** Transaction Signals Only
- **Model B:** Context Signals Only
- **Model C:** Transaction + Context
- **Model D:** Transaction + Context + Identity
- **Model E:** Transaction + Context + Identity + Network
- **Model F (Full Q-NETRA):** Context + Identity + Network + Story-to-Trail Correlation Matrix

## Governance Disclosure
This dataset is a controlled evaluation benchmark designed specifically to test multi-layer interaction. It is NOT claimed to be a live bank feed or direct NPCI database extract.
