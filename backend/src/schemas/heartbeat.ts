import { z } from "zod";

export const HeartbeatSchema = z.object({
  userId: z.string().min(1, "ユーザーIDは必須です"),
  sessionId: z.string().optional(), // 必須から optional に変更
  elapsedTime: z.number().min(0, "経過時間は0以上である必要があります。"), // 経過時間を追加
  status: z.enum(["running", "active", "paused", "completed"]), // runningを追加
  timestamp: z
    .string()
    .min(1,"タイムスタンプ形式が不正です")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "タイムスタンプ形式が不正です"
    ),
    title: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
});

export type Heartbeat = z.infer<typeof HeartbeatSchema>;
