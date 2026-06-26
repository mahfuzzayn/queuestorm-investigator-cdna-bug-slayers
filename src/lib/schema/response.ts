import { z } from "zod";
import {
  CaseType,
  Department,
  EvidenceVerdict,
  Severity,
} from "./enums";

export const TicketResponseSchema = z.object({
  ticket_id: z.string(),
  case_type: CaseType,
  department: Department,
  severity: Severity,
  evidence_verdict: EvidenceVerdict,
  relevant_transaction_id: z.string().nullable(),
  human_review_required: z.boolean(),
  agent_summary: z.string(),
  recommended_next_action: z.string(),
  customer_reply: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  reason_codes: z.array(z.string()).optional(),
});
export type TicketResponse = z.infer<typeof TicketResponseSchema>;
