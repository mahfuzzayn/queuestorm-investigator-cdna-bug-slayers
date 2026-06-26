import { callOpenRouter } from "./client";
import { runSafetyPipeline } from "@/lib/safety/index";
import type { ComposedText } from "@/lib/text/compose";

const ENABLE_LLM = process.env.ENABLE_LLM_REFINEMENT === "true";

/**
 * Optionally refines agent_summary and customer_reply using an LLM.
 * Falls back to the rule-generated text on any failure.
 * LLM output is re-passed through the safety pipeline before being returned.
 */
export async function maybeRefineText(
  ruleText: ComposedText,
): Promise<ComposedText> {
  if (!ENABLE_LLM) {
    return ruleText;
  }

  const prompt = `Refine the following customer support response for clarity and professionalism:

AGENT SUMMARY:
${ruleText.agentSummary}

CUSTOMER REPLY:
${ruleText.customerReply}

Please provide the refined versions maintaining all factual accuracy.`;

  const result = await callOpenRouter(prompt);

  if (!result.success || !result.text) {
    return ruleText;
  }

  // Parse LLM output - it should contain both agent summary and customer reply
  const lines = result.text.split("\n");
  let llmSummary = ruleText.agentSummary;
  let llmReply = ruleText.customerReply;

  // Simple parsing: look for sections in LLM response
  const summaryMatch = result.text.match(
    /AGENT SUMMARY[:\s]*([\s\S]*?)(?=CUSTOMER REPLY|$)/i,
  );
  const replyMatch = result.text.match(/CUSTOMER REPLY[:\s]*([\s\S]*)$/i);

  if (summaryMatch?.[1]?.trim()) {
    llmSummary = summaryMatch[1].trim();
  }
  if (replyMatch?.[1]?.trim()) {
    llmReply = replyMatch[1].trim();
  }

  // Re-run safety pipeline on LLM output
  const safe = runSafetyPipeline({
    agentSummary: llmSummary,
    recommendedNextAction: ruleText.recommendedNextAction,
    customerReply: llmReply,
  });

  return {
    agentSummary: safe.agentSummary,
    recommendedNextAction: safe.recommendedNextAction,
    customerReply: safe.customerReply,
  };
}
