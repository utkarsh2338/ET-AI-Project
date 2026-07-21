# 🛡️ Scam Detection API

An AI-powered, explainable scam detection backend built with **Node.js**, **TypeScript**, **Express**, and the **Google Gemini API**.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    POST /api/predict                         │
└────────────────────────┬────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │  Stage 1: Feature   │  ← Deterministic, no LLM
              │  Extraction Layer   │    Rule-based analysis
              └──────────┬──────────┘
                         │  ExtractedFeatures{ urgency_score,
                         │    authority_impersonation, payment_request,
                         │    otp_request, threat_score, ... }
              ┌──────────▼──────────┐
              │  Stage 2: Gemini    │  ← LLM reasons ONLY over
              │  Reasoning Layer    │    provided features
              └──────────┬──────────┘
                         │  { verdict, confidence, explanation,
                         │    triggered_signals, risk_level }
              ┌──────────▼──────────┐
              │   PredictionResult  │
              └─────────────────────┘
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts                  # Env validation + typed config
│   ├── constants/
│   │   └── keywords.ts             # All keyword lists & regex patterns
│   ├── controllers/
│   │   ├── healthController.ts     # GET /health
│   │   └── predictionController.ts # POST /predict, POST /extract-features
│   ├── dataset/
│   │   └── sample_dataset.csv      # Sample messages for validation
│   ├── routes/
│   │   ├── health.routes.ts
│   │   ├── prediction.routes.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── featureExtractor.ts     # Stage 1: Deterministic feature extraction
│   │   ├── geminiService.ts        # Stage 2: Gemini API integration
│   │   └── predictionService.ts   # Pipeline orchestrator
│   ├── tests/
│   │   ├── featureExtractor.test.ts
│   │   ├── urgencyDetector.test.ts
│   │   ├── authorityDetector.test.ts
│   │   ├── paymentDetector.test.ts
│   │   ├── otpDetector.test.ts
│   │   └── api.test.ts
│   ├── types/
│   │   └── index.ts                # All TypeScript interfaces
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errorHandler.ts
│   │   └── responseFormatter.ts
│   ├── validation/
│   │   └── validation.ts          # Dataset validation script
│   ├── app.ts                      # Express app factory
│   └── server.ts                   # Entry point
├── .env.example
├── jest.config.js
├── package.json
└── tsconfig.json
```

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
GEMINI_API_KEY=your_key_here   # Required — get from https://aistudio.google.com/app/apikey
MODEL=gemini-1.5-flash          # Or gemini-1.5-pro, gemini-2.0-flash-exp
PORT=3000
NODE_ENV=development
```

### 3. Run in Development
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

## API Reference

### `GET /api/health`

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "OK",
  "service": "scam-detection-api",
  "version": "1.0.0",
  "timestamp": "2025-07-21T17:00:00.000Z",
  "uptime": 42
}
```

---

### `POST /api/predict`

Runs the full two-stage pipeline and returns a complete scam prediction.

```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"message": "URGENT! Your SBI bank account is BLOCKED! Pay Rs.500 via UPI immediately or face legal action. Call 9876543210 now!"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prediction": "Scam",
    "confidence": 94,
    "risk": "Critical",
    "explanation": "This message exhibits multiple high-confidence scam indicators: it impersonates SBI bank, creates artificial urgency with 'URGENT' and 'immediately', threatens legal action to coerce the victim, and requests a UPI payment. The combination of authority impersonation, threat language, payment request, and urgency is a classic scam pattern with very high confidence.",
    "features": {
      "urgency_score": 8,
      "matched_urgency_keywords": ["urgent", "immediately", "account blocked"],
      "authority_impersonation": true,
      "matched_authority_entities": ["sbi"],
      "payment_request": true,
      "payment_keywords": ["upi", "pay"],
      "otp_request": false,
      "otp_keywords": [],
      "url_count": 0,
      "contains_shortened_url": false,
      "contains_ip_url": false,
      "suspicious_domains": [],
      "threat_score": 3,
      "threat_keywords": ["account blocked", "legal action"],
      "reward_or_lottery": false,
      "reward_keywords": [],
      "crypto_keywords": false,
      "bank_keywords": true,
      "grammar_quality": "poor",
      "uppercase_ratio": 0.22,
      "exclamation_count": 2,
      "punctuation_density": 0.03,
      "message_length": 112,
      "word_count": 22,
      "digit_ratio": 0.08,
      "emoji_count": 0,
      "currency_symbol_count": 0,
      "phone_number_count": 1,
      "email_count": 0
    },
    "triggeredSignals": [
      "High urgency score (8/10)",
      "Authority impersonation: SBI bank",
      "Payment request detected: UPI",
      "Threatening language: 'legal action', 'account blocked'",
      "Poor grammar quality with excessive caps"
    ]
  },
  "meta": {
    "processingTimeMs": 1423,
    "timestamp": "2025-07-21T17:00:00.000Z"
  }
}
```

---

### `POST /api/extract-features`

Runs only Stage 1 — no Gemini API call.

```bash
curl -X POST http://localhost:3000/api/extract-features \
  -H "Content-Type: application/json" \
  -d '{"message": "Congratulations! You won Rs.10,00,000 in the Lucky Draw. Click bit.ly/claim now!"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "features": {
      "urgency_score": 2,
      "reward_or_lottery": true,
      "contains_shortened_url": true,
      "suspicious_domains": ["bit.ly"],
      ...
    }
  },
  "meta": {
    "processingTimeMs": 3,
    "timestamp": "2025-07-21T17:00:00.000Z"
  }
}
```

---

## Error Responses

| HTTP Code | Error Code              | Cause                                |
|-----------|-------------------------|--------------------------------------|
| 400       | `VALIDATION_ERROR`      | Missing/empty/invalid message field  |
| 405       | `METHOD_NOT_ALLOWED`    | Wrong HTTP method on endpoint        |
| 408       | `GEMINI_TIMEOUT`        | Gemini API request timed out         |
| 413       | `MESSAGE_TOO_LARGE`     | Message exceeds 5000 chars           |
| 502       | `GEMINI_UNAVAILABLE`    | Gemini API is down or unreachable    |
| 502       | `INVALID_GEMINI_RESPONSE`| Gemini returned unparseable JSON    |
| 500       | `INTERNAL_ERROR`        | Unexpected server error              |

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Test suite covers:
- `featureExtractor.test.ts` — master function integration tests
- `urgencyDetector.test.ts` — urgency scoring, edge cases, score capping
- `authorityDetector.test.ts` — all entity categories (RBI, banks, tech, police)
- `paymentDetector.test.ts` — UPI, crypto, bank transfer, gift cards
- `otpDetector.test.ts` — all OTP keyword variants
- `api.test.ts` — all endpoints, error codes, validation (Gemini mocked)

---

## Dataset Validation

```bash
# Full pipeline (uses Gemini API — ~37 API calls for sample dataset)
npm run validate

# Heuristic-only mode (no API calls, instant)
npx ts-node src/validation/validation.ts --no-gemini

# Custom dataset
npx ts-node src/validation/validation.ts --dataset ./path/to/your_dataset.csv
```

Dataset format (`message,label`):
```csv
message,label
"Your account is blocked. Verify now via bit.ly/abc",1
"Hi, the meeting is at 2 PM tomorrow.",0
```
`1` = Scam, `0` = Legitimate

---

## Risk Level Reference

| Confidence | Risk Level |
|------------|------------|
| 0 – 30     | 🟢 Low      |
| 31 – 60    | 🟡 Medium   |
| 61 – 80    | 🟠 High     |
| 81 – 100   | 🔴 Critical |

---

## Improving Precision — Deployment Recommendations

### Reducing False Positives

1. **Whitelist known senders**: Maintain a sender whitelist (e.g., bank shortcodes like `SBIINB`) and skip Gemini for them.

2. **Context window**: For OTP detection — distinguish "Share your OTP" (scam) from "Your OTP is 123456. Do not share." (legitimate) by checking surrounding context phrases.

3. **Two-threshold strategy**: Use a high-confidence threshold (>70) for auto-labeling. Route 40–70% confidence messages to a human review queue rather than auto-classifying.

4. **Ensemble signal weighting**: Weight signals by their historical false-positive contribution. OTP + payment + shortened URL together are near-zero FP; urgency alone has higher FP.

5. **Negative indicators**: Add explicit legitimate signals (e.g., "this OTP is valid for 10 minutes — do not share") that reduce the scam score.

### Reducing False Negatives

6. **Regional language support**: Many Indian scams use Hindi/Tamil/Telugu mixed with English ("aapka account block ho gaya"). Add regional keyword lists.

7. **Phonetic variation detection**: Scammers deliberately misspell ("0TP", "urgënt") to evade keyword filters. Use fuzzy matching or edit-distance checks.

8. **Number pattern analysis**: Detect unusual financial amounts formatted in various ways (₹1,00,000 / Rs.1 lakh / 100000 Rs).

9. **Semantic URL analysis**: Beyond shorteners, check newly registered domains, TLD patterns (.xyz, .tk, .ml), and non-standard subdomains.

10. **Fine-tuned confidence calibration**: Collect ground truth from real-world usage and recalibrate the scoring weights in `predictionService.ts`.

### Production Hardening

11. **Async queue**: Move Gemini calls off the request thread using a job queue (BullMQ + Redis) to handle traffic spikes.

12. **Caching**: Cache Gemini results for identical messages (Redis with SHA-256 message hash as key) to reduce API cost.

13. **Feedback loop**: Add a `POST /feedback` endpoint where users can report wrong predictions, feeding a retraining pipeline.

14. **Rate limiting per user**: Apply per-authenticated-user rate limits to prevent API abuse.

15. **Audit logging**: Log every prediction decision with features for compliance and model monitoring.
