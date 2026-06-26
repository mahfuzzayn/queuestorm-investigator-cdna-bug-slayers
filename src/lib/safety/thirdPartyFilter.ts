// Blocks redirection to non-official channels
// Only official support channels may be referenced

const OFFICIAL_CHANNELS = [
  "official customer support",
  "official helpline",
  "official app",
  "official website",
  "authorized agent",
  "customer care center",
  "official support",
];

const THIRD_PARTY_REDIRECT_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  // Phone numbers after call/contact verbs
  {
    pattern:
      /(?:call|contact|reach|message)\s+(?:this|the|that|given|following)\s*(?:number|phone|mobile|hotline|helpline)\s*[:：]?\s*0\d{9,10}/gi,
    replacement: "please contact our official customer support channels",
  },
  // Direct phone numbers — replace the entire call+number segment
  {
    pattern: /\b(?:call|contact|reach)\s+0\d{9,10}\b/gi,
    replacement: "please contact our official customer support channels",
  },
  // Unofficial contact suggestions
  {
    pattern:
      /(?:try|visit|go to|check)\s+(?:this|a|some)\s+(?:agent|shop|store|outlet|branch|office)\s+(?:near|at|in|by|outside)/gi,
    replacement: "please contact an authorized agent or our official customer support channels",
  },
  // Alternative channel suggestions
  {
    pattern:
      /(?:you can also|alternatively|another option)\s+(?:call|contact|try|reach|visit)\s+(?!our|the official)/gi,
    replacement: "you can also reach us through our official customer support channels",
  },
  // Local agent redirect
  {
    pattern:
      /(?:contact|call|reach)\s+(?:my|the|this)\s+(?:local|nearby|nearest)\s+(?:agent|distributor|retailer|partner)/gi,
    replacement: "please contact our official customer support channels",
  },
  // Non-official social media
  {
    pattern:
      /(?:message|contact|reach)\s+(?:us\s+on|via|through)\s+(?:facebook|messenger|whatsapp|telegram|imo|viber)\s*(?!\s*official)/gi,
    replacement: "please reach us through our official customer support channels",
  },
];

export function validateNoThirdPartyRedirects(text: string): string {
  let safe = text;

  // First pass: replace known third-party redirect patterns
  for (const { pattern, replacement } of THIRD_PARTY_REDIRECT_PATTERNS) {
    safe = safe.replace(pattern, replacement);
  }

  // Second pass: catch any remaining phone numbers preceded by contact verbs
  safe = safe.replace(
    /\b(?:call|contact|reach|message)\s+(?:us\s+(?:at|on|via)\s+)?0\d{9,10}\b/gi,
    "contact our official customer support channels",
  );

  // Third pass: if there's still a contact/call/reach verb referencing
  // something that isn't an official channel, normalize it
  const hasOfficialRef = OFFICIAL_CHANNELS.some((ch) =>
    safe.toLowerCase().includes(ch.toLowerCase()),
  );

  if (!hasOfficialRef) {
    // Check if there's any standalone call/contact verb left
    safe = safe.replace(
      /\b(?:call|contact|reach|visit)\s+(?!our|the|official|customer|support|helpline|an|authorized)\s*0\d{9,10}\b/gi,
      "contact our official customer support channels",
    );

    // Final catch-all: any remaining "call/contact/reach" without official references
    const stillHasContact = /\b(?:call|contact|reach)\b/i.test(safe);
    if (stillHasContact && !OFFICIAL_CHANNELS.some((ch) => safe.toLowerCase().includes(ch.toLowerCase()))) {
      safe = safe.replace(
        /\b(?:call|contact|reach)\s+\S+/gi,
        "contact our official customer support channels",
      );
    }
  }

  return safe;
}
