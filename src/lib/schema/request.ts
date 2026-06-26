import { z } from "zod";
import { Channel, TransactionStatus, TransactionType } from "./enums";

export const TransactionSchema = z.object({
  transaction_id: z.string().min(1),
  type: TransactionType,
  amount: z.number().nonnegative(),
  currency: z.string().default("BDT"),
  status: TransactionStatus,
  timestamp: z.string(),
  sender: z.string().optional(),
  receiver: z.string().optional(),
  description: z.string().optional(),
  channel: Channel.optional(),
  counterparty: z.string().optional(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const TicketRequestSchema = z.object({
  ticket_id: z.string().min(1),
  language: z.string().optional(),
  complaint: z
    .string()
    .min(1, "Complaint text is required")
    .max(10000, "Complaint text too long"),
  transaction_history: z.array(TransactionSchema).default([]),
  user_type: z.string().optional(),
  campaign_context: z.string().optional(),
});
export type TicketRequest = z.infer<typeof TicketRequestSchema>;
