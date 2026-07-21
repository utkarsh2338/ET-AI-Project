import { detectAuthorityImpersonation } from '../services/featureExtractor';

describe('detectAuthorityImpersonation()', () => {
  it('should return false for a plain message', () => {
    const result = detectAuthorityImpersonation('Hi, how are you doing today?');
    expect(result.authority_impersonation).toBe(false);
    expect(result.matched_entities).toHaveLength(0);
  });

  it('should detect RBI impersonation', () => {
    const result = detectAuthorityImpersonation('RBI has flagged your account.');
    expect(result.authority_impersonation).toBe(true);
    expect(result.matched_entities).toContain('rbi');
  });

  it('should detect Income Tax Department', () => {
    const result = detectAuthorityImpersonation(
      'Income Tax Department: Your refund is pending.'
    );
    expect(result.authority_impersonation).toBe(true);
    expect(result.matched_entities.some((e) => e.includes('income tax'))).toBe(true);
  });

  it('should detect Amazon impersonation', () => {
    const result = detectAuthorityImpersonation(
      'Amazon customer: You have won a prize!'
    );
    expect(result.authority_impersonation).toBe(true);
    expect(result.matched_entities).toContain('amazon');
  });

  it('should detect bank names — HDFC', () => {
    const result = detectAuthorityImpersonation(
      'HDFC Bank: Your account has been blocked.'
    );
    expect(result.authority_impersonation).toBe(true);
    expect(result.matched_entities).toContain('hdfc');
  });

  it('should detect police impersonation', () => {
    const result = detectAuthorityImpersonation(
      'Police has registered a case against you.'
    );
    expect(result.authority_impersonation).toBe(true);
    expect(result.matched_entities).toContain('police');
  });

  it('should detect Microsoft impersonation', () => {
    const result = detectAuthorityImpersonation(
      'Microsoft Support: Your Windows license has expired.'
    );
    expect(result.authority_impersonation).toBe(true);
    expect(result.matched_entities).toContain('microsoft');
  });

  it('should detect UPI as an authority entity', () => {
    const result = detectAuthorityImpersonation('Your UPI account is blocked.');
    expect(result.authority_impersonation).toBe(true);
  });

  it('should detect PhonePe', () => {
    const result = detectAuthorityImpersonation(
      'PhonePe: Verify your KYC to continue using wallet.'
    );
    expect(result.authority_impersonation).toBe(true);
    expect(result.matched_entities).toContain('phonepe');
  });

  it('should be case-insensitive', () => {
    const result = detectAuthorityImpersonation('RBI ALERT: Your account is flagged.');
    expect(result.authority_impersonation).toBe(true);
  });

  it('should return multiple entities when multiple appear', () => {
    const result = detectAuthorityImpersonation(
      'RBI and SBI both noticed suspicious activity on your Amazon account.'
    );
    expect(result.matched_entities.length).toBeGreaterThan(1);
  });
});
