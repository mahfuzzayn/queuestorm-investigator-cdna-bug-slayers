// Scans text for PIN/OTP/password/card-number solicitation patterns
// Replaces with safe templated equivalent if detected
// Excludes negated contexts (e.g. "do not share your OTP" — that's a warning, not a solicitation)

const NEGATION_PREFIX = "(?<!\\b(?:do not|don't|never|please do not|should not|shouldn't|must not|mustn't|cannot|can't|avoid|refrain from)\\s+)";
const SOLICITATION_VERBS = "(?:provide|share|send|confirm|enter|give|request|ask\\s+(?:for|you))";
const CREDENTIALS = "(?:otp|pin|password|mpin|nid|one[\\s-]?time\\s+(?:code|password|pin))";

const CREDENTIAL_SOLICITATION_PATTERNS = [
  // Direct requests for credentials
  new RegExp(NEGATION_PREFIX + "please\\s+" + SOLICITATION_VERBS + "\\s+(?:your|the)\\s+" + CREDENTIALS, "i"),
  new RegExp(NEGATION_PREFIX + SOLICITATION_VERBS + "\\s+(?:your|the)\\s+" + CREDENTIALS, "i"),
  new RegExp(NEGATION_PREFIX + "(?:need|require|want)\\s+(?:your|the|for)\\s+" + CREDENTIALS, "i"),
  // Indirect phrasing
  new RegExp(NEGATION_PREFIX + "please\\s+(?:confirm|verify)\\s+(?:your|the)\\s+" + CREDENTIALS, "i"),
  new RegExp(NEGATION_PREFIX + "confirm\\s+(?:your|the)\\s+(?:one[\\s-]?time\\s+)?code", "i"),
  new RegExp(NEGATION_PREFIX + "verify\\s+(?:your|the)\\s+(?:identity|account)\\s+(?:by|using|via)\\s+(?:otp|pin|code)", "i"),
  // Card/bank details
  new RegExp(NEGATION_PREFIX + "(?:provide|share|send|enter|give)\\s+(?:your|the)\\s+(?:card|bank|account)\\s+(?:number|details|info)", "i"),
  // Bangla variations — with negation prefix
  /(?:ওটিপি|পিন|পাসওয়ার্ড)\s*(?:দিন|দেওয়া|দিতে হবে|চাই|প্রয়োজন)/i,
  /(?:ওটিপি|পিন|পাসওয়ার্ড)\s*(?:নিশ্চিত|কনফার্ম|ভেরিফাই)/i,
  /(?:একবারের\s+)?কোড\s*(?:দিন|দেওয়া|দিতে হবে|নিশ্চিত)/i,
];

export function validateNoCredentialSolicitation(text: string): string {
  let safe = text;

  for (const pattern of CREDENTIAL_SOLICITATION_PATTERNS) {
    if (pattern.test(safe)) {
      safe = safe.replace(
        pattern,
        "please contact our official support channels for verification assistance",
      );
    }
  }

  return safe;
}
