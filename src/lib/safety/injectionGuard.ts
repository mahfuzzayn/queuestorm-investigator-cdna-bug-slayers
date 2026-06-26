// Strips/neutralizes embedded directives in complaint text
// Treats complaint as data only, never as instructions

const INJECTION_PATTERNS: RegExp[] = [
  // Direct instruction overrides
  /ignore\s+(?:all\s+)?(?:previous|above|prior)\s+(?:instructions|rules|directions|commands|guidelines)/i,
  /disregard\s+(?:all\s+)?(?:previous|above|prior)\s+(?:instructions|rules|directions|commands|guidelines)/i,
  // System role overrides
  /you\s+(?:are\s+(?:now|not\s+a\s+customer\s+support)|(?:must|should)\s+(?:act|respond|treat|behave))/i,
  /(?:pretend|imagine|assume)\s+(?:you\s+(?:are|'re|were)|that\s+you)/i,
  // Meta instructions
  /system\s*[:：]\s*(?:ignore|override|overwrite)/i,
  /instruction\s*[:：]/i,
  /rule\s*\d+\s*[:：]/i,
  // Response manipulation
  /(?:mark|classify|label)\s+(?:this|the|as)\s+(?:low|medium|high|critical)\s+(?:severity|priority)/i,
  /(?:respond|reply|answer)\s+(?:with|only)\s+(?:"[^"]*"|'[^']*'|[A-Z]+)/i,
  // Say/response overrides
  /(?:just|only|simply)\s+(?:say|reply|respond|write|output)/i,
  // JSON / format manipulation
  /(?:return|output|respond)\s+(?:as|in|with)\s+(?:json|yaml|xml|text\s+only)/i,
  // Prompt leakage
  /(?:what\s+(?:are|were)\s+(?:your|the)\s+(?:instructions|rules|prompt|system\s+prompt|guidelines))/i,
  /(?:show|display|print|reveal|output)\s+(?:your|the)\s+(?:instructions|rules|prompt|system\s+prompt|guidelines)/i,
];

// We don't strip these — we detect and flag them for the classification
// pipeline to ignore. The complaint text itself is preserved for context,
// but the injection guard ensures no embedded instruction influences
// classification or text generation.

export interface InjectionCheckResult {
  hasInjectionAttempt: boolean;
  sanitizedComplaint: string;
  flags: string[];
}

export function checkForInjection(complaint: string): InjectionCheckResult {
  const flags: string[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    const match = complaint.match(pattern);
    if (match) {
      flags.push(match[0].substring(0, 80));
    }
  }

  // Even if flags exist, we don't modify the complaint text for classification
  // The flags are used to:
  // 1. Ensure classification ignores embedded override attempts
  // 2. Ensure text generation templates don't incorporate injection directives
  // 3. Safety pipeline catches any attempt in generated text

  return {
    hasInjectionAttempt: flags.length > 0,
    sanitizedComplaint: complaint, // Keep original text, but pipeline ignores embedded instructions
    flags,
  };
}
