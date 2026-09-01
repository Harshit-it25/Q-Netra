# Q-NETRA AI — Security Architecture

**Version:** 3.5.0-rel  
**Security Posture:** Enterprise-Defensible Zero-Trust Perimeter

---

## 1. Network & Transport Security

1. **Origin Defense (CORS):**
   - Implemented in `server/middleware/cors.ts`.
   - Rejects unauthorized cross-origin browser requests with 403 Forbidden.
   - Configurable via `ALLOWED_ORIGINS` environment variable.
2. **Strict Content Security Policy (CSP):**
   - Implemented in `server/middleware/securityHeaders.ts`.
   - `frame-ancestors 'none'`, `object-src 'none'`, preventing clickjacking and frame hijacking.
3. **Transport Integrity:**
   - Strict-Transport-Security (`HSTS` max-age=31536000).
   - `X-Content-Type-Options: nosniff`.
   - `X-Frame-Options: DENY`.
   - `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 2. API Abuse & Rate Limiting

- Implemented in `server/middleware/rateLimit.ts`.
- **Standard API Limiter:** 120 requests / minute per client IP.
- **AI Advisor Limiter:** 30 requests / minute per client IP.
- Periodic cleanup of expired rate limit buckets prevents memory leaks in daemon processes.

---

## 3. Input Sanitization & Payload Bounding

- Maximum request body size capped at `256kb` in `express.json()`.
- String inputs sanitized and bounded (`recipient` $\le 256$ chars, `note` $\le 512$ chars, `text` $\le 4096$ chars).
- Numeric amounts strictly bounded between ₹0 and ₹100,000,000.
- Centralized error handler (`server/middleware/errorHandler.ts`) suppresses stack traces and internal paths from client responses.
