import { validateNoCredentialSolicitation } from "./credentialFilter";
import { validateNoUnauthorizedPromises } from "./promiseFilter";
import { validateNoThirdPartyRedirects } from "./thirdPartyFilter";
import { checkForInjection } from "./injectionGuard";

export interface SafetyResult {
  agentSummary: string;
  recommendedNextAction: string;
  customerReply: string;
  injectionFlags: string[];
}

/**
 * Runs the safety pipeline on all generated text outputs.
 * Called unconditionally on every response, for both rule-generated
 * and LLM-refined text.
 */
export function runSafetyPipeline(draft: {
  agentSummary: string;
  recommendedNextAction: string;
  customerReply: string;
}): SafetyResult {
  const injectionCheck = checkForInjection(draft.agentSummary + " " + draft.customerReply);

  return {
    agentSummary: validateNoUnauthorizedPromises(
      validateNoCredentialSolicitation(draft.agentSummary),
    ),
    recommendedNextAction: validateNoThirdPartyRedirects(
      validateNoUnauthorizedPromises(
        validateNoCredentialSolicitation(draft.recommendedNextAction),
      ),
    ),
    customerReply: validateNoThirdPartyRedirects(
      validateNoUnauthorizedPromises(
        validateNoCredentialSolicitation(draft.customerReply),
      ),
    ),
    injectionFlags: injectionCheck.flags,
  };
}
