export const URGENCY_KEYWORDS: readonly string[] = [
  'urgent', 'urgently', 'immediately', 'asap', 'right now', 'right away',
  'within 24 hours', 'within 24hrs', 'within 48 hours', 'last chance',
  'limited time', 'act fast', 'act now', 'expires today', 'expiring soon',
  'deadline', 'account suspended', 'account blocked', 'access suspended',
  'verify immediately', 'respond immediately', 'do not delay', 'time sensitive',
  'time-sensitive', 'final notice', 'final warning', 'last opportunity',
  'hurry', 'quick', 'fast', 'now or never', 'today only', 'ending soon',
  'don\'t wait', 'do not wait', 'confirm now', 'must act', 'action required',
  'response required', 'immediate action', 'without delay',
];

export const AUTHORITY_ENTITIES: readonly string[] = [
  // Financial regulators
  'rbi', 'reserve bank of india', 'sebi', 'irda', 'nabard',
  // Government bodies
  'income tax', 'income tax department', 'gst', 'epfo', 'uidai', 'aadhar', 'aadhaar',
  'customs', 'customs department', 'government of india', 'ministry', 'police',
  'cbi', 'ed', 'enforcement directorate', 'electricity department', 'bescom',
  'tata power', 'bsnl', 'mtnl', 'municipal corporation', 'court', 'judiciary',
  // Banks
  'sbi', 'state bank', 'hdfc', 'icici', 'axis bank', 'kotak', 'pnb', 'punjab national',
  'bank of baroda', 'canara bank', 'union bank', 'yes bank', 'idfc', 'indusind',
  // E-commerce / wallets
  'amazon', 'flipkart', 'myntra', 'snapdeal', 'meesho',
  'paytm', 'phonepe', 'googlepay', 'google pay', 'bhim', 'upi',
  'mobikwik', 'freecharge', 'airtel money',
  // Tech companies
  'google', 'microsoft', 'apple', 'windows', 'facebook', 'meta', 'whatsapp',
  'instagram', 'youtube', 'netflix', 'amazon prime',
  // Courier / logistics
  'fedex', 'dhl', 'blue dart', 'dtdc', 'india post', 'speed post', 'ekart',
];


export const PAYMENT_KEYWORDS: readonly string[] = [
  'pay now', 'pay immediately', 'send money', 'transfer funds', 'transfer money',
  'complete payment', 'make payment', 'bank transfer', 'wire transfer',
  'upi', 'upi transfer', 'upi payment', 'neft', 'rtgs', 'imps',
  'wallet recharge', 'add money', 'top up', 'gift card', 'amazon gift card',
  'google play card', 'itunes card', 'voucher code',
  'bitcoin', 'btc', 'crypto', 'cryptocurrency', 'ethereum', 'eth', 'usdt',
  'tether', 'binance', 'coinbase', 'wallet address',
  'click to pay', 'pay via', 'send to', 'deposit', 'recharge',
];


export const OTP_KEYWORDS: readonly string[] = [
  'otp', 'one time password', 'one-time password', 'one-time-password',
  'verification code', 'auth code', 'authentication code',
  'pin', 'mpin', 'passcode', 'secret code', 'security code',
  'share code', 'share otp', 'share pin', 'share the code',
  'enter code', 'provide code', 'give the code', 'confirm code',
  '2fa', 'two factor', 'two-factor',
];

export const THREAT_KEYWORDS: readonly string[] = [
  'account blocked', 'account suspended', 'account frozen', 'account terminated',
  'bank account frozen', 'bank account blocked', 'bank account suspended',
  'legal action', 'legal proceedings', 'police complaint', 'fir', 'arrest',
  'warrant', 'court notice', 'summons',
  'kyc expired', 'kyc suspended', 'kyc blocked', 'kyc pending',
  'sim blocked', 'sim suspended', 'sim deactivated', 'sim card blocked',
  'service suspended', 'service blocked', 'service terminated',
  'penalty', 'fine', 'charged', 'prosecuted', 'imprisoned',
  'blacklisted', 'fraud reported', 'reported to authorities',
];

export const REWARD_KEYWORDS: readonly string[] = [
  'congratulations', 'congrats', 'you have won', 'you\'ve won', 'you won',
  'lottery', 'lucky winner', 'lucky draw', 'lucky number', 'you are selected',
  'prize', 'prize money', 'cash prize', 'cash reward', 'reward',
  'free iphone', 'free samsung', 'free laptop', 'free gift', 'free voucher',
  'cash reward', 'cash back', 'bonus', 'jackpot', 'mega prize',
  'winner', 'selected as winner', 'grand prize', 'rs 10 lakh', 'rs 1 crore',
  'claim now', 'claim your prize', 'claim reward', 'redeem now',
];


export const CRYPTO_KEYWORDS: readonly string[] = [
  'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency',
  'nft', 'token', 'blockchain', 'defi', 'usdt', 'tether', 'binance',
  'coinbase', 'wallet address', 'metamask', 'web3',
];

export const BANK_KEYWORDS: readonly string[] = [
  'bank account', 'savings account', 'current account', 'account number',
  'ifsc', 'branch', 'passbook', 'cheque', 'check', 'net banking',
  'mobile banking', 'internet banking', 'debit card', 'credit card',
  'atm', 'cvv', 'expiry date', 'card number', 'bank details',
  'bank statement', 'balance', 'transaction', 'upi', 'neft', 'rtgs',
];


export const SHORTENED_URL_DOMAINS: readonly string[] = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'buff.ly',
  'is.gd', 'short.link', 'rb.gy', 'cutt.ly', 'shorturl.at',
  'clck.ru', 'tiny.cc', 'bl.ink', 'rebrand.ly', 'bc.vc',
  'lnkd.in', 'dld.bz', 'soo.gd', 's.id', 'u.to', 'qr.ae',
  'v.gd', 'x.co', 'snip.ly', 'link3.cc', 'shrinkme.io',
];


export const IP_URL_REGEX =
  /https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/[^\s]*)?/gi;

/** Matches any URL (http/https/www) */
export const URL_REGEX =
  /(?:https?:\/\/|www\.)[^\s<>"{}|\\^`[\]]+/gi;

/** Matches phone numbers in Indian and international formats */
export const PHONE_REGEX =
  /(?:\+?91[\s-]?)?[6-9]\d{9}|(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g;

/** Matches email addresses */
export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/** Matches currency symbols */
export const CURRENCY_REGEX = /[₹$€£¥₩]/g;

/** Matches emojis using Unicode ranges */
export const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]/gu;

/** Matches digit characters */
export const DIGIT_REGEX = /\d/g;
