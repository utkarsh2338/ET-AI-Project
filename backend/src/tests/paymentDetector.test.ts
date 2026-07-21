import { detectPaymentRequest } from '../services/featureExtractor';

describe('detectPaymentRequest()', () => {
  it('should return false for a message with no payment reference', () => {
    const result = detectPaymentRequest('Good morning! How are you?');
    expect(result.payment_request).toBe(false);
    expect(result.payment_keywords).toHaveLength(0);
  });

  it('should detect "pay now"', () => {
    const result = detectPaymentRequest('Pay now to restore your account access.');
    expect(result.payment_request).toBe(true);
    expect(result.payment_keywords).toContain('pay now');
  });

  it('should detect "send money"', () => {
    const result = detectPaymentRequest('Please send money to this UPI ID.');
    expect(result.payment_request).toBe(true);
    expect(result.payment_keywords).toContain('send money');
  });

  it('should detect UPI reference', () => {
    const result = detectPaymentRequest('Transfer funds via UPI immediately.');
    expect(result.payment_request).toBe(true);
    expect(result.payment_keywords).toContain('upi');
  });

  it('should detect gift card requests', () => {
    const result = detectPaymentRequest(
      'Buy an Amazon gift card worth Rs.1000 and send the code.'
    );
    expect(result.payment_request).toBe(true);
    expect(result.payment_keywords.some((k) => k.includes('gift card'))).toBe(true);
  });

  it('should detect Bitcoin/crypto', () => {
    const result = detectPaymentRequest('Send 0.01 Bitcoin to this wallet address now.');
    expect(result.payment_request).toBe(true);
    expect(result.payment_keywords).toContain('bitcoin');
  });

  it('should detect "bank transfer"', () => {
    const result = detectPaymentRequest('Do a bank transfer of Rs.5000 immediately.');
    expect(result.payment_request).toBe(true);
    expect(result.payment_keywords).toContain('bank transfer');
  });

  it('should detect "wallet recharge"', () => {
    const result = detectPaymentRequest('Wallet recharge required to unblock service.');
    expect(result.payment_request).toBe(true);
    expect(result.payment_keywords).toContain('wallet recharge');
  });

  it('should be case-insensitive', () => {
    const result = detectPaymentRequest('PAY NOW to avoid service suspension!');
    expect(result.payment_request).toBe(true);
  });

  it('should return all matched keywords', () => {
    const result = detectPaymentRequest(
      'Pay now via UPI or send money via bank transfer.'
    );
    expect(result.payment_keywords.length).toBeGreaterThan(1);
  });
});
