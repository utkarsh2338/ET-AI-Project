import { extractFeatures } from '../services/featureExtractor';

describe('extractFeatures() — master function', () => {
  const SCAM_MESSAGE =
    'URGENT!! Your SBI bank account is BLOCKED! Pay Rs.500 via UPI or ' +
    'face legal action immediately. Verify your OTP now: http://bit.ly/verify-now 9876543210 ' +
    'Act fast! Account suspended. Last chance!';

  const LEGIT_MESSAGE =
    'Hi Priya, just a reminder that the team meeting is at 2 PM tomorrow. ' +
    'Please bring your project updates.';

  it('should return all expected fields for a scam message', () => {
    const features = extractFeatures(SCAM_MESSAGE);

    expect(features).toHaveProperty('urgency_score');
    expect(features).toHaveProperty('matched_urgency_keywords');
    expect(features).toHaveProperty('authority_impersonation');
    expect(features).toHaveProperty('payment_request');
    expect(features).toHaveProperty('otp_request');
    expect(features).toHaveProperty('url_count');
    expect(features).toHaveProperty('contains_shortened_url');
    expect(features).toHaveProperty('threat_score');
    expect(features).toHaveProperty('bank_keywords');
    expect(features).toHaveProperty('message_length');
    expect(features).toHaveProperty('phone_number_count');
  });

  it('should detect high urgency score for scam message', () => {
    const features = extractFeatures(SCAM_MESSAGE);
    expect(features.urgency_score).toBeGreaterThanOrEqual(3);
  });

  it('should detect authority impersonation (SBI) in scam message', () => {
    const features = extractFeatures(SCAM_MESSAGE);
    expect(features.authority_impersonation).toBe(true);
  });

  it('should detect payment request in scam message', () => {
    const features = extractFeatures(SCAM_MESSAGE);
    expect(features.payment_request).toBe(true);
  });

  it('should detect OTP request in scam message', () => {
    const features = extractFeatures(SCAM_MESSAGE);
    expect(features.otp_request).toBe(true);
  });

  it('should detect shortened URL', () => {
    const features = extractFeatures(SCAM_MESSAGE);
    expect(features.contains_shortened_url).toBe(true);
    expect(features.url_count).toBeGreaterThanOrEqual(1);
  });

  it('should detect phone number', () => {
    const features = extractFeatures(SCAM_MESSAGE);
    expect(features.phone_number_count).toBeGreaterThanOrEqual(1);
  });

  it('should return low scam indicators for legitimate message', () => {
    const features = extractFeatures(LEGIT_MESSAGE);

    expect(features.urgency_score).toBeLessThan(3);
    expect(features.authority_impersonation).toBe(false);
    expect(features.payment_request).toBe(false);
    expect(features.otp_request).toBe(false);
    expect(features.threat_score).toBe(0);
    expect(features.reward_or_lottery).toBe(false);
  });

  it('should handle empty string without throwing', () => {
    expect(() => extractFeatures('')).not.toThrow();
  });

  it('should handle very long messages without throwing', () => {
    const longMsg = 'Hello '.repeat(500);
    expect(() => extractFeatures(longMsg)).not.toThrow();
  });

  it('should handle messages with only emojis', () => {
    const emojiMsg = '🎉🎊🎁💰💳';
    const features = extractFeatures(emojiMsg);
    expect(features.emoji_count).toBeGreaterThan(0);
    expect(features.message_length).toBe(emojiMsg.length);
  });

  it('should compute uppercase_ratio correctly', () => {
    const allCaps = 'URGENT VERIFY NOW';
    const features = extractFeatures(allCaps);
    expect(features.uppercase_ratio).toBeGreaterThan(0.8);
  });
});
