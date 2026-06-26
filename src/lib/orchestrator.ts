import type { TicketRequest } from "@/lib/schema/request";
import type { TicketResponse } from "@/lib/schema/response";
import { findRelevantTransaction } from "@/lib/evidence/matcher";
import { determineVerdict } from "@/lib/evidence/verdict";
import { classifyCaseType } from "@/lib/classification/classifier";
import { determineSeverity } from "@/lib/classification/severity";
import { mapCaseTypeToDepartment } from "@/lib/routing/department";
import { composeText } from "@/lib/text/compose";
import { runSafetyPipeline } from "@/lib/safety/index";
import { maybeRefineText } from "@/lib/llm/refineText";

export async function orchestrator(
  request: TicketRequest,
): Promise<TicketResponse> {
  // 1. Evidence reasoning
  const match = findRelevantTransaction(request);
  const { verdict, relevantTransactionId } = determineVerdict(request, match);

  // 2. Classification (uses sanitized complaint — injection guard runs inside safety)
  const caseType = classifyCaseType(request.complaint);

  // 3. Severity and routing
  const department = mapCaseTypeToDepartment(caseType);
  const { severity, humanReviewRequired } = determineSeverity(
    caseType,
    verdict,
    match,
  );

  // 4. Collect reason codes from evidence + classification
  const reasonCodes: string[] = [];

  // Evidence-level codes
  if (match.confidence >= 40) reasonCodes.push("EXACT_AMOUNT_MATCH");
  else if (match.confidence >= 30) reasonCodes.push("CLOSE_AMOUNT_MATCH");
  else if (match.confidence >= 15) reasonCodes.push("PARTIAL_AMOUNT_MATCH");

  if (match.signals.transactionTypes.length > 0) {
    reasonCodes.push("TYPE_MATCH");
  }
  if (match.signals.counterpartyHints.length > 0) {
    reasonCodes.push("COUNTERPARTY_MATCH");
  }
  if (match.signals.hasTimeReference) {
    reasonCodes.push("TIME_REFERENCE_DETECTED");
  }
  if (match.signals.isVague) {
    reasonCodes.push("VAGUE_COMPLAINT");
  }

  // Classification-level codes
  if (caseType === "phishing_or_social_engineering") {
    reasonCodes.push("PHISHING_KEYWORDS_DETECTED");
  }
  if (
    caseType === "duplicate_payment" &&
    match.signals.amounts.length > 1
  ) {
    reasonCodes.push("DUPLICATE_AMOUNT_DETECTED");
  }

  // Verdict-level codes
  if (verdict === "inconsistent") {
    reasonCodes.push("EVIDENCE_INCONSISTENT");
  } else if (verdict === "insufficient_data") {
    reasonCodes.push("INSUFFICIENT_DATA");
  } else if (verdict === "consistent") {
    reasonCodes.push("EVIDENCE_CONSISTENT");
  }

  // Deduplicate while preserving order
  const uniqueCodes = [...new Set(reasonCodes)];

  // Normalize confidence to 0-1 range (raw score is 0-100+, cap at 100)
  const rawConfidence = Math.min(match.confidence, 100);
  const normalizedConfidence = Math.round((rawConfidence / 100) * 100) / 100;

  // 5. Text generation (deterministic, rule-based)
  const ruleText = composeText({
    ticketId: request.ticket_id,
    caseType,
    department,
    severity,
    evidenceVerdict: verdict,
    relevantTransactionId,
    humanReviewRequired,
    complaint: request.complaint,
  });

  // 6. Safety pipeline runs on rule-generated text (always)
  const safeDraft = runSafetyPipeline(ruleText);

  // 7. Optional LLM refinement (disabled by default, re-safe'd after)
  const refined = await maybeRefineText({
    agentSummary: safeDraft.agentSummary,
    recommendedNextAction: safeDraft.recommendedNextAction,
    customerReply: safeDraft.customerReply,
  });

  // 8. Assemble response
  const response: TicketResponse = {
    ticket_id: request.ticket_id,
    case_type: caseType,
    department,
    severity,
    evidence_verdict: verdict,
    relevant_transaction_id: relevantTransactionId,
    human_review_required: humanReviewRequired,
    agent_summary: refined.agentSummary,
    recommended_next_action: refined.recommendedNextAction,
    customer_reply: refined.customerReply,
    confidence: normalizedConfidence,
    reason_codes: uniqueCodes,
  };

  return response;
}
