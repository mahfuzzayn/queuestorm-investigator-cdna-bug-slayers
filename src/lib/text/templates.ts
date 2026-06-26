import type { CaseType, Department, EvidenceVerdict, Severity } from "@/lib/schema/enums";

export interface TemplateFacts {
  ticketId: string;
  caseType: CaseType;
  department: Department;
  severity: Severity;
  evidenceVerdict: EvidenceVerdict;
  relevantTransactionId: string | null;
  humanReviewRequired: boolean;
  complaint: string;
}

export function generateAgentSummary(facts: TemplateFacts): string {
  const caseLabels: Record<CaseType, string> = {
    phishing_or_social_engineering: "possible phishing / social engineering attempt",
    duplicate_payment: "possible duplicate payment",
    agent_cash_in_issue: "agent cash-in issue",
    merchant_settlement_delay: "merchant settlement delay",
    payment_failed: "payment failure",
    wrong_transfer: "wrong transfer / incorrect recipient",
    refund_request: "refund request",
    other: "unclassified inquiry",
  };

  const verdictDesc: Record<EvidenceVerdict, string> = {
    consistent: "matches available transaction records",
    inconsistent: "contradicts available transaction records",
    insufficient_data: "cannot be fully verified due to insufficient transaction data",
  };

  let summary = `Ticket ${facts.ticketId}: ${caseLabels[facts.caseType]}. `;
  summary += `The complaint ${verdictDesc[facts.evidenceVerdict]}. `;

  if (facts.relevantTransactionId) {
    summary += `Relevant transaction: ${facts.relevantTransactionId}. `;
  }

  summary += `Severity assessed as ${facts.severity}. `;
  summary += `Routed to ${facts.department}. `;

  if (facts.humanReviewRequired) {
    summary += "Human review has been flagged as required.";
  } else {
    summary += "No human review required based on current assessment.";
  }

  return summary;
}

export function generateRecommendedNextAction(facts: TemplateFacts): string {
  const actions: Record<CaseType, string> = {
    phishing_or_social_engineering:
      "Immediately escalate to the fraud and security team. " +
      "Advise the customer to change their PIN and MPIN immediately. " +
      "Recommend blocking the affected account temporarily. " +
      "Do not request any OTP, PIN, or password from the customer.",
    duplicate_payment:
      "Initiate a duplicate payment investigation. " +
      "Request transaction IDs for both charges from the customer. " +
      "Coordinate with the payments team to verify and reverse the duplicate transaction if confirmed.",
    agent_cash_in_issue:
      "Contact the agent involved to verify the cash-in transaction. " +
      "Cross-reference agent transaction logs with customer records. " +
      "If agent is unresponsive, escalate to agent operations for follow-up.",
    merchant_settlement_delay:
      "Verify the merchant's settlement schedule and pending payout records. " +
      "Check for any holds or flags on the merchant account. " +
      "Coordinate with merchant services to expedite settlement if eligible.",
    payment_failed:
      "Investigate the failed transaction through payment gateway logs. " +
      "Verify whether the amount was deducted from the customer's account. " +
      "If deducted but not completed, initiate a reversal through standard procedures.",
    wrong_transfer:
      "Attempt to identify the recipient using transaction records. " +
      "Advise the customer to contact the recipient directly if known. " +
      "If the recipient is within the same network, coordinate with the payments team for recovery options.",
    refund_request:
      "Review the original transaction to determine refund eligibility. " +
      "Check the merchant's refund policy if applicable. " +
      "Process the refund through official channels if eligible, or explain the reason if not.",
    other:
      "Review the customer's complaint details for additional context. " +
      "Route to general customer support for further handling.",
  };

  return actions[facts.caseType];
}

export function generateCustomerReply(facts: TemplateFacts): string {
  const greeting = "Dear Customer,";
  const closing =
    "If you have any further questions, please contact our official customer support channels. " +
    "Thank you for your patience.";

  let body: string;

  switch (facts.caseType) {
    case "phishing_or_social_engineering":
      body =
        "We have received your report regarding a suspicious communication. " +
        "Please do not share your OTP, PIN, or password with anyone. " +
        "Our fraud and security team will review your case and take appropriate action. " +
        "In the meantime, please change your MPIN through the official app.";
      break;

    case "duplicate_payment":
      body =
        "We understand that you may have been charged multiple times for the same transaction. " +
        "Our payments team will investigate this matter and verify the charges. " +
        "Any duplicate amount will be reversed through official channels if confirmed.";
      break;

    case "agent_cash_in_issue":
      body =
        "We have noted your complaint regarding a cash-in transaction at an agent point. " +
        "Our agent operations team will investigate and verify the transaction records. " +
        "We will follow up with you once the investigation is complete.";
      break;

    case "merchant_settlement_delay":
      body =
        "We understand you are concerned about a delay in your merchant settlement. " +
        "Our merchant services team will review your payout schedule and account status. " +
        "We will work to resolve this matter as quickly as possible.";
      break;

    case "payment_failed":
      body =
        "We are sorry to hear that your transaction did not go through successfully. " +
        "Our payments team will investigate the issue. " +
        "If the amount was deducted, it will be returned to your account through official channels.";
      break;

    case "wrong_transfer":
      body =
        "We understand that your transaction may have been sent to the wrong recipient. " +
        "Please note that transactions cannot be reversed unilaterally. " +
        "Our payments team will review available options and assist you through official procedures.";
      break;

    case "refund_request":
      body =
        "We have received your request for a refund. " +
        "Our refunds team will review the transaction details and determine eligibility. " +
        "Any eligible amount will be returned through official channels.";
      break;

    default:
      body =
        "We have received your inquiry and will review the details you provided. " +
        "Our customer support team will get back to you through official channels.";
      break;
  }

  if (facts.humanReviewRequired) {
    body +=
      " Your case has been flagged for human review, and a dedicated agent will follow up with you.";
  }

  return `${greeting}\n\n${body}\n\n${closing}`;
}
