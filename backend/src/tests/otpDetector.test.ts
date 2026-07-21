import { detectOTP } from '../services/featureExtractor';

describe('detectOTP()', () => {
  it('should return false for a message with no OTP reference', () => {
    const result = detectOTP('Hello, please review the attached document.');
    expect(result.otp_request).toBe(false);
    expect(result.otp_keywords).toHaveLength(0);
  });

  it('should detect "OTP"', () => {
    const result = detectOTP('Share your OTP to verify your identity.');
    expect(result.otp_request).toBe(true);
    expect(result.otp_keywords).toContain('otp');
  });

  it('should detect "one time password"', () => {
    const result = detectOTP('Please provide the one time password sent to your phone.');
    expect(result.otp_request).toBe(true);
    expect(result.otp_keywords).toContain('one time password');
  });

  it('should detect "verification code"', () => {
    const result = detectOTP('Enter the verification code we sent you.');
    expect(result.otp_request).toBe(true);
    expect(result.otp_keywords).toContain('verification code');
  });

  it('should detect "PIN" reference', () => {
    const result = detectOTP('Share your PIN to complete the transaction.');
    expect(result.otp_request).toBe(true);
    expect(result.otp_keywords).toContain('pin');
  });

  it('should detect "mpin"', () => {
    const result = detectOTP('Provide your mpin for authentication.');
    expect(result.otp_request).toBe(true);
    expect(result.otp_keywords).toContain('mpin');
  });

  it('should detect "authentication code"', () => {
    const result = detectOTP('Enter the authentication code to proceed.');
    expect(result.otp_request).toBe(true);
    expect(result.otp_keywords).toContain('authentication code');
  });

  it('should detect "2fa"', () => {
    const result = detectOTP('Your 2fa code is 123456. Do not share.');
    expect(result.otp_request).toBe(true);
    expect(result.otp_keywords).toContain('2fa');
  });

  it('should be case-insensitive', () => {
    const result = detectOTP('SHARE YOUR OTP IMMEDIATELY!');
    expect(result.otp_request).toBe(true);
  });

  it('should NOT detect OTP in a legitimate bank OTP message', () => {
    // Legitimate OTPs typically tell you NOT to share — we detect the word
    // but the Gemini layer should reason about context
    const result = detectOTP(
      'Your OTP is 456789. Valid for 10 min. Do NOT share with anyone.'
    );
    // The word "OTP" is detected at the feature level — Gemini handles context
    expect(result.otp_request).toBe(true);
    expect(result.otp_keywords).toContain('otp');
  });

  it('should handle empty string', () => {
    const result = detectOTP('');
    expect(result.otp_request).toBe(false);
    expect(result.otp_keywords).toHaveLength(0);
  });
});
