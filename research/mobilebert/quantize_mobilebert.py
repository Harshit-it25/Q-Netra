import os
import sys
import time
import numpy as np
import pandas as pd
import onnx
import onnxruntime as ort
from onnxruntime.quantization import quantize_dynamic, QuantType
from sklearn.metrics import f1_score

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

RESEARCH_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(RESEARCH_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from research.mobilebert.train_mobilebert import SimpleWordPieceTokenizer, LABEL_COLUMNS

RESEARCH_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(RESEARCH_DIR, 'models')
DATA_DIR = os.path.join(RESEARCH_DIR, 'datasets', 'external')
REPORTS_DIR = os.path.join(RESEARCH_DIR, 'reports')

def quantize_model():
    print("==================================================")
    print("Q-NETRA RESEARCH: INT8 QUANTIZATION BENCHMARK")
    print("==================================================")
    
    fp32_path = os.path.join(MODELS_DIR, 'mobilebert_context_fp32.onnx')
    int8_path = os.path.join(MODELS_DIR, 'mobilebert_context_int8.onnx')
    
    if not os.path.exists(fp32_path):
        from research.mobilebert.export_mobilebert import export_to_onnx
        export_to_onnx()
        
    print("[*] Quantizing FP32 model to INT8 dynamic quantization...")
    quantize_dynamic(
        model_input=fp32_path,
        model_output=int8_path,
        weight_type=QuantType.QInt8
    )
    
    fp32_size_mb = os.path.getsize(fp32_path) / (1024 * 1024)
    int8_size_mb = os.path.getsize(int8_path) / (1024 * 1024)
    compression_ratio = (1 - int8_size_mb / fp32_size_mb) * 100
    
    print(f"[+] FP32 Model Size: {fp32_size_mb:.2f} MB")
    print(f"[+] INT8 Model Size: {int8_size_mb:.2f} MB ({compression_ratio:.1f}% size reduction)")
    
    # Load test dataset for empirical degradation audit
    test_df = pd.read_csv(os.path.join(DATA_DIR, 'multilabel_test.csv'))
    tokenizer = SimpleWordPieceTokenizer()
    
    # FP32 Session
    sess_fp32 = ort.InferenceSession(fp32_path, providers=['CPUExecutionProvider'])
    # INT8 Session
    sess_int8 = ort.InferenceSession(int8_path, providers=['CPUExecutionProvider'])
    
    fp32_latencies, int8_latencies = [], []
    fp32_preds, int8_preds = [], []
    targets = test_df[LABEL_COLUMNS].values.astype(np.float32)
    
    for text in test_df['text']:
        ids, mask = tokenizer.encode(text, 64)
        input_ids_np = ids.unsqueeze(0).numpy()
        attention_mask_np = mask.unsqueeze(0).numpy()
        
        # FP32 Inference
        t0 = time.perf_counter()
        out_fp32 = sess_fp32.run(None, {'input_ids': input_ids_np, 'attention_mask': attention_mask_np})[0]
        t1 = time.perf_counter()
        fp32_latencies.append((t1 - t0) * 1000)
        fp32_preds.append(1 / (1 + np.exp(-out_fp32[0])))
        
        # INT8 Inference
        t2 = time.perf_counter()
        out_int8 = sess_int8.run(None, {'input_ids': input_ids_np, 'attention_mask': attention_mask_np})[0]
        t3 = time.perf_counter()
        int8_latencies.append((t3 - t2) * 1000)
        int8_preds.append(1 / (1 + np.exp(-out_int8[0])))
        
    fp32_preds = np.array(fp32_preds)
    int8_preds = np.array(int8_preds)
    
    fp32_bin = (fp32_preds >= 0.50).astype(int)
    int8_bin = (int8_preds >= 0.50).astype(int)
    
    fp32_f1 = f1_score(targets, fp32_bin, average='micro', zero_division=0)
    int8_f1 = f1_score(targets, int8_bin, average='micro', zero_division=0)
    
    fp32_p50 = np.percentile(fp32_latencies, 50)
    int8_p50 = np.percentile(int8_latencies, 50)
    
    print("\nQuantization Audit Summary:")
    print(f"  FP32: Size = {fp32_size_mb:.2f} MB | P50 Latency = {fp32_p50:.2f} ms | Micro-F1 = {fp32_f1:.4f}")
    print(f"  INT8: Size = {int8_size_mb:.2f} MB | P50 Latency = {int8_p50:.2f} ms | Micro-F1 = {int8_f1:.4f}")
    print(f"  F1 Retention: {(int8_f1 / fp32_f1) * 100:.2f}% (Degradation: {abs(fp32_f1 - int8_f1):.4f})")
    
    return {
        'fp32_size_mb': fp32_size_mb,
        'int8_size_mb': int8_size_mb,
        'compression_ratio': compression_ratio,
        'fp32_p50': fp32_p50,
        'int8_p50': int8_p50,
        'fp32_f1': fp32_f1,
        'int8_f1': int8_f1
    }

if __name__ == '__main__':
    quantize_model()
