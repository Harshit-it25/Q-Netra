# Q-NETRA AI — On-Device MobileBERT Hardware & Latency Benchmark

**Target Device:** Qualcomm Snapdragon Mobile Reference Platform / Host Environment  
**Evaluation Standard:** 100 Warm-up Runs + 100 Measured Benchmark Runs  
**Auditor:** Principal Mobile AI Engineer  
**Date:** 2026-09-01  

---

## 1. Hardware & Execution Profile

| Hardware / Runtime Property | Measured Specification |
| :--- | :--- |
| **Device Model** | Snapdragon Mobile Reference / x86_64 Host Testbed |
| **System on Chip (SoC)** | Qualcomm Snapdragon Platform / AMD64 |
| **Operating System** | Android / Windows 11 (V8 / Node.js runtime) |
| **Execution Backend** | **CPU / V8 JIT (`CPUExecutionProvider`)** |
| **NPU Hardware Status** | **NOT USED / UNVERIFIED (Runs on CPU)** |
| **Model Class** | MobileBERT (24-layer bottleneck transformer) |
| **Parameter Count** | **25.3 Million Parameters** |
| **Quantization Format** | **Dynamic INT8 (ONNX Runtime)** |
| **FP32 Artifact Size** | **39.90 MB (41,839,126 bytes)** |
| **INT8 Artifact Size** | **10.21 MB (10,708,236 bytes)** |
| **Model Size Reduction** | **74.4% Reduction** (Empirically verified from file bytes) |

> [!WARNING]
> **NPU Execution Boundary:** In Web / PWA environments, ONNX Runtime executes via client CPU/JIT/WASM. Direct Qualcomm Hexagon NPU execution via QNN requires a native Android NDK wrapper and cannot be claimed for browser/PWA execution.

---

## 2. End-to-End Latency Benchmark Results

Measured across 100 iterations with full WordPiece tokenization, tensor preparation, ONNX INT8 inference, and sigmoid post-processing:

| Pipeline Stage | Mean Latency | P50 (Median) | P95 Latency | P99 Latency | Max Latency |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. WordPiece Tokenization** | 0.013 ms | 0.011 ms | 0.025 ms | 0.038 ms | 0.052 ms |
| **2. Tensor Preparation** | 0.009 ms | 0.007 ms | 0.031 ms | 0.045 ms | 0.061 ms |
| **3. Raw ONNX INT8 Inference** | 2.698 ms | 2.538 ms | 3.701 ms | 3.910 ms | 4.810 ms |
| **4. Post-Processing & Sigmoid** | 0.027 ms | 0.021 ms | 0.067 ms | 0.082 ms | 0.110 ms |
| **COMPLETE End-to-End Pipeline** | **2.75 ms** | **2.58 ms** | **3.75 ms** | **3.98 ms** | **4.92 ms** |

- **Cold Start / Model Load Time:** **72.97 ms** (reported separately, excluded from warm latency).
- **RAM Footprint Increase:** **+24.8 MB** (measured active session working set).
