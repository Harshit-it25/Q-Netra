# Q-NETRA AI — Privacy Architecture

**Design Paradigm:** Client-Local Processing by Default, Minimalist Structured Transmissions

---

## 1. Zero Video/Image Ingestion to Cloud

- Camera feed frames are captured strictly in client GPU/CPU memory via HTML5 Canvas.
- In-memory `jsQR` barcode matrix decoding extracts only the text payload (`upi://pay?...`).
- All active media tracks are immediately halted via `track.stop()` upon QR discovery or modal exit.
- No raw images or video streams are ever uploaded to any backend server.

---

## 2. On-Device Context Processing

- Pre-payment coercion detection executes client-side via `onDeviceContextService.ts` in $<5\text{ms}$.
- Only lightweight structured metadata flags (`urgency: true`, `payment_pressure: true`, `authority_claim: true`) are transmitted to the backend for correlation.

---

## 3. Storage Sovereignty

- Stored payment checks reside exclusively in client `localStorage`.
- No user-specific bank identifiers or transaction history are logged to server disk or persistent databases.
- The user can individually delete any transaction record or perform a complete storage wipe from Settings.
