// backend/src/schemas/suggestions.ts
import { z } from "zod";

export const SuggestionRequestSchema = z.object({
  topic: z.string().min(1, "topic は必須です"),
  count: z.number().int().min(1).max(10).default(3),
});

export type SuggestionRequest = z.infer<typeof SuggestionRequestSchema>;

export type Suggestion = {
  id: string;
  title: string;
  reason: string;
  score: number; // 0–1
};