# Data Card: PaySim Financial Mobile Money Benchmark

## Summary
- **Dataset Name:** PaySim Mobile Money Fraud Detection Benchmark
- **Original Authors:** E. A. Lopez-Rojas, A. Elmir, and S. Axelsson (NTNU)
- **Primary Source:** [Kaggle PaySim / NTNU Research](https://www.kaggle.com/datasets/ealaxi/paysim1)
- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Domain:** Mobile Money & P2P Financial Transfers

## Schema & Features
| Column | Type | Description |
| :--- | :--- | :--- |
| `step` | Integer | Maps 1 hour of simulated real time (1 to 744 steps = 30 days) |
| `type` | String | Transaction category: `PAYMENT`, `TRANSFER`, `CASH_OUT`, `DEBIT`, `CASH_IN` |
| `amount` | Float | Transaction value in currency units |
| `nameOrig` | String | Customer who started the transaction (e.g., `C123456789`) |
| `oldbalanceOrg` | Float | Initial balance of sender before transaction |
| `newbalanceOrig` | Float | New balance of sender after transaction |
| `nameDest` | String | Recipient identifier (e.g., `M123456789` for merchant, `C...` for individual) |
| `oldbalanceDest` | Float | Initial balance of recipient before transaction |
| `newbalanceDest` | Float | New balance of recipient after transaction |
| `isFraud` | Integer (0/1) | **Target variable**: Ground-truth fraud label (1 = Fraudulent transaction) |
| `isFlaggedFraud` | Integer (0/1) | Rule-based business baseline (Transfers > 200,000) |

## Class Distribution & Characteristics
- **Total Transactions:** 100,000 stratified benchmark sample (derived from full 6.36M dataset).
- **Fraud Rate:** ~0.13% - 0.8% in stratified evaluation subsets.
- **Extreme Class Imbalance:** Fraud occurs exclusively in `TRANSFER` and `CASH_OUT` transaction types.

## Known Biases & Limitations
1. **Synthetic Nature:** Generated using multi-agent simulator based on aggregated financial logs.
2. **Missing Text / Context:** Contains no payment notes, SMS messages, or psychological coercion indicators.
3. **Graph Limitations:** Recipient names are synthetic identifiers without rich multi-hop cybercrime cluster metadata.
