import type { TemplateFacts } from "./templates";
import {
  generateAgentSummary,
  generateRecommendedNextAction,
  generateCustomerReply,
} from "./templates";

export interface ComposedText {
  agentSummary: string;
  recommendedNextAction: string;
  customerReply: string;
}

export function composeText(facts: TemplateFacts): ComposedText {
  return {
    agentSummary: generateAgentSummary(facts),
    recommendedNextAction: generateRecommendedNextAction(facts),
    customerReply: generateCustomerReply(facts),
  };
}
