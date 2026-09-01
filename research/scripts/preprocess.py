"""
Q-NETRA AI Research Suite - Leak-Free Preprocessing Pipeline
Prepares clean datasets with:
1. PaySim: GroupShuffleSplit on sender entities (nameOrig) to prevent entity leakage
2. Synthetic Ablation: Stratified 80/20 train/test split with zero scaler contamination
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.preprocessing import StandardScaler

RESEARCH_DIR = os.path.join(os.path.dirname(__file__), '..')
EXTERNAL_DIR = os.path.join(RESEARCH_DIR, 'datasets', 'external')
SYNTHETIC_DIR = os.path.join(RESEARCH_DIR, 'datasets', 'synthetic')
PROCESSED_DIR = os.path.join(RESEARCH_DIR, 'datasets', 'processed')
os.makedirs(PROCESSED_DIR, exist_ok=True)

RANDOM_STATE = 42

def preprocess_paysim_group_split():
    print("[*] Preprocessing PaySim with Group-Aware Sender Entity Split...")
    raw_path = os.path.join(EXTERNAL_DIR, 'paysim_transactions.csv')
    df = pd.read_csv(raw_path)
    
    # Feature Engineering (Zero Leakage, computed row-wise)
    df['orig_balance_error'] = df['newbalanceOrig'] + df['amount'] - df['oldbalanceOrg']
    df['dest_balance_error'] = df['oldbalanceDest'] + df['amount'] - df['newbalanceDest']
    df['drain_ratio'] = np.where(df['oldbalanceOrg'] > 0, df['amount'] / (df['oldbalanceOrg'] + 1e-5), 0.0)
    df['drain_ratio'] = np.clip(df['drain_ratio'], 0, 10.0)
    
    # One-Hot Encode transaction type
    df = pd.get_dummies(df, columns=['type'], drop_first=True)
    
    # Group-Aware Split on nameOrig to guarantee sender entity isolation
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_STATE)
    train_idx, test_idx = next(gss.split(df, df['isFraud'], groups=df['nameOrig']))
    
    train_df = df.iloc[train_idx].copy()
    test_df = df.iloc[test_idx].copy()
    
    # Drop IDs and rule leakage column
    drop_cols = ['nameOrig', 'nameDest', 'isFlaggedFraud']
    train_df = train_df.drop(columns=drop_cols)
    test_df = test_df.drop(columns=drop_cols)
    
    num_cols = ['step', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest',
                'orig_balance_error', 'dest_balance_error', 'drain_ratio']
    
    # Scale continuous numerical features fit strictly on train
    scaler = StandardScaler()
    train_df[num_cols] = scaler.fit_transform(train_df[num_cols])
    test_df[num_cols] = scaler.transform(test_df[num_cols])
    
    train_df.to_csv(os.path.join(PROCESSED_DIR, 'paysim_group_train.csv'), index=False)
    test_df.to_csv(os.path.join(PROCESSED_DIR, 'paysim_group_test.csv'), index=False)
    print(f"[+] PaySim Group-Split processed: Train {len(train_df)} rows, Test {len(test_df)} rows")

def preprocess_controlled_synthetic():
    print("[*] Preprocessing Controlled Synthetic Ablation Benchmark...")
    raw_path = os.path.join(SYNTHETIC_DIR, 'controlled_ablation_corpus.csv')
    df = pd.read_csv(raw_path)
    
    X = df.drop(columns=['case_id', 'is_fraud'])
    y = df['is_fraud']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=RANDOM_STATE
    )
    
    scaler = StandardScaler()
    continuous_cols = ['amount', 'tx_velocity_1h', 'origin_balance_drain_ratio', 'recipient_age_days',
                       'connected_entities', 'elevated_risk_mule_hops', 'cluster_risk_score']
    
    X_train[continuous_cols] = scaler.fit_transform(X_train[continuous_cols])
    X_test[continuous_cols] = scaler.transform(X_test[continuous_cols])
    
    train_df = X_train.copy()
    train_df['is_fraud'] = y_train
    test_df = X_test.copy()
    test_df['is_fraud'] = y_test
    
    train_df.to_csv(os.path.join(PROCESSED_DIR, 'synthetic_ablation_train.csv'), index=False)
    test_df.to_csv(os.path.join(PROCESSED_DIR, 'synthetic_ablation_test.csv'), index=False)
    print(f"[+] Synthetic Ablation processed: Train {len(train_df)} rows, Test {len(test_df)} rows")

if __name__ == '__main__':
    preprocess_paysim_group_split()
    preprocess_controlled_synthetic()
    print("[OK] Preprocessing completed.")
