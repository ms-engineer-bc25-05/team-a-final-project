import { z } from "zod";

export const surveySchema = z.object({
  userId: z.string().min(1, "userId is required"),
  lifestyle: z.string().min(1, "lifestyle is required"),
  freeTimeWeekday: z.string().min(1, "freeTimeWeekday is required"),
  freeTimeWeekend: z.string().min(1, "freeTimeWeekend is required"),
  interests: z.array(z.string().min(1)).min(1, "interests must not be empty"),
  personalityQ1: z.string().min(1, "personalityQ1 is required"),
  personalityQ2: z.string().min(1, "personalityQ2 is required"),
});

export type SurveyInput = z.infer<typeof surveySchema>;