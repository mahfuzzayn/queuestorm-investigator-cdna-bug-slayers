// Bans unauthorized promises — refund, unblock, approval language
// Replaces with spec-compliant safe phrasing

const UNATHORIZED_PROMISE_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  // Direct refund promises
  {
    pattern: /we\s+(?:will|shall|are going to)\s+(?:refund|return|give\s*back)\s+(?:your|the)\s+(?:money|amount|taka|payment)/i,
    replacement:
      "any eligible amount will be processed through official channels after review",
  },
  {
    pattern: /(?:your|the)\s+(?:refund|money|amount|payment)\s+(?:will\s+be|has been)\s+(?:processed|approved|initiated)/i,
    replacement:
      "your case will be reviewed and any eligible amount will be returned through official channels",
  },
  // Account unblock promises
  {
    pattern: /(?:your|the)\s+(?:account|wallet)\s+(?:will\s+be|has been)\s+(?:unblocked|unfrozen|activated|restored)/i,
    replacement:
      "your account status will be reviewed by the appropriate team",
  },
  // Approval language — various word orders
  {
    pattern: /\b(?:approved|granted|accepted)\s+(?:your|the)\s+(?:request|claim|refund|application)/i,
    replacement:
      "your request has been noted and will be reviewed accordingly",
  },
  {
    pattern: /(?:your|the)\s+(?:\w+\s+)?(?:request|claim|refund|application)\s+(?:has been|is|was)\s+(?:approved|granted|accepted)/i,
    replacement:
      "your request has been noted and will be reviewed accordingly",
  },
  {
    pattern: /(?:refund|claim)\s+(?:is|has been|was)\s+(?:approved|granted|accepted)/i,
    replacement:
      "any eligible amount will be processed through official channels after review",
  },
  // "Don't worry, we've handled it" type language
  {
    pattern: /(?:don't|do not)\s+(?:worry|concern)\s*(?:,|\.)\s*(?:we|it['']s)\s*(?:handled|fixed|resolved|sorted|taken care)/i,
    replacement:
      "we have noted your concern and it will be reviewed by the relevant team",
  },
  // Bangla promises
  {
    pattern: /(?:আমরা|আপনার)\s*(?:টাকা|অর্থ)\s*(?:ফেরত|ফেরত দেব|ফেরত দেওয়া হবে|দিয়ে দেওয়া হবে)/i,
    replacement:
      "আপনার অভিযোগ পর্যালোচনা করা হবে এবং অফিসিয়াল চ্যানেলের মাধ্যমে প্রয়োজনীয় ব্যবস্থা নেওয়া হবে",
  },
  {
    pattern: /(?:অ্যাকাউন্ট|একাউন্ট)\s*(?:আনব্লক|খোলা হবে|সচল করা হবে)/i,
    replacement: "আপনার অ্যাকাউন্টের অবস্থা পর্যালোচনার পর জানানো হবে",
  },
];

export function validateNoUnauthorizedPromises(text: string): string {
  let safe = text;

  for (const { pattern, replacement } of UNATHORIZED_PROMISE_PATTERNS) {
    safe = safe.replace(pattern, replacement);
  }

  return safe;
}
