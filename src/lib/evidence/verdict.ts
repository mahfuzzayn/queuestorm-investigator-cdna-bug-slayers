import type { EvidenceVerdict } from "@/lib/schema/enums";
import type { MatchResult } from "./matcher";
import type { TicketRequest } from "@/lib/schema/request";

export interface VerdictResult {
  verdict: EvidenceVerdict;
  relevantTransactionId: string | null;
}

export function determineVerdict(
  request: TicketRequest,
  match: MatchResult,
): VerdictResult {
  // Empty or sparse history → insufficient_data
  if (request.transaction_history.length === 0) {
    return {
      verdict: "insufficient_data",
      relevantTransactionId: null,
    };
  }

  // No match found
  if (!match.matchedTransaction || !match.relevantTransactionId) {
    // If complaint has specific signals but no match → inconsistent
    if (
      match.signals.amounts.length > 0 ||
      match.signals.transactionTypes.length > 0 ||
      match.signals.counterpartyHints.length > 0
    ) {
      return {
        verdict: "inconsistent",
        relevantTransactionId: null,
      };
    }

    // Complaint too vague to extract signals → insufficient_data
    return {
      verdict: "insufficient_data",
      relevantTransactionId: null,
    };
  }

  const tx = match.matchedTransaction;
  const complaint = request.complaint.toLowerCase();

  // Check if complaint narrative is about money not arriving / failed
  const failureNarratives = [
    /(?:didn't|did not|hasn't|has not|haven't|have not)\s+(?:arrive|receive|get|reach)/i,
    /(?:never|not yet)\s+(?:arrived|received|got|reached)/i,
    /(?:money|payment|amount|taka)\s+(?:not|didn't|doesn't)\s+(?:arrive|receive|reach|go through)/i,
    /fail/i,
    /(?:unsuccessful|unsuccessfull)/i,
    /(?:didn't|did not)\s+(?:go through|work|process)/i,
    /(?:stuck|pending|held|blocked)/i,
    /ভালো না/i,
    /পাইনি/i,
    /আসেনি/i,
    /হয়নি/i,
  ];

  const isFailureComplaint = failureNarratives.some((p) => p.test(complaint));

  // Complaint says money didn't arrive but transaction is completed → inconsistent
  if (isFailureComplaint && tx.status === "completed") {
    return {
      verdict: "inconsistent",
      relevantTransactionId: match.relevantTransactionId,
    };
  }

  // Complaint about failed transaction and transaction is actually failed → consistent
  if (isFailureComplaint && tx.status === "failed") {
    return {
      verdict: "consistent",
      relevantTransactionId: match.relevantTransactionId,
    };
  }

  // Complaint about wrong amount and amount matches → inconsistent
  const wrongAmountPatterns = [
    /(?:wrong|incorrect|different|more|less)\s+(?:amount|money|taka)/i,
    /ভুল\s*(?:পরিমাণ|টাকা|amount)/i,
    /কম\s*(?:দেওয়া|পাওয়া)/i,
    /বেশি\s*(?:কাটা|নেওয়া)/i,
  ];
  const isWrongAmountComplaint = wrongAmountPatterns.some((p) =>
    p.test(complaint),
  );

  if (isWrongAmountComplaint && match.signals.amounts.length > 0) {
    const signalAmount = match.signals.amounts[0];
    if (tx.amount === signalAmount) {
      return {
        verdict: "inconsistent",
        relevantTransactionId: match.relevantTransactionId,
      };
    }
  }

  // Complaint is about refund request
  const refundPatterns = [
    /refund/i,
    /ফেরত/i,
    /money\s*back/i,
    /টাকা\s*ফেরত/i,
  ];
  const isRefundComplaint = refundPatterns.some((p) => p.test(complaint));

  if (isRefundComplaint && tx.status === "completed") {
    return {
      verdict: "consistent",
      relevantTransactionId: match.relevantTransactionId,
    };
  }

  // General match - if we found a relevant transaction and complaint
  // doesn't clearly contradict it → consistent
  if (match.confidence >= 30) {
    return {
      verdict: "consistent",
      relevantTransactionId: match.relevantTransactionId,
    };
  }

  // Low confidence → insufficient_data
  return {
    verdict: "insufficient_data",
    relevantTransactionId: null,
  };
}
