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

  // 4. Text generation (deterministic, rule-based)
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

  // 5. Safety pipeline runs on rule-generated text (always)
  const safeDraft = runSafetyPipeline(ruleText);

  // 6. Optional LLM refinement (disabled by default, re-safe'd after)
  const refined = await maybeRefineText({
    agentSummary: safeDraft.agentSummary,
    recommendedNextAction: safeDraft.recommendedNextAction,
    customerReply: safeDraft.customerReply,
  });

  // 7. Assemble response
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
  };

  return response;
}
