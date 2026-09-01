"""
Q-NETRA AI Research Suite - Adversarial Benchmark & Counterfactual Generator
Generates:
1. Hardened Adversarial Synthetic Ablation Corpus (with genuine overlap, hijacked accounts, clean-network scams)
2. Counterfactual Pair Suite (Story Counterfactuals, Network Counterfactuals, Identity Counterfactuals)
"""

import os
import random
import numpy as np
import pandas as pd

RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

RESEARCH_DIR = os.path.join(os.path.dirname(__file__), '..')
EXTERNAL_DIR = os.path.join(RESEARCH_DIR, 'datasets', 'external')
SYNTHETIC_DIR = os.path.join(RESEARCH_DIR, 'datasets', 'synthetic')

os.makedirs(EXTERNAL_DIR, exist_ok=True)
os.makedirs(SYNTHETIC_DIR, exist_ok=True)

def generate_hardened_adversarial_synthetic(n_samples=5000):
    """
    Hardened adversarial synthetic benchmark specifically engineered to prevent trivial 100% separation:
    - 20% of frauds use hijacked / aged accounts (age > 1000 days, KYC verified)
    - 18% of frauds have clean / single-hop networks (scammer hasn't moved funds yet)
    - 15% of frauds are polite / subtle scams (no urgency, no threat keywords)
    - 18% of legitimate transactions are urgent (medical emergency, overdue bills)
    - 14% of legitimate transactions involve multi-hop intermediary aggregators
    - 10% of legitimate transactions have ambiguous informal payment notes
    """
    print(f"[*] Generating Hardened Adversarial Synthetic Benchmark ({n_samples} rows)...")

    rows = []
    for i in range(n_samples):
        # 30% Fraud, 70% Benign
        is_fraud = 1 if random.random() < 0.30 else 0
        
        if is_fraud:
            # Fraud Archetypes:
            # 1. Standard Mule Coercion (35%)
            # 2. Hijacked / Aged Compromised Account (25%) -> Fails Identity check
            # 3. Clean-Network / Fresh Scammer (20%) -> Fails Network check
            # 4. Polite / Subtle Phishing (20%) -> Fails Context check
            fraud_type = np.random.choice(
                ['standard_mule', 'compromised_aged', 'clean_network', 'polite_scam'],
                p=[0.35, 0.25, 0.20, 0.20]
            )
            
            if fraud_type == 'standard_mule':
                amount = round(random.choice([10.0, 50.0, 500.0, 4500.0, 25000.0]), 2)
                tx_velocity_1h = random.randint(2, 8)
                origin_balance_drain_ratio = round(random.uniform(0.10, 0.85), 2)
                urgency_signal = 1 if random.random() < 0.88 else 0
                coercion_pressure_signal = 1 if random.random() < 0.85 else 0
                authority_claim_signal = 1 if random.random() < 0.82 else 0
                has_obfuscated_url = 1 if random.random() < 0.60 else 0
                recipient_age_days = random.randint(3, 30)
                kyc_verified = 0 if random.random() < 0.88 else 1
                is_masked_virtual_handle = 1 if random.random() < 0.85 else 0
                connected_entities = random.randint(5, 12)
                elevated_risk_mule_hops = random.randint(1, 4)
                cluster_risk_score = round(random.uniform(72.0, 94.0), 1)
                story_mismatch_detected = 1 if random.random() < 0.90 else 0

            elif fraud_type == 'compromised_aged': # Evades Identity Filters!
                amount = round(random.uniform(1500, 45000), 2)
                tx_velocity_1h = random.randint(1, 4)
                origin_balance_drain_ratio = round(random.uniform(0.15, 0.60), 2)
                urgency_signal = 1 if random.random() < 0.70 else 0
                coercion_pressure_signal = 1 if random.random() < 0.65 else 0
                authority_claim_signal = 1 if random.random() < 0.60 else 0
                has_obfuscated_url = 1 if random.random() < 0.40 else 0
                # Identity looks legitimate!
                recipient_age_days = random.randint(700, 2500)
                kyc_verified = 1
                is_masked_virtual_handle = 0
                # But network & story have subtle anomalies
                connected_entities = random.randint(3, 7)
                elevated_risk_mule_hops = 1 if random.random() < 0.65 else 0
                cluster_risk_score = round(random.uniform(45.0, 75.0), 1)
                story_mismatch_detected = 1 if random.random() < 0.75 else 0

            elif fraud_type == 'clean_network': # Evades Graph Filters!
                amount = round(random.choice([10.0, 25.0, 100.0, 1500.0]), 2)
                tx_velocity_1h = 1
                origin_balance_drain_ratio = round(random.uniform(0.01, 0.20), 2)
                urgency_signal = 1 if random.random() < 0.92 else 0
                coercion_pressure_signal = 1 if random.random() < 0.88 else 0
                authority_claim_signal = 1 if random.random() < 0.85 else 0
                has_obfuscated_url = 1 if random.random() < 0.50 else 0
                recipient_age_days = random.randint(1, 15)
                kyc_verified = 0
                is_masked_virtual_handle = 1
                # Network looks sparse/clean because account is brand new!
                connected_entities = 1
                elevated_risk_mule_hops = 0
                cluster_risk_score = round(random.uniform(10.0, 35.0), 1)
                story_mismatch_detected = 1 if random.random() < 0.85 else 0

            else: # polite_scam (Evades Context Filters!)
                amount = round(float(np.random.exponential(scale=4000)) + 200, 2)
                tx_velocity_1h = random.randint(1, 3)
                origin_balance_drain_ratio = round(random.uniform(0.05, 0.35), 2)
                # Zero overt pressure keywords!
                urgency_signal = 0
                coercion_pressure_signal = 0
                authority_claim_signal = 1 if random.random() < 0.30 else 0
                has_obfuscated_url = 1 if random.random() < 0.35 else 0
                recipient_age_days = random.randint(10, 90)
                kyc_verified = 0 if random.random() < 0.75 else 1
                is_masked_virtual_handle = 1 if random.random() < 0.70 else 0
                connected_entities = random.randint(4, 9)
                elevated_risk_mule_hops = random.randint(1, 3)
                cluster_risk_score = round(random.uniform(65.0, 88.0), 1)
                story_mismatch_detected = 1 if random.random() < 0.70 else 0

        else:
            # Benign Archetypes:
            # 1. Standard Clean Retail / P2P (55%)
            # 2. Urgent Legitimate Medical / Bill (20%) -> Fails Context Filters
            # 3. Multi-Hop Intermediary / Marketplace (15%) -> Complex Network
            # 4. Informal Note / Ambiguous Story (10%) -> Story Noise
            benign_type = np.random.choice(
                ['clean_retail', 'urgent_medical', 'multi_hop_escrow', 'ambiguous_note'],
                p=[0.55, 0.20, 0.15, 0.10]
            )
            
            if benign_type == 'clean_retail':
                amount = round(float(np.random.exponential(scale=1500)) + 15, 2)
                tx_velocity_1h = random.randint(1, 2)
                origin_balance_drain_ratio = round(random.uniform(0.01, 0.20), 2)
                urgency_signal = 0
                coercion_pressure_signal = 0
                authority_claim_signal = 0
                has_obfuscated_url = 0
                recipient_age_days = random.randint(200, 2400)
                kyc_verified = 1
                is_masked_virtual_handle = 0
                connected_entities = random.randint(1, 2)
                elevated_risk_mule_hops = 0
                cluster_risk_score = round(random.uniform(2.0, 15.0), 1)
                story_mismatch_detected = 0

            elif benign_type == 'urgent_medical': # Urgent legitimate transfers
                amount = round(random.uniform(5000, 85000), 2)
                tx_velocity_1h = random.randint(2, 5)
                origin_balance_drain_ratio = round(random.uniform(0.25, 0.65), 2)
                # High urgency and authority keywords, but organic!
                urgency_signal = 1 if random.random() < 0.88 else 0
                coercion_pressure_signal = 1 if random.random() < 0.25 else 0
                authority_claim_signal = 1 if random.random() < 0.35 else 0
                has_obfuscated_url = 0
                recipient_age_days = random.randint(45, 300) # Emergency clinic
                kyc_verified = 1 if random.random() < 0.85 else 0
                is_masked_virtual_handle = 0
                connected_entities = random.randint(2, 4)
                elevated_risk_mule_hops = 0
                cluster_risk_score = round(random.uniform(10.0, 32.0), 1)
                story_mismatch_detected = 1 if random.random() < 0.20 else 0

            elif benign_type == 'multi_hop_escrow': # Complex legitimate network routing
                amount = round(random.uniform(2500, 35000), 2)
                tx_velocity_1h = random.randint(2, 4)
                origin_balance_drain_ratio = round(random.uniform(0.10, 0.40), 2)
                urgency_signal = 0
                coercion_pressure_signal = 0
                authority_claim_signal = 0
                has_obfuscated_url = 0
                recipient_age_days = random.randint(180, 1200)
                kyc_verified = 1
                is_masked_virtual_handle = 0
                # Has multiple hops through payment gateways/aggregators!
                connected_entities = random.randint(5, 9)
                elevated_risk_mule_hops = 0
                cluster_risk_score = round(random.uniform(20.0, 48.0), 1)
                story_mismatch_detected = 0

            else: # ambiguous_note
                amount = round(random.uniform(200, 5000), 2)
                tx_velocity_1h = random.randint(1, 2)
                origin_balance_drain_ratio = round(random.uniform(0.02, 0.25), 2)
                urgency_signal = 0
                coercion_pressure_signal = 0
                authority_claim_signal = 0
                has_obfuscated_url = 0
                recipient_age_days = random.randint(30, 450)
                kyc_verified = 1 if random.random() < 0.85 else 0
                is_masked_virtual_handle = 1 if random.random() < 0.20 else 0
                connected_entities = random.randint(2, 3)
                elevated_risk_mule_hops = 0
                cluster_risk_score = round(random.uniform(12.0, 38.0), 1)
                # Informal ambiguous note triggers occasional mismatch
                story_mismatch_detected = 1 if random.random() < 0.30 else 0

        rows.append({
            'case_id': f"SYN-ADV-{i+1:05d}",
            'amount': amount,
            'tx_velocity_1h': tx_velocity_1h,
            'origin_balance_drain_ratio': origin_balance_drain_ratio,
            'urgency_signal': urgency_signal,
            'coercion_pressure_signal': coercion_pressure_signal,
            'authority_claim_signal': authority_claim_signal,
            'has_obfuscated_url': has_obfuscated_url,
            'recipient_age_days': recipient_age_days,
            'kyc_verified': kyc_verified,
            'is_masked_virtual_handle': is_masked_virtual_handle,
            'connected_entities': connected_entities,
            'elevated_risk_mule_hops': elevated_risk_mule_hops,
            'cluster_risk_score': cluster_risk_score,
            'story_mismatch_detected': story_mismatch_detected,
            'is_fraud': is_fraud
        })

    df = pd.DataFrame(rows)
    out_path = os.path.join(SYNTHETIC_DIR, 'controlled_ablation_corpus.csv')
    df.to_csv(out_path, index=False)
    print(f"[+] Saved Hardened Adversarial Benchmark to {out_path} ({len(df)} rows, {df['is_fraud'].sum()} fraud, {df['is_fraud'].mean():.2%})")
    return df

def generate_counterfactual_pair_suite():
    """
    Generates controlled Counterfactual Pairs specifically designed to test whether each pillar
    independently shifts the model's decision:
    1. Story Counterfactuals: Fixed Transaction + Fixed Recipient + Fixed Network (ONLY Story changes)
    2. Network Counterfactuals: Fixed Story + Fixed Recipient (ONLY Network changes)
    3. Identity Counterfactuals: Fixed Story + Fixed Network (ONLY Identity changes)
    """
    print("[*] Generating Counterfactual Pair Suite...")
    
    pairs = [
        # --- PAIR TYPE 1: STORY COUNTERFACTUALS (Fixed Tx, Fixed Identity, Fixed Network) ---
        {
            'pair_id': 'CF-STORY-01',
            'pair_type': 'Story Counterfactual',
            'base_case': '₹10 to abc123@upi (Mule Node). Claimed Story: "State Electricity Disconnection Cut Tonight"',
            'counterfactual_case': '₹10 to abc123@upi (Mule Node). Claimed Story: "Payment to independent freelance electrician for repair"',
            'story_mismatch_base': 1,
            'story_mismatch_cf': 0,
            'expected_base_decision': 'STOP (Critical Mismatch)',
            'expected_cf_decision': 'VERIFY / MODERATE (Mule handle unverified, but purpose matches service)'
        },
        {
            'pair_id': 'CF-STORY-02',
            'pair_type': 'Story Counterfactual',
            'base_case': '₹25,000 to priya.consulting@okhdfcbank. Claimed Story: "Tax on KBC Lottery Prize 25 Lakhs"',
            'counterfactual_case': '₹25,000 to priya.consulting@okhdfcbank. Claimed Story: "Monthly independent UX consulting retainer"',
            'story_mismatch_base': 1,
            'story_mismatch_cf': 0,
            'expected_base_decision': 'STOP (Lottery claim to personal consulting VPA)',
            'expected_cf_decision': 'PROCEED / VERIFY (Claimed consulting aligns with recipient identity)'
        },
        
        # --- PAIR TYPE 2: NETWORK COUNTERFACTUALS (Fixed Story, Fixed Recipient) ---
        {
            'pair_id': 'CF-NET-01',
            'pair_type': 'Network Counterfactual',
            'base_case': '₹4,500 consulting payment to unverified VPA. Network: Direct route to HDFC Bank (0 mule links)',
            'counterfactual_case': '₹4,500 consulting payment to unverified VPA. Network: 3 hops tracing to P2P Crypto Exchange off-ramp (8 mule links)',
            'elevated_mule_hops_base': 0,
            'elevated_mule_hops_cf': 3,
            'expected_base_decision': 'VERIFY (Clean network, shallow KYC history)',
            'expected_cf_decision': 'STOP (Rapid fan-out mule cluster detected)'
        },
        {
            'pair_id': 'CF-NET-02',
            'pair_type': 'Network Counterfactual',
            'base_case': '₹10 utility bill note to electricity.bills@sbi. Network: Direct commercial clearing to SBI (Zero mule hops)',
            'counterfactual_case': '₹10 utility bill note to electricity.bills@sbi. Network: 2 hops to flagged mule accounts (Layer-1 dispersal)',
            'elevated_mule_hops_base': 0,
            'elevated_mule_hops_cf': 2,
            'expected_base_decision': 'PROCEED (Legitimate institutional utility clearing)',
            'expected_cf_decision': 'STOP (Compromised / spoofed account routing to mule cluster)'
        },

        # --- PAIR TYPE 3: IDENTITY COUNTERFACTUALS (Fixed Story, Fixed Network) ---
        {
            'pair_id': 'CF-ID-01',
            'pair_type': 'Identity Counterfactual',
            'base_case': '₹850 retail food order. Recipient: Bundl Technologies Pvt Ltd (Swiggy) — Verified Enterprise KYC (6+ years active)',
            'counterfactual_case': '₹850 retail food order. Recipient: swiggy.refund@paytm — Unverified Personal Handle (2 days active, non-KYC)',
            'kyc_status_base': 'Verified Enterprise KYC',
            'kyc_status_cf': 'Unverified Virtual Handle',
            'expected_base_decision': 'PROCEED (Verified Enterprise KYC clears retail context)',
            'expected_cf_decision': 'STOP (Impersonation of Swiggy via fresh unverified personal handle)'
        },
        {
            'pair_id': 'CF-ID-02',
            'pair_type': 'Identity Counterfactual',
            'base_case': '₹15,000 emergency medical fee. Recipient: Apollo Hospitals Enterprise Corporate Account',
            'counterfactual_case': '₹15,000 emergency medical fee. Recipient: Masked Virtual Handle active 24 hours',
            'kyc_status_base': 'Verified Healthcare Corporate KYC',
            'kyc_status_cf': 'Masked Non-KYC VPA',
            'expected_base_decision': 'PROCEED (Healthcare enterprise clearing)',
            'expected_cf_decision': 'STOP (Hospital impersonation targeting urgent medical transfer)'
        }
    ]
    
    df = pd.DataFrame(pairs)
    out_path = os.path.join(SYNTHETIC_DIR, 'counterfactual_pairs.csv')
    df.to_csv(out_path, index=False)
    print(f"[+] Saved Counterfactual Pair Suite to {out_path} ({len(df)} pairs)")
    return df

if __name__ == '__main__':
    generate_hardened_adversarial_synthetic(5000)
    generate_counterfactual_pair_suite()
    print("[OK] Hardened benchmark and counterfactual suite generated.")
