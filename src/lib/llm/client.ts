// OpenRouter call wrapper with timeout and AbortController

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "nvidia/llama-3.1-nemotron-70b-instruct:free";

interface LlmConfig {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

interface LlmResult {
  success: boolean;
  text?: string;
}

export async function callOpenRouter(
  prompt: string,
  config: LlmConfig = {},
): Promise<LlmResult> {
  const apiKey = config.apiKey ?? process.env.OPENROUTER_API_KEY;
  const model = config.model ?? DEFAULT_MODEL;
  const timeoutMs = config.timeoutMs ?? 4000;

  if (!apiKey) {
    return { success: false };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENROUTER_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://queuestorm-investigator.vercel.app",
        "X-Title": "QueueStorm Investigator",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a customer support refinement assistant. " +
              "Rewrite the provided agent summary and customer reply to be " +
              "more professional, empathetic, and clear. " +
              "Keep all factual information intact. " +
              "Do not add new information or change the nature of the response.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return { success: false };
    }

    return { success: true, text };
  } catch {
    return { success: false };
  } finally {
    clearTimeout(timeout);
  }
}
