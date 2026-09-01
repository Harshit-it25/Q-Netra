"""
Q-NETRA AI Research Suite - External Baselines Training
Evaluates ML baselines on Entity-Group-Isolated PaySim Transactions (N=10,000).
Models: Logistic Regression (Balanced), Random Forest, LightGBM, XGBoost.
Computes 95% Bootstrap Confidence Intervals for Precision, Recall, F1, PR-AUC.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import lightgbm as lgb
import xgboost as xgb
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    precision_recall_curve, auc, confusion_matrix
)

RESEARCH_DIR = os.path.join(os.path.dirname(__file__), '..')
PROCESSED_DIR = os.path.join(RESEARCH_DIR, 'datasets', 'processed')
MODELS_DIR = os.path.join(RESEARCH_DIR, 'models')
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

def bootstrap_confidence_interval(y_true, y_prob, n_bootstraps=1000, alpha=0.05):
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

def train_and_evaluate_baselines():
    print("[*] Loading Entity-Isolated PaySim Train and Test sets...")
    train_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'paysim_group_train.csv'))
    test_df = pd.read_csv(os.path.join(PROCESSED_DIR, 'paysim_group_test.csv'))
    
    X_train = train_df.drop(columns=['isFraud'])
    y_train = train_df['isFraud']
    X_test = test_df.drop(columns=['isFraud'])
    y_test = test_df['isFraud']
    
    models = {
        'Logistic Regression (Balanced)': LogisticRegression(class_weight='balanced', max_iter=1000, random_state=RANDOM_STATE),
        'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=12, class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1),
        'LightGBM': lgb.LGBMClassifier(n_estimators=100, learning_rate=0.05, class_weight='balanced', random_state=RANDOM_STATE, verbose=-1),
        'XGBoost': xgb.XGBClassifier(n_estimators=100, learning_rate=0.05, scale_pos_weight=10, random_state=RANDOM_STATE, eval_metric='logloss')
    }
    
    print("\n" + "="*95)
    print(f"{'Model (PaySim Entity Group Split)':<32} | {'Precision':<8} | {'Recall':<8} | {'F1 [95% CI]':<20} | {'PR-AUC [95% CI]':<20} | {'FPR':<6}")
    print("="*95)
    
    results = {}
    for name, clf in models.items():
        clf.fit(X_train, y_train)
        y_prob = clf.predict_proba(X_test)[:, 1]
        y_pred = (y_prob >= 0.5).astype(int)
        
        m = compute_metrics(y_test, y_pred, y_prob)
        f1_ci, pr_ci = bootstrap_confidence_interval(y_test, y_prob)
        
        f1_str = f"{m['f1']:.3f} [{f1_ci[0]:.2f}, {f1_ci[1]:.2f}]"
        pr_str = f"{m['pr_auc']:.3f} [{pr_ci[0]:.2f}, {pr_ci[1]:.2f}]"
        
        print(f"{name:<32} | {m['precision']:<8.4f} | {m['recall']:<8.4f} | {f1_str:<20} | {pr_str:<20} | {m['fpr']:<6.4f}")
        
        results[name] = {**m, 'f1_ci': f1_ci, 'pr_ci': pr_ci}
        
        clean_name = name.lower().replace(' ', '_').replace('(', '').replace(')', '')
        joblib.dump(clf, os.path.join(MODELS_DIR, f"baseline_{clean_name}.joblib"))
        
    return results

if __name__ == '__main__':
    train_and_evaluate_baselines()
