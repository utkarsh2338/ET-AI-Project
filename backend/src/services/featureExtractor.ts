import {
  URGENCY_KEYWORDS,
  AUTHORITY_ENTITIES,
  PAYMENT_KEYWORDS,
  OTP_KEYWORDS,
  THREAT_KEYWORDS,
  REWARD_KEYWORDS,
  CRYPTO_KEYWORDS,
  BANK_KEYWORDS,
  SHORTENED_URL_DOMAINS,
  IP_URL_REGEX,
  URL_REGEX,
  PHONE_REGEX,
  EMAIL_REGEX,
  CURRENCY_REGEX,
  EMOJI_REGEX,
  DIGIT_REGEX,
} from '../constants/keywords';

import {
  ExtractedFeatures,
  GrammarQuality,
  UrgencyAnalysis,
  AuthorityAnalysis,
  PaymentAnalysis,
  OTPAnalysis,
  LinkAnalysis,
  ThreatAnalysis,
  RewardAnalysis,
  GrammarAnalysis,
  MessageMetadata,
} from '../types';

function normalize(text: string): string {
  return text.toLowerCase();
}

function findMatches(normalizedText: string, keywords: readonly string[]): string[] {
  return keywords.filter((kw) => {
    // Use word boundary if the keyword is a single word; otherwise substring match
    const isSingleWord = !/\s/.test(kw);
    if (isSingleWord) {
      // \b does not work well for accented or non-ASCII — use simple boundary check
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'i').test(normalizedText);
    }
    return normalizedText.includes(kw);
  });
}

export function detectUrgency(text: string): UrgencyAnalysis {
  const normalized = normalize(text);
  const matched = findMatches(normalized, URGENCY_KEYWORDS);

  // Each match contributes 1 point; bonus +2 for high-value triggers
  const highValueTriggers = ['account suspended', 'account blocked', 'legal action', 'verify immediately'];
  let score = matched.length;
  for (const trigger of highValueTriggers) {
    if (matched.includes(trigger)) score += 1;
  }

  return {
    urgency_score: Math.min(10, score),
    matched_keywords: matched,
  };
}

export function detectAuthorityImpersonation(text: string): AuthorityAnalysis {
  const normalized = normalize(text);
  const matched = findMatches(normalized, AUTHORITY_ENTITIES);
  return {
    authority_impersonation: matched.length > 0,
    matched_entities: matched,
  };
}

export function detectPaymentRequest(text: string): PaymentAnalysis {
  const normalized = normalize(text);
  const matched = findMatches(normalized, PAYMENT_KEYWORDS);
  return {
    payment_request: matched.length > 0,
    payment_keywords: matched,
  };
}


export function detectOTP(text: string): OTPAnalysis {
  const normalized = normalize(text);
  const matched = findMatches(normalized, OTP_KEYWORDS);
  return {
    otp_request: matched.length > 0,
    otp_keywords: matched,
  };
}

export function analyzeLinks(text: string): LinkAnalysis {
  // Match full URLs (http/https/www)
  const ipMatches = text.match(new RegExp(IP_URL_REGEX.source, 'gi')) ?? [];
  const allUrlMatches = text.match(new RegExp(URL_REGEX.source, 'gi')) ?? [];

  const suspiciousDomains: string[] = [];

  // Check full URLs for known shortener domains
  for (const url of allUrlMatches) {
    try {
      const hostname = url
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split('/')[0]
        ?.split('?')[0]
        ?.toLowerCase() ?? '';

      if (SHORTENED_URL_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
        suspiciousDomains.push(hostname);
      }
    } catch {
      // Malformed URL — skip
    }
  }

  // Also catch bare shortener domains without protocol prefix
  // e.g. "bit.ly/verify-now" or "tinyurl.com/abc" written without http://
  // Build a regex that matches any known shortener domain followed by a slash
  const normalizedText = text.toLowerCase();
  for (const domain of SHORTENED_URL_DOMAINS) {
    // Match the bare domain with a path (e.g. bit.ly/something)
    // but only when NOT already preceded by // (to avoid double-counting)
    const barePattern = new RegExp(
      `(?<!\/\/)(?<![a-z0-9-])${domain.replace('.', '\\.')}(\/[^\\s]*)?`,
      'gi'
    );
    if (barePattern.test(normalizedText) && !allUrlMatches.some((u) => u.toLowerCase().includes(domain))) {
      suspiciousDomains.push(domain);
    }
  }

  const totalUrlCount = allUrlMatches.length +
    (suspiciousDomains.some((d) => !allUrlMatches.some((u) => u.toLowerCase().includes(d))) ? 1 : 0);

  return {
    url_count: totalUrlCount,
    contains_shortened_url: suspiciousDomains.length > 0,
    contains_ip_url: ipMatches.length > 0,
    suspicious_domains: [...new Set(suspiciousDomains)],
  };
}


export function detectThreats(text: string): ThreatAnalysis {
  const normalized = normalize(text);
  const matched = findMatches(normalized, THREAT_KEYWORDS);
  return {
    threat_score: Math.min(10, matched.length),
    threat_keywords: matched,
  };
}

export function detectRewardLottery(text: string): RewardAnalysis {
  const normalized = normalize(text);
  const matched = findMatches(normalized, REWARD_KEYWORDS);
  return {
    reward_or_lottery: matched.length > 0,
    reward_keywords: matched,
  };
}


export function analyzeGrammar(text: string): GrammarAnalysis {
  if (text.length === 0) {
    return {
      grammar_quality: 'good',
      uppercase_ratio: 0,
      exclamation_count: 0,
      punctuation_density: 0,
    };
  }

  const letters = text.split('').filter((c) => /[a-zA-Z]/.test(c));
  const upperCount = letters.filter((c) => c === c.toUpperCase()).length;
  const uppercase_ratio = letters.length > 0
    ? parseFloat((upperCount / letters.length).toFixed(4))
    : 0;

  const exclamation_count = (text.match(/!/g) ?? []).length;

  const punctuationChars = (text.match(/[!?,;:.…]{1}/g) ?? []).length;
  const punctuation_density = parseFloat((punctuationChars / text.length).toFixed(4));

  let grammar_quality: GrammarQuality = 'good';
  if (uppercase_ratio > 0.35 || exclamation_count > 4) {
    grammar_quality = 'poor';
  } else if (uppercase_ratio > 0.15 || exclamation_count > 1) {
    grammar_quality = 'medium';
  }

  return {
    grammar_quality,
    uppercase_ratio,
    exclamation_count,
    punctuation_density,
  };
}

export function extractMetadata(text: string): MessageMetadata {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const digits = text.match(new RegExp(DIGIT_REGEX.source, 'g')) ?? [];
  const emojis = text.match(new RegExp(EMOJI_REGEX.source, 'gu')) ?? [];
  const currencies = text.match(new RegExp(CURRENCY_REGEX.source, 'g')) ?? [];
  const phones = text.match(new RegExp(PHONE_REGEX.source, 'g')) ?? [];
  const emails = text.match(new RegExp(EMAIL_REGEX.source, 'g')) ?? [];

  return {
    message_length: text.length,
    word_count: words.length,
    digit_ratio: text.length > 0
      ? parseFloat((digits.length / text.length).toFixed(4))
      : 0,
    emoji_count: emojis.length,
    currency_symbol_count: currencies.length,
    phone_number_count: phones.length,
    email_count: emails.length,
  };
}

export function extractFeatures(text: string): ExtractedFeatures {
  const normalized = normalize(text);

  const urgency = detectUrgency(text);
  const authority = detectAuthorityImpersonation(text);
  const payment = detectPaymentRequest(text);
  const otp = detectOTP(text);
  const links = analyzeLinks(text);
  const threats = detectThreats(text);
  const reward = detectRewardLottery(text);
  const grammar = analyzeGrammar(text);
  const metadata = extractMetadata(text);

  // Simple boolean presence checks for crypto and bank keywords
  const crypto_keywords = findMatches(normalized, CRYPTO_KEYWORDS).length > 0;
  const bank_keywords = findMatches(normalized, BANK_KEYWORDS).length > 0;

  return {
    // Urgency
    urgency_score: urgency.urgency_score,
    matched_urgency_keywords: urgency.matched_keywords,

    // Authority
    authority_impersonation: authority.authority_impersonation,
    matched_authority_entities: authority.matched_entities,

    // Payment
    payment_request: payment.payment_request,
    payment_keywords: payment.payment_keywords,

    // OTP
    otp_request: otp.otp_request,
    otp_keywords: otp.otp_keywords,

    // Links
    url_count: links.url_count,
    contains_shortened_url: links.contains_shortened_url,
    contains_ip_url: links.contains_ip_url,
    suspicious_domains: links.suspicious_domains,

    // Threats
    threat_score: threats.threat_score,
    threat_keywords: threats.threat_keywords,

    // Rewards
    reward_or_lottery: reward.reward_or_lottery,
    reward_keywords: reward.reward_keywords,

    // Crypto / Bank
    crypto_keywords,
    bank_keywords,

    // Grammar
    grammar_quality: grammar.grammar_quality,
    uppercase_ratio: grammar.uppercase_ratio,
    exclamation_count: grammar.exclamation_count,
    punctuation_density: grammar.punctuation_density,

    // Metadata
    message_length: metadata.message_length,
    word_count: metadata.word_count,
    digit_ratio: metadata.digit_ratio,
    emoji_count: metadata.emoji_count,
    currency_symbol_count: metadata.currency_symbol_count,
    phone_number_count: metadata.phone_number_count,
    email_count: metadata.email_count,
  };
}
