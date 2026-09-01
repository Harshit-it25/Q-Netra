# Data Card: Indian Financial Scam SMS & Coercion Benchmark

## Summary
- **Dataset Name:** Indian Financial Phishing, Social Engineering & Scam SMS Corpus
- **Sources:** Aggregated from Indian Cyber Crime Coordination Centre (I4C) public advisories, NCRP 1930 scam archetypes, and open SMS spam/scam research corpora.
- **License:** CC BY-SA 4.0 (Research & Evaluation Use)
- **Domain:** Mobile SMS & Messaging Psychological Coercion in Indian English and Hinglish

## Schema & Features
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique message identifier |
| `text` | String | Raw text body of the message (containing urgent calls-to-action, URLs, amounts, handles) |
| `sender_header` | String | Telemarketer / sender header (e.g., `VM-POWER`, `VK-SBIINB`, `AX-SWIGGY`, `DM-HDFCBK`) |
| `threat_category` | String | `utility_disconnection`, `bank_kyc`, `lottery_kbc`, `apk_screen_share`, `courier_customs`, `organic_p2p`, `merchant_promo` |
| `has_url` | Integer (0/1) | Whether text contains embedded URL or shortlink |
| `has_apk_reference` | Integer (0/1) | Whether text prompts downloading an `.apk` or screen-share tool |
| `is_scam` | Integer (0/1) | **Target variable**: Ground-truth scam label (1 = Scam / Phishing attack) |

## Class Distribution
- **Total Samples:** 1,200 labeled messages.
- **Scam Ratio:** 35% (420 scams), 65% (780 benign transactional/personal messages).
- **Languages:** Indian English (70%), Hinglish / Romanized Hindi (30%).

## Known Biases & Limitations
1. **Curated Threat Archetypes:** Contains high concentration of known 2024–2026 scam vectors (electricity cut, KYC suspension, lottery, fake refund).
2. **Text-Only:** Evaluates lexical/contextual NLP engine only; does not contain bank ledger data.
