import type { CaseType, Department } from "@/lib/schema/enums";

const DEPARTMENT_MAP: Record<CaseType, Department> = {
  phishing_or_social_engineering: "fraud_and_security",
  duplicate_payment: "payments_and_transactions",
  agent_cash_in_issue: "agent_operations",
  merchant_settlement_delay: "merchant_services",
  payment_failed: "payments_and_transactions",
  wrong_transfer: "payments_and_transactions",
  refund_request: "refunds_and_adjustments",
  other: "customer_support",
};

export function mapCaseTypeToDepartment(caseType: CaseType): Department {
  return DEPARTMENT_MAP[caseType];
}
