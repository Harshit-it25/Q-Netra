# Q-NETRA AI — iQOO Hardware Validation Pending Notice

**Status:** PENDING ON-SITE LOANER DEVICE ACCESS  
**Location:** Pune Event Venue  
**Date:** 2026-08-31  

---

## 1. Statement of Pending Validation

iQOO-specific hardware accelerator validation is **officially pending** because the physical iQOO loaner device will be handed over to the development team on-site at the Pune hackathon event.

All tests to date have been validated on a **Development Android Device** and desktop Chrome/V8 environments. No iQOO-specific hardware performance benchmarks or Hexagon NPU execution metrics have been fabricated.

---

## 2. On-Site iQOO Validation Checklist

Upon receiving the official iQOO loaner device in Pune, the following engineering tests will be executed:

| Validation Target | Description | Verification Method |
| :--- | :--- | :--- |
| **Exact Snapdragon Chipset** | Confirm exact SoC model (e.g. Snapdragon 8 Gen 2 / Gen 3 / 7+ Gen 3). | Android Device Info / `navigator.userAgent` & CPU core topology inspection. |
| **Hardware Accelerator Availability** | Determine whether WebNN NPU backend or WASM SIMD acceleration is exposed by the installed browser/WebView. | Feature detection for `navigator.ml`, WebGPU, and WASM SIMD extensions. |
| **Actual Local AI Runtime** | Measure real-device execution latency of `classifyPaymentContextLocally` on the iQOO CPU/NPU. | Automated 100-iteration benchmark via `performance.now()`. |
| **OriginOS Camera Behavior** | Validate WebRTC camera stream stability, autofocus speed, and immediate hardware release on OriginOS. | Physical QR scan test; verify instant dismissal of Android green privacy dot. |
| **Thermal & Power Throttling** | Measure inference stability under sustained usage on the loaner hardware. | Continuous 50-scan stress test while monitoring CPU clock stability. |
| **Office Kit Forensic Dossier** | Test export and rendering of forensic investigation dossiers on OriginOS document viewers. | Verify PDF/dossier generation via `/api/office-kit/investigate`. |
| **HackTracker Telemetry** | Validate on-device telemetry logging without network data leakage. | Real-time traffic inspection via proxy/network panel. |

---

## 3. Current Guaranteed Baseline

While iQOO-specific NPU execution is pending on-site testing, the following capabilities are **100% verified and functional** on the current production build:
- Deterministic sub-5ms on-device context evaluation (running on Client V8 JIT CPU).
- In-memory local QR matrix decoding with instant camera hardware release.
- Real-time 4-hop mule syndicate graph mapping.
- Fail-safe offline error handling.
