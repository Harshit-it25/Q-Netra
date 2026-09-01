# Q-NETRA AI — Future Qualcomm QNN & Hexagon NPU Acceleration Architecture

**Document Type:** Architectural Blueprint & Future Roadmap  
**Scope:** Qualcomm Neural Processing SDK (QNN) & Hexagon NPU Integration  
**Target Hardware:** Qualcomm Snapdragon 8 Gen 2 / Gen 3 / Gen 4 / 7+ Gen 2 Platforms  
**Auditor / Author:** Principal Mobile AI Systems Engineer  

---

## 1. Current State vs Future State Boundary

```
========================================================================
CURRENT IMPLEMENTATION (v3.5.0 APK Release)
========================================================================
  Android WebView Runtime
    ↓
  JavaScript / V8 Engine (CPU)
    ↓
  MobileBERT INT8 Model (~10.21 MB, 25.3M Parameters)
    ↓
  CPU Execution Provider (Qualcomm Kryo CPU Cores)
    ↓
  Latency: ~2.60 ms P50 | Memory: ~24.8 MB Working Set
========================================================================

========================================================================
FUTURE ROADMAP (v4.0.0 Native Acceleration)
========================================================================
  Native Android App (Kotlin / Java + C++ JNI)
    ↓
  Qualcomm QNN SDK (libQnnHtp.so / libQnnCpu.so)
    ↓
  Compiled QNN Context Binary / INT8 DLC
    ↓
  Hexagon NPU / HTP (Hexagon Tensor Processor)
    ↓
  Target Latency: <0.60 ms P50 | Zero CPU Core Overhead
========================================================================
```

---

## 2. Technical Prerequisites for Native QNN Execution

To achieve genuine on-device NPU execution on Snapdragon devices without compromising safety or cross-device compatibility, the following components are required:

### 2.1 Model Compilation via Qualcomm AI Engine Direct
1. **Model Source:** ONNX INT8 model (`mobilebert_context_int8.onnx`).
2. **QNN Converter:** Convert ONNX graph to QNN Model via `qnn-onnx-converter`:
   ```bash
   qnn-onnx-converter \
     --input_network research/models/mobilebert_context_int8.onnx \
     --output_path research/models/qnn/mobilebert_qnn.cpp \
     --quantization_overrides research/models/qnn/quant_params.json
   ```
3. **QNN Model Compilation:** Generate serialized QNN context binary targeting HTP architecture (e.g. Hexagon v68 / v73 / v75):
   ```bash
   qnn-model-lib-generator \
     -c research/models/qnn/mobilebert_qnn.cpp \
     -b research/models/qnn/mobilebert_qnn.bin \
     -o research/models/qnn/libs/arm64-v8a/libmobilebert_qnn.so
   ```

### 2.2 Native Android NDK Integration
- Implement a C++ JNI bridge in `android/app/src/main/cpp/qnetra_npu_engine.cpp`:
  - Load `libQnnHtp.so` and `libQnnSystem.so`.
  - Initialize `QnnInterface_t` backend.
  - Allocate zero-copy RPC shared memory for tensor input/output buffers.
  - Expose JNI methods: `Java_ai_qnetra_app_NativeNpuEngine_classifyContext()`.

### 2.3 Runtime Fallback Matrix
| Device Platform | Primary Engine | Fallback Engine |
| :--- | :--- | :--- |
| **Snapdragon with Hexagon HTP** | Native QNN HTP (NPU) | Native QNN CPU |
| **Snapdragon (Legacy)** | Native QNN CPU | Local Web CPU |
| **Non-Qualcomm SoC (MediaTek / Exynos)** | ONNX Runtime CPU | Heuristic NLP |

---

## 3. Strict Claims Compliance Rules

1. **Never claim NPU acceleration** while running inside WebView or standard JavaScript runtime.
2. **Never imply NPU execution** based solely on the presence of a Snapdragon processor.
3. Keep current benchmarks labeled strictly as **CPUExecutionProvider / Local CPU**.
4. Maintain `CLAIMS_AUDIT.md` up-to-date with audited verification results.
