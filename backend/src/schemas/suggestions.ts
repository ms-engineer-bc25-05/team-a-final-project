// backend/src/schemas/suggestions.ts
import { z } from "zod";

export const SuggestionRequestSchema = z.object({
  topic: z.string(),
  count: z.number().min(1).max(10),
  userId: z.string().optional(),
  userProfile: z.object({
    typeMorning: z.string().optional(), // 朝方 or 夜型
    freeTime: z.string().optional(),    // 自由時間
    interests: z.array(z.string()).optional(), // 興味分野
    personality: z.array(z.string()).optional(), // 診断結果
  }).optional(),
  mood: z.string().optional(), // 当日の気分
});

export type SuggestionRequest = z.infer<typeof SuggestionRequestSchema>;

export type Suggestion = {
  id: string;
  title: string;
  reason: string;
  score: number; // 0–1
};