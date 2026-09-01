# Q-NETRA AI — BHASHINI Multilingual Voice Integration

## 1. Architecture Overview
Q-NETRA AI integrates with the Government of India's **BHASHINI** (National Language Translation Mission / Digital India Bhashini Division) speech ecosystem to provide authentic Indian language speech synthesis (TTS) and speech recognition (STT).

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE WEB BROWSER                       │
│    (LanguagePreferenceService -> VoiceService Facade)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON & WAV Base64
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Q-NETRA BACKEND PROXY                     │
│    (/api/voice/synthesize  &  /api/voice/transcribe)        │
│    • Hides API Keys from Frontend                           │
│    • Enforces Input Sanitization & Payload Limits           │
│    • Rate Limiting (60 req/min) & Timeout Handling (6.5s)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ ULCA Pipeline Inference API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 BHASHINI CLOUD SERVICES                     │
│    (Government of India NLTM Speech Pipeline)               │
│    • ASR (Speech-to-Text)                                   │
│    • TTS (Text-to-Speech)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Critical Separation Rule: Q-NETRA Fraud Engine ≠ BHASHINI

| Layer | Responsibility |
| :--- | :--- |
| **Q-NETRA Fraud Engine** | Objective risk scoring, QR parsing, mule cluster graph lookup, Story ↮ Money Trail correlation, STOP/VERIFY/PROCEED determination, 3-pillar evidence generation. *(100% language-independent)* |
| **BHASHINI Speech Layer** | Audio I/O transport only: converting localized safety text into natural speech audio (TTS) and voice queries into text transcripts (ASR). |

> **Rule:** BHASHINI never calculates, modifies, or determines fraud risk. Q-NETRA never uses speech output to alter transaction safety decisions.

---

## 3. Supported Languages & Locales

| Language | Display Name | BCP-47 Locale | BHASHINI Code | Fallback Locale |
| :--- | :--- | :--- | :--- | :--- |
| **English** | English (India) | `en-IN` | `en` | `en-IN` |
| **Hindi** | हिन्दी | `hi-IN` | `hi` | `en-IN` |
| **Marathi** | मराठी | `mr-IN` | `mr` | `hi-IN` |
| **Bengali** | বাংলা | `bn-IN` | `bn` | `en-IN` |
| **Tamil** | தமிழ் | `ta-IN` | `ta` | `en-IN` |
| **Telugu** | తెలుగు | `te-IN` | `te` | `en-IN` |
| **Kannada** | ಕನ್ನಡ | `kn-IN` | `kn` | `en-IN` |
| **Gujarati** | ગુજરાતી | `gu-IN` | `gu` | `hi-IN` |

---

## 4. Cascading Fallback Architecture
The system is architected to be resilient to network drops or quota exhaustion without ever crashing:

```
[TTS Flow]
  BHASHINI Cloud TTS
       ↓ (if unavailable or timeout)
  Device / Browser SpeechSynthesis
       ↓ (if unavailable)
  Prominent Visible Screen Text

[STT Flow]
  BHASHINI Cloud ASR
       ↓ (if unavailable or timeout)
  Browser SpeechRecognition
       ↓ (if unavailable)
  Text Input Box
```

---

## 5. Security & Privacy Boundary

1. **Credential Protection**:
   - `BHASHINI_API_KEY`, `BHASHINI_USER_ID`, `BHASHINI_PIPELINE_ID` reside strictly in backend environment variables.
   - Zero credentials are exposed in client bundles, `localStorage`, or git repositories.

2. **Privacy Clear Distinction**:
   - **Local Payment Analysis**: QR code frames, device contacts, and on-device context evaluation run locally.
   - **Cloud Voice Service**: Only when voice features are active, audio is sent to BHASHINI for speech conversion.
   - **Zero Audio Retention**: Temporary audio buffers are deleted immediately after transcription. No audio recordings are permanently stored.

3. **Rate Limiting & Safety Bounds**:
   - Voice endpoints are protected by `voiceApiLimiter` (60 req/min per IP).
   - Audio payload maximum size: 2MB Base64.
   - Maximum audio duration: 15 seconds.
   - Request timeout: 6,500ms via `AbortController`.

---

## 6. Real-Device Telemetry & Latency Metrics
- **Local Risk Decision**: sub-5ms (on-device V8 execution).
- **BHASHINI TTS Latency**: ~350ms - 900ms depending on network conditions.
- **BHASHINI STT Latency**: ~600ms - 1,200ms for short voice queries.
- **Fallback Browser TTS**: ~50ms - 150ms.
