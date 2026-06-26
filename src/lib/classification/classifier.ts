import type { CaseType } from "@/lib/schema/enums";
import { KEYWORDS } from "./keywords";

// Classification priority order — check in this sequence, first match wins
const CLASSIFICATION_ORDER: CaseType[] = [
  "phishing_or_social_engineering",
  "duplicate_payment",
  "agent_cash_in_issue",
  "merchant_settlement_delay",
  "payment_failed",
  "wrong_transfer",
  "refund_request",
  "other",
];

function scoreComplaint(
  complaint: string,
  caseType: CaseType,
): number {
  const text = complaint.toLowerCase();
  const keywords = KEYWORDS[caseType === "other" ? "payment_failed" : caseType];
  if (!keywords) return 0;

  let score = 0;

  // Primary keywords score higher
  for (const kw of keywords.primary) {
    const kwLower = kw.toLowerCase();
    if (text.includes(kwLower)) {
      score += 3;
    }
  }

  // Secondary keywords score lower
  for (const kw of keywords.secondary) {
    const kwLower = kw.toLowerCase();
    if (text.includes(kwLower)) {
      score += 1;
    }
  }

  return score;
}

export function classifyCaseType(
  complaint: string,
): CaseType {
  const text = complaint.toLowerCase();
  const scores: Map<CaseType, number> = new Map();

  for (const caseType of CLASSIFICATION_ORDER) {
    if (caseType === "other") continue; // Skip fallback for now
    scores.set(caseType, scoreComplaint(text, caseType));
  }

  // Special check: phishing checked first as a hard requirement
  const PHISHING_PATTERNS = [
    /otp/i, /pin/i, /password/i, /mpin/i,
    /suspicious\s*(?:call|sms|phone)/i,
    /fake\s*(?:call|sms|phone|agent)/i,
    /scam/i,
    /asked\s*(?:for|me)\s*(?:my|the)\s*(?:otp|pin|password)/i,
    /(?:gave|shared|told)\s*(?:them|him|her)\s*(?:my|the)\s*(?:otp|pin|password)/i,
    /claimed\s*to\s*be/i,
    /posing\s*as/i,
    /ওটিপি/, /পিন/, /পাসওয়ার্ড/,
    /সন্দেহজনক\s*(?:কল|এসএমএস)/,
    /জাল\s*(?:কল|এসএমএস)/,
    /প্রতারণা/,
    /ঠকানো/,
  ];

  const isPhishing = PHISHING_PATTERNS.some((p) => p.test(text));
  if (isPhishing) {
    return "phishing_or_social_engineering";
  }

  // Check for "unauthorized transaction" pattern — money deducted but
  // user denies making the transaction. This overrides payment_failed.
  const DENIED_TRANSACTION_PATTERNS = [
    /(?:didn't|did not|never|no)\s*(?:make|do|authorize|initiate)\s*(?:any|this|the)\s*(?:transaction|payment|transfer)/i,
    /(?:didn't|did not|never|not)\s*(?:buy|purchase|pay|send)\s*(?:anything|anyone|any)/i,
    /(?:didn't|did not)\s*(?:do|perform)\s*(?:any|this)/i,
    /আমি\s*(?:কোনো|কিছু)\s*(?:করি\s*নি|করিনি|পাঠাই\s*নি|পাঠাইনি|কিনি\s*নি|কিনিনি)/i,
    /(?:কোনো|কিছু)\s*(?:লেনদেন|ট্রানজেকশন)\s*(?:করি\s*নি|করিনি)/i,
  ];
  const isDeniedTransaction = DENIED_TRANSACTION_PATTERNS.some((p) =>
    p.test(text),
  );

  if (isDeniedTransaction) {
    // If user denies making the transaction, check for phishing first (already done)
    // then fall through to other — this isn't a payment_failed scenario
    return "other";
  }

  // Go through priority order
  for (const caseType of CLASSIFICATION_ORDER) {
    if (caseType === "other") continue;
    const score = scores.get(caseType) ?? 0;
    if (score >= 2) {
      return caseType;
    }
  }

  return "other";
}
