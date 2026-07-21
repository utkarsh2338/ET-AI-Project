import { detectUrgency } from '../services/featureExtractor';

describe('detectUrgency()', () => {
  it('should return urgency_score 0 for a neutral message', () => {
    const result = detectUrgency('Hello, how are you today?');
    expect(result.urgency_score).toBe(0);
    expect(result.matched_keywords).toHaveLength(0);
  });

  it('should detect "urgent" keyword', () => {
    const result = detectUrgency('This is an urgent matter.');
    expect(result.urgency_score).toBeGreaterThan(0);
    expect(result.matched_keywords).toContain('urgent');
  });

  it('should detect "immediately"', () => {
    const result = detectUrgency('Verify your account immediately.');
    expect(result.matched_keywords).toContain('immediately');
  });

  it('should detect "within 24 hours"', () => {
    const result = detectUrgency('Respond within 24 hours or lose access.');
    expect(result.matched_keywords).toContain('within 24 hours');
  });

  it('should detect "account suspended" and apply bonus', () => {
    const result = detectUrgency('Your account suspended. Act now!');
    expect(result.matched_keywords).toContain('account suspended');
    // Bonus +1 for high-value trigger
    expect(result.urgency_score).toBeGreaterThan(1);
  });

  it('should cap urgency_score at 10', () => {
    const msg = 'URGENT! Immediately! Act fast! Act now! Deadline! ' +
      'Last chance! Limited time! Account suspended! Verify immediately! ' +
      'Expires today! Within 24 hours! Final warning!';
    const result = detectUrgency(msg);
    expect(result.urgency_score).toBe(10);
  });

  it('should be case-insensitive', () => {
    const result = detectUrgency('URGENT: Do this NOW or face IMMEDIATE consequences.');
    expect(result.urgency_score).toBeGreaterThan(0);
  });

  it('should detect "last chance"', () => {
    const result = detectUrgency('Last chance to verify your account!');
    expect(result.matched_keywords).toContain('last chance');
  });

  it('should detect multiple urgency keywords', () => {
    const result = detectUrgency('Urgent! Verify immediately. This is your last chance!');
    expect(result.matched_keywords.length).toBeGreaterThan(1);
    expect(result.urgency_score).toBeGreaterThan(2);
  });

  it('should handle empty string', () => {
    const result = detectUrgency('');
    expect(result.urgency_score).toBe(0);
    expect(result.matched_keywords).toHaveLength(0);
  });
});
