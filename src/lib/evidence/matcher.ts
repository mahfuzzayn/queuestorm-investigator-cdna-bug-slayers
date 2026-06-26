import type { Transaction, TicketRequest } from "@/lib/schema/request";

interface ExtractedSignals {
  amounts: number[];
  transactionTypes: string[];
  counterpartyHints: string[];
  hasTimeReference: boolean;
  isVague: boolean;
}

const AMOUNT_PATTERNS = [
  /(\d+[,]?\d*)\s*(?:taka|BDT|Tk|tk|৳|টাকা)/gi,
  /(?:taka|BDT|Tk|tk|৳|টাকা)\s*(\d+[,]?\d*)/gi,
  /(\d{3,6})\s*(?:taka|tks?)/gi,
  // Bengali numerals
  /([০-৯]+)\s*(?:টাকা|টকা)/gi,
];

const PHONE_PATTERN = /0\d{9,10}/g;
const MERCHANT_KEYWORDS = [
  "merchant",
  "shop",
  "store",
  "বিক্রেতা",
  "দোকান",
  "company",
  "business",
];

const TYPE_KEYWORDS: Record<string, RegExp[]> = {
  send_money: [
    /send/i,
    "sent",
    "transfer",
    "পাঠানো",
    "send money",
    /পাঠা[ইi]?/i,
    "tranfer",
  ].map((p) => (typeof p === "string" ? new RegExp(p, "i") : p)),
  cash_in: [
    /cash\s*in/i,
    /cash\s*in/i,
    "ডিপোজিট",
    "জমা",
    /agent\s*cash/i,
  ].map((p) => (typeof p === "string" ? new RegExp(p, "i") : p)),
  cash_out: [/cash\s*out/i, /উঠা/, /উত্তোলন/i, /withdraw/i].map(
    (p) => (typeof p === "string" ? new RegExp(p, "i") : p),
  ),
  payment: [/payment/i, "pay", "পেমেন্ট", "পরিশোধ", /bill\s*pay/i].map(
    (p) => (typeof p === "string" ? new RegExp(p, "i") : p),
  ),
  refund: [/refund/i, "ফেরত", "return", /cashback/i].map(
    (p) => (typeof p === "string" ? new RegExp(p, "i") : p),
  ),
};

const TIME_INDICATORS = [
  /yesterday/i,
  /today/i,
  /last\s+(night|week|month|day)/i,
  /ago/i,
  /গত\s+(কাল|সপ্তাহ|মাস)/i,
  /আজ/i,
  /গতকাল/i,
];

const VAGUE_PATTERNS = [
  /(?:don't|do not|can't|cannot|couldn't)\s+remember/i,
  /not\s+sure/i,
  /unsure/i,
  /vague/i,
  /confus/i,
  /maybe|perhaps|probably/i,
];

function extractSignals(complaint: string): ExtractedSignals {
  const amounts: number[] = [];
  for (const pattern of AMOUNT_PATTERNS) {
    const matches = complaint.matchAll(pattern);
    for (const m of matches) {
      const numStr = m[1]?.replace(/,/g, "");
      if (numStr) {
        // Handle Bengali numerals
        const bengaliMap: Record<string, string> = {
          "০": "0", "১": "1", "২": "2", "৩": "3",
          "৪": "4", "৫": "5", "৬": "6", "৭": "7",
          "৮": "8", "৯": "9",
        };
        const converted = numStr.replace(
          /[০-৯]/g,
          (c) => bengaliMap[c] ?? c,
        );
        const num = parseInt(converted, 10);
        if (!isNaN(num)) amounts.push(num);
      }
    }
  }

  // Also extract bare numbers that might be amounts
  const bareNumbers = complaint.match(/\b(\d{3,7})\b/g);
  if (bareNumbers) {
    for (const n of bareNumbers) {
      const num = parseInt(n, 10);
      if (num >= 10 && num <= 9999999) {
        amounts.push(num);
      }
    }
  }

  const transactionTypes: string[] = [];
  for (const [type, patterns] of Object.entries(TYPE_KEYWORDS)) {
    if (patterns.some((p) => p.test(complaint))) {
      transactionTypes.push(type);
    }
  }

  const phoneMatches = complaint.match(PHONE_PATTERN);
  const merchantMatches = MERCHANT_KEYWORDS.filter((k) =>
    new RegExp(k, "i").test(complaint),
  );
  const counterpartyHints = [...(phoneMatches ?? []), ...merchantMatches];

  const hasTimeReference = TIME_INDICATORS.some((p) => p.test(complaint));
  const isVague = VAGUE_PATTERNS.some((p) => p.test(complaint));

  return {
    amounts,
    transactionTypes,
    counterpartyHints,
    hasTimeReference,
    isVague,
  };
}

interface ScoredTransaction {
  transaction: Transaction;
  score: number;
  reasons: string[];
}

function scoreTransaction(
  tx: Transaction,
  signals: ExtractedSignals,
): ScoredTransaction {
  let score = 0;
  const reasons: string[] = [];

  // Amount match (highest weight)
  if (signals.amounts.length > 0) {
    for (const sigAmount of signals.amounts) {
      const diff = Math.abs(tx.amount - sigAmount);
      if (diff === 0) {
        score += 40;
        reasons.push("exact_amount_match");
        break;
      } else if (diff <= sigAmount * 0.05) {
        score += 30;
        reasons.push("close_amount_match");
        break;
      } else if (diff <= sigAmount * 0.2) {
        score += 15;
        reasons.push("partial_amount_match");
        break;
      }
    }
  }

  // Transaction type match
  if (
    signals.transactionTypes.length > 0 &&
    signals.transactionTypes.includes(tx.type)
  ) {
    score += 25;
    reasons.push("type_match");
  }

  // Counterparty match
  if (signals.counterpartyHints.length > 0) {
    const txText = [
      tx.sender ?? "",
      tx.receiver ?? "",
      tx.description ?? "",
    ].join(" ");
    for (const hint of signals.counterpartyHints) {
      if (txText.includes(hint)) {
        score += 20;
        reasons.push("counterparty_match");
        break;
      }
    }
  }

  // Recency bonus - prioritize transactions with recent timestamps
  if (signals.hasTimeReference && tx.timestamp) {
    const txTime = new Date(tx.timestamp).getTime();
    const now = Date.now();
    const daysSince = (now - txTime) / (1000 * 60 * 60 * 24);
    if (daysSince < 1) {
      score += 15;
      reasons.push("very_recent");
    } else if (daysSince < 7) {
      score += 10;
      reasons.push("recent");
    } else if (daysSince < 30) {
      score += 5;
      reasons.push("somewhat_recent");
    }
  }

  // Description keyword match
  if (tx.description && signals.amounts.length > 0) {
    const descLower = tx.description.toLowerCase();
    if (/\b(fail|error|problem|issue|wrong|mistake)\b/i.test(descLower)) {
      score += 5;
      reasons.push("error_description");
    }
  }

  return { transaction: tx, score, reasons };
}

export interface MatchResult {
  relevantTransactionId: string | null;
  matchedTransaction: Transaction | null;
  confidence: number;
  signals: ExtractedSignals;
}

export function findRelevantTransaction(
  request: TicketRequest,
): MatchResult {
  const signals = extractSignals(request.complaint);

  if (request.transaction_history.length === 0) {
    return {
      relevantTransactionId: null,
      matchedTransaction: null,
      confidence: 0,
      signals,
    };
  }

  const scored = request.transaction_history
    .map((tx) => scoreTransaction(tx, signals))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  // No signal extraction at all → insufficient data
  if (
    signals.amounts.length === 0 &&
    signals.transactionTypes.length === 0 &&
    !signals.hasTimeReference
  ) {
    return {
      relevantTransactionId: null,
      matchedTransaction: null,
      confidence: 0,
      signals,
    };
  }

  const CONFIDENCE_THRESHOLD = 30;

  if (best.score >= CONFIDENCE_THRESHOLD) {
    return {
      relevantTransactionId: best.transaction.transaction_id,
      matchedTransaction: best.transaction,
      confidence: best.score,
      signals,
    };
  }

  // Low confidence match
  return {
    relevantTransactionId: null,
    matchedTransaction: null,
    confidence: best.score,
    signals,
  };
}
