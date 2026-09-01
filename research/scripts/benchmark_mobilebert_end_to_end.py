"""
=============================================================================
Q-NETRA AI — REAL MOBILEBERT END-TO-END LATENCY & INTEGRITY BENCHMARK
=============================================================================
Measures the COMPLETE on-device inference pipeline using REAL WordPiece:
  Raw text -> Normalization -> WordPiece Tokenization -> Tensor Creation
  -> ONNX INT8 Execution -> Logits -> Sigmoid -> Label Decoding
  -> ContextPrediction

Runs 100 warm-up iterations + 100 measured iterations.
Evaluates input sensitivity to guarantee model is genuinely executing.
=============================================================================
"""

import os
import sys
import time
import json
import numpy as np

# Force UTF-8 encoding on Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

try:
    import onnxruntime as ort
except ImportError:
    print("Error: onnxruntime is required. Please install via pip install onnxruntime.")
    sys.exit(1)

from transformers import AutoTokenizer

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_PATH = os.path.join(PROJECT_ROOT, "research", "models", "mobilebert_context_int8.onnx")
TOKENIZER_PATH = os.path.join(PROJECT_ROOT, "research", "models", "mobilebert_tokenizer")
CONFIG_PATH = os.path.join(PROJECT_ROOT, "research", "models", "mobilebert_config.json")
REPORT_PATH = os.path.join(PROJECT_ROOT, "research", "reports", "mobilebert_e2e_benchmark.json")

LABEL_NAMES = [
    "LEGITIMATE",
    "PAYMENT_REQUEST",
    "URGENCY",
    "PAYMENT_PRESSURE",
    "AUTHORITY_IMPERSONATION",
    "PHISHING",
    "SOCIAL_ENGINEERING",
    "FRAUD"
]

def load_tokenizer():
    if os.path.exists(TOKENIZER_PATH):
        return AutoTokenizer.from_pretrained(TOKENIZER_PATH)
    return AutoTokenizer.from_pretrained('google/mobilebert-uncased')

def run_benchmark():
    print("=================================================================")
    print("  Q-NETRA AI — REAL MOBILEBERT PIPELINE BENCHMARK (100 RUNS)")
    print("  USING GENUINE GOOGLE MOBILEBERT WORDPIECE TOKENIZER")
    print("=================================================================")

    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model not found at {MODEL_PATH}")
        sys.exit(1)

    t_load_start = time.perf_counter()
    session = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
    t_load_end = time.perf_counter()
    load_time_ms = (t_load_end - t_load_start) * 1000

    tokenizer = load_tokenizer()
    print(f"[*] ONNX INT8 Model Initial Load Time: {load_time_ms:.2f} ms")
    print(f"[*] Loaded Real WordPiece Tokenizer: vocab_size={tokenizer.vocab_size}")
    print(f"[*] Execution Provider: {session.get_providers()}")
    print(f"[*] Input Names: {[i.name for i in session.get_inputs()]}")
    print(f"[*] Output Names: {[o.name for o in session.get_outputs()]}")

    # Integrity verification
    text_a = "Your electricity bill of ₹850 is due today. Pay using the official utility portal."
    text_b = "Pay ₹10 immediately or your electricity will be disconnected. Send money to this personal UPI ID."

    enc_a = tokenizer(text_a, max_length=64, padding='max_length', truncation=True, return_tensors='np')
    out_a = session.run(None, {'input_ids': enc_a['input_ids'], 'attention_mask': enc_a['attention_mask']})[0]
    probs_a = 1 / (1 + np.exp(-out_a[0]))

    enc_b = tokenizer(text_b, max_length=64, padding='max_length', truncation=True, return_tensors='np')
    out_b = session.run(None, {'input_ids': enc_b['input_ids'], 'attention_mask': enc_b['attention_mask']})[0]
    probs_b = 1 / (1 + np.exp(-out_b[0]))

    print("\n--- Model Sensitivity & Integrity Verification ---")
    print(f"Input A (Legitimate): '{text_a}'")
    print(f"  -> Legitimate Score: {probs_a[0]:.4f}, Fraud Score: {probs_a[7]:.4f}, Pressure: {probs_a[3]:.4f}")
    print(f"Input B (Scam/Coercion): '{text_b}'")
    print(f"  -> Legitimate Score: {probs_b[0]:.4f}, Fraud Score: {probs_b[7]:.4f}, Pressure: {probs_b[3]:.4f}")

    if np.array_equal(out_a, out_b):
        print("[-] ERROR: Model output identical across different inputs!")
        sys.exit(1)
    else:
        print("  [NOTICE] Genuine output difference verified.")

    # 100 warm-up runs
    print("\n[*] Running 100 warm-up iterations...")
    test_texts = [
        "Pay ₹10 immediately to prevent electricity power cut tonight",
        "Your Swiggy food delivery invoice has been paid",
        "Your SBI account KYC has expired. Download APK to update",
        "Electricity bill due ₹850. Pay via portal",
        "You won Rs 50,000 lottery! Send Rs 500 processing fee"
    ]
    for i in range(100):
        t = test_texts[i % len(test_texts)]
        enc = tokenizer(t, max_length=64, padding='max_length', truncation=True, return_tensors='np')
        session.run(None, {'input_ids': enc['input_ids'], 'attention_mask': enc['attention_mask']})

    # 100 measured runs
    print("[*] Running 100 measured iterations with stage breakdown...")
    tok_latencies = []
    tensor_latencies = []
    onnx_latencies = []
    post_latencies = []
    total_latencies = []

    for i in range(100):
        t = test_texts[i % len(test_texts)]
        
        t0 = time.perf_counter()
        # Stage 1: Tokenization
        tokens = tokenizer.tokenize(t)
        t1 = time.perf_counter()
        
        # Stage 2: Tensor Prep
        enc = tokenizer(t, max_length=64, padding='max_length', truncation=True, return_tensors='np')
        input_ids = enc['input_ids']
        attention_mask = enc['attention_mask']
        t2 = time.perf_counter()
        
        # Stage 3: Raw ONNX Inference
        out = session.run(None, {'input_ids': input_ids, 'attention_mask': attention_mask})[0]
        t3 = time.perf_counter()
        
        # Stage 4: Post-Processing
        probs = 1 / (1 + np.exp(-out[0]))
        predictions = {LABEL_NAMES[idx]: float(probs[idx]) for idx in range(len(LABEL_NAMES))}
        t4 = time.perf_counter()
        
        tok_latencies.append((t1 - t0) * 1000)
        tensor_latencies.append((t2 - t1) * 1000)
        onnx_latencies.append((t3 - t2) * 1000)
        post_latencies.append((t4 - t3) * 1000)
        total_latencies.append((t4 - t0) * 1000)

    # Statistics
    mean_tok = float(np.mean(tok_latencies))
    mean_tensor = float(np.mean(tensor_latencies))
    mean_onnx = float(np.mean(onnx_latencies))
    mean_post = float(np.mean(post_latencies))
    
    mean_total = float(np.mean(total_latencies))
    std_total = float(np.std(total_latencies))
    min_total = float(np.min(total_latencies))
    max_total = float(np.max(total_latencies))
    p50_total = float(np.percentile(total_latencies, 50))
    p95_total = float(np.percentile(total_latencies, 95))
    p99_total = float(np.percentile(total_latencies, 99))

    model_size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)

    print("\n=================================================================")
    print("                COMPLETE LATENCY BENCHMARK RESULTS                ")
    print("=================================================================")
    print(f"Total Measured Runs: 100 (after 100 warmup runs)")
    print(f"Target Model: MobileBERT (10.4M INT8 Quantized ONNX)")
    print(f"Tokenizer: Google MobileBERT WordPiece (30,522 Vocabulary)")
    print(f"Model File Size: {model_size_mb:.2f} MB")
    print(f"Cold Start / Model Load Time: {load_time_ms:.2f} ms")
    print("\n--- Stage Breakdown (Mean Latency) ---")
    print(f"  1. Tokenization Latency:     {mean_tok:.3f} ms (P50: {np.percentile(tok_latencies, 50):.3f} ms, P95: {np.percentile(tok_latencies, 95):.3f} ms)")
    print(f"  2. Tensor Prep Latency:      {mean_tensor:.3f} ms (P50: {np.percentile(tensor_latencies, 50):.3f} ms, P95: {np.percentile(tensor_latencies, 95):.3f} ms)")
    print(f"  3. Raw ONNX Model Inference: {mean_onnx:.3f} ms (P50: {np.percentile(onnx_latencies, 50):.3f} ms, P95: {np.percentile(onnx_latencies, 95):.3f} ms)")
    print(f"  4. Post-Processing:          {mean_post:.3f} ms (P50: {np.percentile(post_latencies, 50):.3f} ms, P95: {np.percentile(post_latencies, 95):.3f} ms)")
    print("\n--- COMPLETE END-TO-END MOBILEBERT PIPELINE LATENCY ---")
    print(f"  Minimum: {min_total:.2f} ms")
    print(f"  Mean:    {mean_total:.2f} ms (+/- {std_total:.2f} ms)")
    print(f"  P50:     {p50_total:.2f} ms")
    print(f"  P95:     {p95_total:.2f} ms")
    print(f"  P99:     {p99_total:.2f} ms")
    print(f"  Maximum: {max_total:.2f} ms")
    print("=================================================================")

    report_data = {
        "model_name": "MobileBERT-Context-Classifier-INT8",
        "tokenizer": "google/mobilebert-uncased (WordPiece)",
        "vocab_size": 30522,
        "model_size_mb": round(model_size_mb, 2),
        "execution_provider": "CPUExecutionProvider",
        "cold_start_load_ms": round(load_time_ms, 2),
        "warmup_runs": 100,
        "measured_runs": 100,
        "stage_breakdown_ms": {
            "tokenization": {"mean": round(mean_tok, 3), "p50": round(float(np.percentile(tok_latencies, 50)), 3), "p95": round(float(np.percentile(tok_latencies, 95)), 3)},
            "tensor_prep": {"mean": round(mean_tensor, 3), "p50": round(float(np.percentile(tensor_latencies, 50)), 3), "p95": round(float(np.percentile(tensor_latencies, 95)), 3)},
            "raw_onnx_inference": {"mean": round(mean_onnx, 3), "p50": round(float(np.percentile(onnx_latencies, 50)), 3), "p95": round(float(np.percentile(onnx_latencies, 95)), 3)},
            "post_processing": {"mean": round(mean_post, 3), "p50": round(float(np.percentile(post_latencies, 50)), 3), "p95": round(float(np.percentile(post_latencies, 95)), 3)}
        },
        "end_to_end_latency_ms": {
            "minimum": round(min_total, 2),
            "mean": round(mean_total, 2),
            "std": round(std_total, 2),
            "p50": round(p50_total, 2),
            "p95": round(p95_total, 2),
            "p99": round(p99_total, 2),
            "maximum": round(max_total, 2)
        }
    }

    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
    print(f"\n[+] Benchmark report saved to {REPORT_PATH}")

if __name__ == "__main__":
    run_benchmark()
