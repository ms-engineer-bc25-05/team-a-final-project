import { z } from "zod";

export const HeartbeatSchema = z.object({
  userId: z.string().min(1, "ユーザーIDは必須です"),
  sessionId: z.string().min(1, "セッションIDは必須です"),
  status: z.enum(["active", "paused", "completed"]),
  timestamp: z.string().min(1,"タイムスタンプ形式が不正です"),
});

export type Heartbeat = z.infer<typeof HeartbeatSchema>;
