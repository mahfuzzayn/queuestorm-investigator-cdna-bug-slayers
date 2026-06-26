import type { CaseType, EvidenceVerdict, Severity } from "@/lib/schema/enums";
import type { MatchResult } from "@/lib/evidence/matcher";

export interface SeverityResult {
  severity: Severity;
  humanReviewRequired: boolean;
}

export function determineSeverity(
  caseType: CaseType,
  evidenceVerdict: EvidenceVerdict,
  match: MatchResult,
  amountThreshold?: number,
): SeverityResult {
  const amount = amountThreshold ?? match.signals.amounts[0] ?? 0;

  // Phishing is always at least high
  if (caseType === "phishing_or_social_engineering") {
    return { severity: "high", humanReviewRequired: true };
  }

  // Determine base severity from amount
  let severity: Severity;
  if (amount > 50000) {
    severity = "critical";
  } else if (amount > 10000) {
    severity = "high";
  } else if (amount > 1000) {
    severity = "medium";
  } else {
    severity = "low";
  }

  // Escalate for insufficient_data on contested complaints
  if (evidenceVerdict === "insufficient_data" && amount > 0) {
    if (severity === "low") severity = "medium";
  }

  // Escalate for inconsistent evidence
  if (evidenceVerdict === "inconsistent") {
    if (severity === "low") severity = "medium";
  }

  // Determine human_review_required
  // (phishing is already handled by the early return above)
  const humanReviewRequired =
    evidenceVerdict !== "consistent" ||
    severity === "high" ||
    severity === "critical" ||
    amount > 10000;

  return { severity, humanReviewRequired };
}
