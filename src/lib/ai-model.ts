import { createOpenAI } from "@ai-sdk/openai";

export const DEFAULT_QWEN_BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1";
export const DEFAULT_QWEN_MODEL = "qwen3.7-flash";

/**
 * Create a Qwen model through DashScope's OpenAI-compatible API.
 * Qwen's structured-output capable models work with AI SDK's JSON Schema mode.
 */
export function getQwenModel() {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const qwen = createOpenAI({
    apiKey,
    baseURL: process.env.QWEN_BASE_URL || DEFAULT_QWEN_BASE_URL,
    compatibility: "compatible",
    name: "qwen",
  });

  return qwen.chat(process.env.QWEN_MODEL || DEFAULT_QWEN_MODEL, {
    structuredOutputs: true,
  });
}

export function requireQwenModel() {
  const model = getQwenModel();

  if (!model) {
    throw new Error(
      "Missing DASHSCOPE_API_KEY. Configure a DashScope API key to use Qwen.",
    );
  }

  return model;
}
