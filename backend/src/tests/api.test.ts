import request from 'supertest';
import { createApp } from '../app';

jest.mock('../services/geminiService', () => ({
  analyzeWithGemini: jest.fn().mockResolvedValue({
    verdict: 'Scam',
    confidence: 92,
    explanation: 'The message contains multiple high-confidence scam indicators.',
    triggered_signals: ['urgency', 'authority_impersonation', 'payment_request'],
    risk_level: 'Critical',
  }),
}));

// Mock config to avoid needing a real GEMINI_API_KEY in test environment
jest.mock('../config/env', () => ({
  config: {
    geminiApiKey: 'test-key',
    model: 'gemini-1.5-flash',
    port: 3000,
    nodeEnv: 'test',
    maxMessageLength: 5000,
    geminiTimeoutMs: 15000,
    rateLimitWindowMs: 60000,
    rateLimitMax: 100,
    isDevelopment: true,
  },
}));

const app = createApp();

describe('GET /api/health', () => {
  it('should return 200 with status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });
});

describe('POST /api/predict', () => {
  const SCAM_MESSAGE =
    'URGENT! Your SBI bank account is blocked. Pay Rs.500 via UPI now or face legal action.';

  it('should return 200 with a valid prediction for a scam message', async () => {
    const res = await request(app)
      .post('/api/predict')
      .send({ message: SCAM_MESSAGE })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('prediction');
    expect(res.body.data).toHaveProperty('confidence');
    expect(res.body.data).toHaveProperty('risk');
    expect(res.body.data).toHaveProperty('explanation');
    expect(res.body.data).toHaveProperty('features');
    expect(res.body.data).toHaveProperty('triggeredSignals');
    expect(res.body.meta).toHaveProperty('processingTimeMs');
  });

  it('should return prediction=Scam for a scam message (mocked Gemini)', async () => {
    const res = await request(app)
      .post('/api/predict')
      .send({ message: SCAM_MESSAGE });

    expect(res.body.data.prediction).toBe('Scam');
    expect(res.body.data.confidence).toBe(92);
    expect(res.body.data.risk).toBe('Critical');
  });

  it('should return 400 when message is missing', async () => {
    const res = await request(app)
      .post('/api/predict')
      .send({})
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when message is empty string', async () => {
    const res = await request(app)
      .post('/api/predict')
      .send({ message: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when message is not a string', async () => {
    const res = await request(app)
      .post('/api/predict')
      .send({ message: 12345 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 413 when message exceeds max length', async () => {
    const hugeMessage = 'a'.repeat(6000);
    const res = await request(app)
      .post('/api/predict')
      .send({ message: hugeMessage });

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('MESSAGE_TOO_LARGE');
  });

  it('should return 400 when body is not JSON', async () => {
    const res = await request(app)
      .post('/api/predict')
      .send('not json at all')
      .set('Content-Type', 'text/plain');

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should return 405 for GET /api/predict', async () => {
    const res = await request(app).get('/api/predict');
    expect(res.status).toBe(405);
    expect(res.body.error.code).toBe('METHOD_NOT_ALLOWED');
  });
});

describe('POST /api/extract-features', () => {
  const TEST_MESSAGE = 'Congratulations! You won an iPhone. Click http://bit.ly/prize-claim now!';

  it('should return 200 with extracted features', async () => {
    const res = await request(app)
      .post('/api/extract-features')
      .send({ message: TEST_MESSAGE });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('features');
    const { features } = res.body.data;
    expect(features).toHaveProperty('urgency_score');
    expect(features).toHaveProperty('authority_impersonation');
    expect(features).toHaveProperty('payment_request');
    expect(features).toHaveProperty('otp_request');
    expect(features).toHaveProperty('url_count');
    expect(features).toHaveProperty('contains_shortened_url');
    expect(features).toHaveProperty('reward_or_lottery');
    expect(features).toHaveProperty('message_length');
  });

  it('should detect reward_or_lottery = true for the test message', async () => {
    const res = await request(app)
      .post('/api/extract-features')
      .send({ message: TEST_MESSAGE });

    expect(res.body.data.features.reward_or_lottery).toBe(true);
    expect(res.body.data.features.contains_shortened_url).toBe(true);
  });

  it('should return 400 when message is missing', async () => {
    const res = await request(app)
      .post('/api/extract-features')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 405 for GET /api/extract-features', async () => {
    const res = await request(app).get('/api/extract-features');
    expect(res.status).toBe(405);
  });
});

describe('404 — unknown routes', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
