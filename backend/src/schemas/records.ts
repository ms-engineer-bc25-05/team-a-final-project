import { z } from "zod";

/** 行動記録（レコード）のバリデーションスキーマ */
export const RecordSchema = z.object({
  userId: z.string().min(1, "ユーザーIDは必須です"),
  title: z.string().min(1, "タイトルは必須です"),
  reason: z.string().min(1, "提案理由は必須です"),
  category: z.string().min(1, "カテゴリーは必須です"),
  duration: z.number().min(1, "実行時間は1分以上である必要があります"),
  xp: z.number().min(0).default(0), // TODO: 仮のXP値(XPロジックPR後に修正)
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付形式が不正です（例: 2025-10-25）"),
  completedAt: z.string().datetime({ message: "ISO形式で入力してください" }),
});

export type RecordData = z.infer<typeof RecordSchema>;
