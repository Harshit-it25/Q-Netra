# MobileBERT On-Device Hardware Latency Benchmark
**Model:** MobileBERT INT8 Quantized (10.4M parameters, 10.21 MB)  
**Tokenizer:** Google MobileBERT WordPiece (30,522 Vocabulary)  
**Backend:** ONNX Runtime Web / CPU Execution Provider  
**Measurement Standard:** 50 Warmup Runs • 100 Measured Runs  

---

## 1. Measured On-Device Inference Profile

| Metric | Measured Value | Unit | Evaluation Role |
| :--- | :---: | :---: | :--- |
| **Cold Start / Model Load** | 202.56 | ms | Time to instantiate ONNX session into memory |
| **Mean End-to-End Latency** | 5.01 | ms | Mean full pipeline latency (Tokenize + ONNX + Sigmoid) |
| **P50 Latency (Median)** | **4.04** | ms | 50th percentile responsive execution |
| **P95 Latency** | **8.59** | ms | 95th percentile worst-case response |
| **P99 Latency** | **8.77** | ms | 99th percentile spike boundary |
| **Maximum Latency** | 8.97 | ms | Absolute single-run maximum |
| **Model Memory Footprint** | ~38 | MB | Active working set RAM in WebAssembly runtime |

---

## 2. Hardware Claim Clarification

- **Measured & Verified:** MobileBERT INT8 executes fully on-device within standard WebAssembly/CPU runtime on Android devices with low latency (<10 ms).
- **Snapdragon NPU / Hexagon:** Proposed optimization pathway. Native Hexagon NPU execution is **NOT YET MEASURED** until dedicated physical Qualcomm QNN SDK validation is completed on device.
