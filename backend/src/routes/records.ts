import { Router, Request, Response } from "express";
import { db } from "../config/firebase";
import { RecordSchema, RecordData } from "../schemas/records";
import { ZodError } from "zod";

const router = Router();

/** POST /api/records 
 * 今日の日付に基づいて「達成済みタスク」を一覧で返す
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("[API] POST /api/records");

    // ✅ date をサーバー側で自動補完
    const today = new Date().toISOString().split("T")[0]; // "2025-10-26"
    const parsed: RecordData = RecordSchema.parse({
      ...req.body,
      date: req.body.date || today,
    });

    await db.collection("records").add({
      ...parsed,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      ok: true,
      message: "行動記録を保存しました。",
    });
  } catch (error) {
    console.error("[POST /api/records] エラー:", error);

    // ✅ ZodError を安全に判定
    if (error instanceof ZodError) {
      res.status(400).json({
        ok: false,
        message: "リクエストの形式が正しくありません",
        issues: error.issues,
      });
      return;
    }

    res.status(500).json({
      ok: false,
      message: "サーバーエラーが発生しました。",
    });
  }
});

export default router;

