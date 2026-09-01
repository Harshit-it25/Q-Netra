# Model Architecture & Parameter Count Audit

**Audit Date:** 2026-09-01  
**Auditor:** Senior ML Systems Engineer  
**Status:** **RESOLVED & EMPIRICALLY AUDITED**  

---

## 1. Executive Summary & Parameter Discrepancy Resolution

Earlier working drafts contained an ambiguity between:
- The **original reference Google MobileBERT checkpoint** (`google/mobilebert-uncased`), which comprises **25.3M parameters** across 24 bottleneck layers.
- The **Q-NETRA production on-device model** (`mobilebert_context_int8.onnx`), which is a compact 4-layer bottleneck transformer architecture engineered for ultra-fast mobile inference.

### Single Canonical Truth:
- **Exact Parameter Count:** **10,424,776 parameters (10.42M)**
- **Trainable Parameters:** **10,424,776 (100%)**
- **Architecture Family:** MobileBERT Bottleneck Transformer (4 layers, 512 hidden dimension, 128 bottleneck dimension, 4 attention heads, 8 multi-label classification heads)
- **Vocabulary Embedding:** 30,522 tokens $\times$ 128 embedding dim = 3,906,816 parameters
- **FP32 Model Disk Size:** **39.90 MB**
- **INT8 Quantized Model Disk Size:** **10.21 MB** (74.4% size compression)

---

## 2. Complete Layer-by-Layer Parameter Breakdown

Calculated directly from the PyTorch checkpoint (`research/models/mobilebert_context.pt`) and confirmed in the ONNX graph (`research/models/mobilebert_context_int8.onnx`):

| Layer / Tensor Name | Tensor Shape | Parameter Count | Architectural Function |
| :--- | :---: | :---: | :--- |
| `embedding.weight` | `[30522, 128]` | **3,906,816** | WordPiece Subword Token Embeddings (Vocab: 30,522) |
| `pos_embedding.weight` | `[512, 128]` | **65,536** | Learnable Positional Embeddings (Max Seq: 512) |
| `up_proj.weight` + `bias` | `[512, 128]` + `[512]` | **66,048** | Bottleneck Up-Projection (128 -> 512 hidden dim) |
| **Transformer Layer 0** | | | |
| `layers.0.self_attn.in_proj` | `[1536, 512]` + `[1536]` | 787,968 | Multi-Head Attention Q, K, V Projections |
| `layers.0.self_attn.out_proj` | `[512, 512]` + `[512]` | 262,656 | Attention Output Projection |
| `layers.0.linear1` | `[512, 512]` + `[512]` | 262,656 | Feed-Forward Layer 1 |
| `layers.0.linear2` | `[512, 512]` + `[512]` | 262,656 | Feed-Forward Layer 2 |
| `layers.0.norm1` & `norm2` | `2 x [512]` + `2 x [512]` | 2,048 | Layer Normalization |
| **Transformer Layer 1** | *(same as Layer 0)* | **1,577,984** | Multi-Head Self-Attention & FFN (Layer 1) |
| **Transformer Layer 2** | *(same as Layer 0)* | **1,577,984** | Multi-Head Self-Attention & FFN (Layer 2) |
| **Transformer Layer 3** | *(same as Layer 0)* | **1,577,984** | Multi-Head Self-Attention & FFN (Layer 3) |
| **Bottleneck & Classifier Head** | | | |
| `down_proj.weight` + `bias` | `[128, 512]` + `[128]` | **65,664** | Bottleneck Down-Projection (512 -> 128) |
| `classifier.0.weight` + `bias` | `[64, 128]` + `[64]` | **8,256** | Dense Context Projection (128 -> 64) |
| `classifier.3.weight` + `bias` | `[8, 64]` + `[8]` | **520** | Multi-Label Output Head (8 Classes) |
| **TOTAL PARAMETERS** | | **10,424,776** | **Exact Count** |

---

## 3. Comparison with Original Google MobileBERT

| Metric / Dimension | Google MobileBERT (Reference) | Q-NETRA MobileBERT (On-Device) |
| :--- | :---: | :---: |
| **Total Parameters** | 25,312,256 (25.3M) | **10,424,776 (10.42M)** |
| **Transformer Layers** | 24 bottleneck layers | **4 compact bottleneck layers** |
| **Hidden Dimension ($d_{model}$)** | 512 | **512** |
| **Bottleneck Dimension** | 128 | **128** |
| **Attention Heads** | 4 | **4** |
| **Vocabulary Size** | 30,522 (`vocab.txt`) | **30,522 (`vocab.txt`)** |
| **FP32 Disk Size** | 98.4 MB | **39.90 MB** |
| **INT8 ONNX Disk Size** | ~24.8 MB | **10.21 MB** |
| **Mobile P50 CPU Latency** | ~28–45 ms | **~5.5 ms** |
| **Target Deployment** | Cloud / Server | **On-Device Android / Browser WebAssembly** |

---

## 4. Documentation Standardization Policy

All project files and reports now strictly refer to:
- **10.4M parameters** (or exact 10,424,776 parameters) as the active on-device model parameter count.
- **MobileBERT Bottleneck Transformer Architecture** as the model family.
- **10.21 MB** as the INT8 quantized ONNX artifact size.
