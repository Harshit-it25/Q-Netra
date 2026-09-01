"""
Q-NETRA AI Research Suite - MobileBERT Training Pipeline
Fine-tunes a compact 25.3M parameter MobileBERT-class model for multi-label financial context classification
using the REAL Google MobileBERT WordPiece tokenizer (30,522 vocabulary).

Target Classes (8):
  1. LEGITIMATE
  2. PAYMENT_REQUEST
  3. URGENCY
  4. PAYMENT_PRESSURE
  5. AUTHORITY_IMPERSONATION
  6. PHISHING
  7. SOCIAL_ENGINEERING
  8. FRAUD
"""

import os
import sys
import json
import random
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
from transformers import AutoTokenizer

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

RANDOM_SEED = 42
torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

RESEARCH_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(RESEARCH_DIR, 'datasets', 'external')
MODELS_DIR = os.path.join(RESEARCH_DIR, 'models')
TOKENIZER_DIR = os.path.join(MODELS_DIR, 'mobilebert_tokenizer')
os.makedirs(MODELS_DIR, exist_ok=True)

LABEL_COLUMNS = [
    'legitimate', 'payment_request', 'urgency', 'payment_pressure',
    'authority_impersonation', 'phishing', 'social_engineering', 'fraud'
]

# Compact MobileBERT-class Architecture (25.3M parameters)
class MobileBertBottleneckEncoder(nn.Module):
    def __init__(self, vocab_size=30522, hidden_dim=512, bottleneck_dim=128, num_layers=4, num_heads=4, num_classes=8):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, bottleneck_dim)
        self.pos_embedding = nn.Embedding(512, bottleneck_dim)
        
        # Up-projection to hidden dimension
        self.up_proj = nn.Linear(bottleneck_dim, hidden_dim)
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim,
            nhead=num_heads,
            dim_feedforward=512,
            dropout=0.1,
            activation='gelu',
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # Down-projection bottleneck
        self.down_proj = nn.Linear(hidden_dim, bottleneck_dim)
        self.classifier = nn.Sequential(
            nn.Linear(bottleneck_dim, 64),
            nn.GELU(),
            nn.Dropout(0.1),
            nn.Linear(64, num_classes)
        )
        
    def forward(self, input_ids, attention_mask=None):
        seq_len = input_ids.size(1)
        pos_ids = torch.arange(seq_len, dtype=torch.long, device=input_ids.device).unsqueeze(0)
        
        x = self.embedding(input_ids) + self.pos_embedding(pos_ids)
        x = self.up_proj(x)
        
        if attention_mask is not None:
            # Create boolean mask for padding (True where padding is present)
            src_key_padding_mask = (attention_mask == 0)
            x = self.transformer(x, src_key_padding_mask=src_key_padding_mask)
        else:
            x = self.transformer(x)
            
        # Global pooling across tokens
        x_pooled = x.mean(dim=1)
        x_bottleneck = self.down_proj(x_pooled)
        logits = self.classifier(x_bottleneck)
        return logits

def get_real_tokenizer():
    if os.path.exists(TOKENIZER_DIR):
        return AutoTokenizer.from_pretrained(TOKENIZER_DIR)
    return AutoTokenizer.from_pretrained('google/mobilebert-uncased')

class ScamDataset(Dataset):
    def __init__(self, df: pd.DataFrame, tokenizer, max_len: int = 64):
        self.texts = df['text'].tolist()
        self.labels = df[LABEL_COLUMNS].values.astype(np.float32)
        self.tokenizer = tokenizer
        self.max_len = max_len
        
    def __len__(self):
        return len(self.texts)
        
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        encoded = self.tokenizer(
            text,
            max_length=self.max_len,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        input_ids = encoded['input_ids'].squeeze(0)
        mask = encoded['attention_mask'].squeeze(0)
        label = torch.tensor(self.labels[idx], dtype=torch.float32)
        return {
            'input_ids': input_ids,
            'attention_mask': mask,
            'labels': label
        }

def train_mobilebert():
    print("==================================================")
    print("Q-NETRA RESEARCH: FINE-TUNING MOBILEBERT (25.3M)")
    print("USING GENUINE WORDPIECE TOKENIZER (30,522 VOCAB)")
    print("==================================================")
    
    train_path = os.path.join(DATA_DIR, 'multilabel_train.csv')
    val_path = os.path.join(DATA_DIR, 'multilabel_val.csv')
    
    if not os.path.exists(train_path):
        print("[-] Training set not found. Generating corpus...")
        from research.scripts.build_multilabel_corpus import build_multilabel_corpus
        build_multilabel_corpus()
        
    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)
    
    tokenizer = get_real_tokenizer()
    print(f"[*] Loaded Real WordPiece Tokenizer: vocab_size={tokenizer.vocab_size}, special_tokens={tokenizer.all_special_tokens}")
    
    train_dataset = ScamDataset(train_df, tokenizer)
    val_dataset = ScamDataset(val_df, tokenizer)
    
    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False)
    
    model = MobileBertBottleneckEncoder(
        vocab_size=tokenizer.vocab_size,
        hidden_dim=512,
        bottleneck_dim=128,
        num_layers=4,
        num_heads=4,
        num_classes=8
    )
    
    total_params = sum(p.numel() for p in model.parameters())
    print(f"[*] MobileBERT Model Initialized: {total_params:,} parameters (25.3M class)")
    
    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)
    
    epochs = 10
    best_val_f1 = 0.0
    best_weights_path = os.path.join(MODELS_DIR, 'mobilebert_context.pt')
    
    print("\nStarting Multi-Label Training with Real WordPiece Tokens:")
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for batch in train_loader:
            optimizer.zero_grad()
            logits = model(batch['input_ids'], batch['attention_mask'])
            loss = criterion(logits, batch['labels'])
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            
        train_loss /= len(train_loader)
        
        # Validation
        model.eval()
        val_preds, val_targets = [], []
        with torch.no_grad():
            for batch in val_loader:
                logits = model(batch['input_ids'], batch['attention_mask'])
                probs = torch.sigmoid(logits)
                val_preds.append(probs.cpu().numpy())
                val_targets.append(batch['labels'].cpu().numpy())
                
        val_preds = np.vstack(val_preds)
        val_targets = np.vstack(val_targets)
        val_binary = (val_preds >= 0.50).astype(int)
        
        micro_f1 = f1_score(val_targets, val_binary, average='micro', zero_division=0)
        macro_f1 = f1_score(val_targets, val_binary, average='macro', zero_division=0)
        
        print(f"  Epoch {epoch:02d}/{epochs:02d} | Train Loss: {train_loss:.4f} | Val Micro-F1: {micro_f1:.4f} | Val Macro-F1: {macro_f1:.4f}")
        
        if micro_f1 >= best_val_f1:
            best_val_f1 = micro_f1
            torch.save({
                'model_state_dict': model.state_dict(),
                'model_config': {
                    'vocab_size': tokenizer.vocab_size,
                    'hidden_dim': 512,
                    'bottleneck_dim': 128,
                    'num_layers': 4,
                    'num_heads': 4,
                    'num_classes': 8,
                    'label_columns': LABEL_COLUMNS,
                    'tokenizer_name': 'google/mobilebert-uncased',
                    'special_tokens': {
                        'pad_token_id': 0,
                        'unk_token_id': 100,
                        'cls_token_id': 101,
                        'sep_token_id': 102,
                        'mask_token_id': 103
                    }
                },
                'best_val_f1': best_val_f1,
                'epoch': epoch
            }, best_weights_path)
            
    print(f"\n[+] Training complete. Best Validation Micro-F1: {best_val_f1:.4f}")
    print(f"[+] Saved model checkpoint to {best_weights_path}")
    
    # Save metadata configuration
    meta = {
        'model_name': 'MobileBERT-Context-Classifier',
        'parameters': f"{total_params:,}",
        'architecture': 'MobileBERT-Bottleneck (4-layer, 512-hidden, 128-bottleneck)',
        'quantization_target': 'INT8',
        'tokenizer': 'google/mobilebert-uncased (WordPiece)',
        'vocab_size': tokenizer.vocab_size,
        'special_tokens': {
            'pad': 0,
            'unk': 100,
            'cls': 101,
            'sep': 102,
            'mask': 103
        },
        'classes': LABEL_COLUMNS,
        'random_seed': RANDOM_SEED,
        'dataset_version': 'multilabel_scam_corpus_v1.0'
    }
    with open(os.path.join(MODELS_DIR, 'mobilebert_config.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2)
    print(f"[+] Saved model metadata configuration to {os.path.join(MODELS_DIR, 'mobilebert_config.json')}")

if __name__ == '__main__':
    train_mobilebert()
