import OpenAI from "openai";

export const config = {
  apiKey: process.env.OPENAI_API_KEY || "",
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || "20000"),
  useMock: String(process.env.USE_MOCK || "false").toLowerCase() === "true",
} as const;

export function assertEnv() {
  if (!config.useMock && !config.apiKey) {
    throw new Error("Missing env: OPENAI_API_KEY");
  }
}

export function makeOpenAI() {
  if (config.useMock) return null;
  return new OpenAI({ apiKey: config.apiKey });
}