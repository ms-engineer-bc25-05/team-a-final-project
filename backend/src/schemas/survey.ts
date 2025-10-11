import { z } from "zod";

export const goalSchema = z.object({
  name: z.string().min(1, "goal.name is required"),
  frequency: z.number().int().min(1).max(7),
});

export const surveySchema = z.object({
  userId: z.string().min(1, "userId is required"),
  course: z.enum(["ゆったりコース", "がっつりコース"]),
  freeTimeWeekday: z.string().min(1),
  freeTimeWeekend: z.string().min(1),
  goals: z.array(goalSchema).min(1),
});

export type SurveyInput = z.infer<typeof surveySchema>;