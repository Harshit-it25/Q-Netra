"""
Q-NETRA AI Research Suite - Realistic Multi-Layer Ablation Study
Evaluates Model A through Model F on the Noisy Controlled Synthetic Benchmark (N=5,000).
Produces realistic non-100% metrics with 95% Bootstrap Confidence Intervals and Threshold Sweeps.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import lightgbm as lgb
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    precision_recall_curve, auc, confusion_matrix
)

RESEARCH_DIR = os.path.join(os.path.dirname(__file__), '..')
PROCESSED_DIR = os.path.join(RESEARCH_DIR, 'datasets', 'processed')
RAW_DIR = os.path.join(RESEARCH_DIR, 'datasets', 'synthetic')
REPORTS_DIR = os.path.join(RESEARCH_DIR, 'reports')
MODELS_DIR = os.path.join(RESEARCH_DIR, 'models')
os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

RANDOM_STATE = 42

def compute_metrics(y_true, y_pred, y_prob):
    p = precision_score(y_true, y_pred, zero_division=0)
    r = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    roc = roc_auc_score(y_true, y_prob)
    
    precision_vals, recall_vals, _ = precision_recall_curve(y_true, y_prob)
    pr_auc = auc(recall_vals, precision_vals)
    
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
    
    return {
        'precision': p,
        'recall': r,
        'f1': f1,
        'roc_auc': roc,
        'pr_auc': pr_auc,
        'fpr': fpr,
        'fnr': fnr,
        'tp': int(tp),
        'fp': int(fp),
        'tn': int(tn),
        'fn': int(fn)
    }

def bootstrap_ci(y_true, y_prob, n_bootstraps=1000, alpha=0.05):
    f1s, pr_aucs = [], []
    rng = np.random.RandomState(RANDOM_STATE)
    y_true_arr = np.array(y_true)
    y_prob_arr = np.array(y_prob)
    
    for _ in range(n_bootstraps):
        indices = rng.randint(0, len(y_true_arr), len(y_true_arr))
        if len(np.unique(y_true_arr[indices])) < 2:
            continue
        y_t = y_true_arr[indices]
        y_p = y_prob_arr[indices]
        y_pred = (y_p >= 0.5).astype(int)
        
        f1s.append(f1_score(y_t, y_pred, zero_division=0))
        prec, rec, _ = precision_recall_curve(y_t, y_p)
        pr_aucs.append(auc(rec, prec))
        
    f1_ci = (np.percentile(f1s, 100 * (alpha / 2)), np.percentile(f1s, 100 * (1 - alpha / 2)))
    pr_ci = (np.percentile(pr_aucs, 100 * (alpha / 2)), np.percentile(pr_aucs, 100 * (1 - alpha / 2)))
    return f1_ci, pr_ci

def run_realistic_ablation():
    print("[*] Running Realistic Multi-Layer Ablation Study (Noise & Domain Overlap Active)...")
    train_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'synthetic_ablation_train.csv'))
    test_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'synthetic_ablation_test.csv'))
    
    y_train = train_df['is_fraud']
    y_test = test_df['is_fraud']
    
    feature_sets = {
        'Model A: Transaction Only': [
            'amount', 'tx_velocity_1h', 'origin_balance_drain_ratio'
        ],
        'Model B: Context Only': [
            'urgency_signal', 'coercion_pressure_signal', 'authority_claim_signal', 'has_obfuscated_url'
        ],
        'Model C: Transaction + Context': [
            'amount', 'tx_velocity_1h', 'origin_balance_drain_ratio',
            'urgency_signal', 'coercion_pressure_signal', 'authority_claim_signal', 'has_obfuscated_url'
        ],
        'Model D: Tx + Context + Identity': [
            'amount', 'tx_velocity_1h', 'origin_balance_drain_ratio',
            'urgency_signal', 'coercion_pressure_signal', 'authority_claim_signal', 'has_obfuscated_url',
            'recipient_age_days', 'kyc_verified', 'is_masked_virtual_handle'
        ],
        'Model E: Tx + Context + Identity + Network': [
            'amount', 'tx_velocity_1h', 'origin_balance_drain_ratio',
            'urgency_signal', 'coercion_pressure_signal', 'authority_claim_signal', 'has_obfuscated_url',
            'recipient_age_days', 'kyc_verified', 'is_masked_virtual_handle',
            'connected_entities', 'elevated_risk_mule_hops', 'cluster_risk_score'
        ],
        'Model F: FULL Q-NETRA (with Story Correlation)': [
            'amount', 'tx_velocity_1h', 'origin_balance_drain_ratio',
            'urgency_signal', 'coercion_pressure_signal', 'authority_claim_signal', 'has_obfuscated_url',
            'recipient_age_days', 'kyc_verified', 'is_masked_virtual_handle',
            'connected_entities', 'elevated_risk_mule_hops', 'cluster_risk_score',
            'story_mismatch_detected'
        ]
    }
    
    ablation_results = {}
    fitted_models = {}
    
    print("\n" + "="*95)
    print(f"{'System / Model Configuration':<42} | {'Precision':<8} | {'Recall':<8} | {'F1 [95% CI]':<18} | {'PR-AUC [95% CI]':<18} | {'FPR':<6}")
    print("="*95)
    
    for name, cols in feature_sets.items():
        X_tr = train_df[cols]
        X_te = test_df[cols]
        
        clf = lgb.LGBMClassifier(n_estimators=100, learning_rate=0.05, class_weight='balanced', random_state=RANDOM_STATE, verbose=-1)
        clf.fit(X_tr, y_train)
        
        y_prob = clf.predict_proba(X_te)[:, 1]
        y_pred = (y_prob >= 0.5).astype(int)
        
        m = compute_metrics(y_test, y_pred, y_prob)
        f1_ci, pr_ci = bootstrap_ci(y_test, y_prob)
        
        f1_str = f"{m['f1']:.3f} [{f1_ci[0]:.2f}, {f1_ci[1]:.2f}]"
        pr_str = f"{m['pr_auc']:.3f} [{pr_ci[0]:.2f}, {pr_ci[1]:.2f}]"
        
        ablation_results[name] = {**m, 'f1_ci': f1_ci, 'pr_ci': pr_ci}
        fitted_models[name] = (clf, cols, y_prob)
        
        print(f"{name:<42} | {m['precision']:<8.4f} | {m['recall']:<8.4f} | {f1_str:<18} | {pr_str:<18} | {m['fpr']:<6.4f}")
    
    print("="*95)
    
    # Threshold Analysis
    full_clf, full_cols, full_probs = fitted_models['Model F: FULL Q-NETRA (with Story Correlation)']
    thresholds = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90]
    
    print("\n--- DECISION THRESHOLD TUNING (FULL Q-NETRA) ---")
    print(f"{'Threshold':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'FPR':<10}")
    print("-"*60)
    thresh_table = []
    for t in thresholds:
        preds = (full_probs >= t).astype(int)
        cm = confusion_matrix(y_test, preds)
        tn, fp, fn, tp = cm.ravel()
        p = precision_score(y_test, preds, zero_division=0)
        r = recall_score(y_test, preds, zero_division=0)
        f = f1_score(y_test, preds, zero_division=0)
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        print(f"{t:<10.2f} | {p:<10.4f} | {r:<10.4f} | {f:<10.4f} | {fpr:<10.4f}")
        thresh_table.append({'threshold': t, 'precision': p, 'recall': r, 'f1': f, 'fpr': fpr})

    # Extract False Positives and False Negatives from test evaluation
    raw_df = pd.read_csv(os.path.join(RAW_DIR, 'controlled_ablation_corpus.csv'))
    # Align with test index
    test_indices = test_df.index
    test_raw = raw_df.iloc[test_indices].copy()
    test_raw['prob'] = full_probs
    test_raw['pred'] = (full_probs >= 0.5).astype(int)
    
    fps = test_raw[(test_raw['is_fraud'] == 0) & (test_raw['pred'] == 1)]
    fns = test_raw[(test_raw['is_fraud'] == 1) & (test_raw['pred'] == 0)]
    
    print(f"\n[+] Extracted {len(fps)} real False Positives and {len(fns)} real False Negatives from Model F test set.")
    return ablation_results, thresh_table, fps, fns

if __name__ == '__main__':
    run_realistic_ablation()
