import { Router, Request, Response } from "express";
import { db } from "../config/firebase";
import { RecordSchema, RecordData } from "../schemas/records";

const router = Router();

/** GET /api/records/daily 
 * 今日の日付に基づいて「達成済みタスク」を一覧で返す
*/

router.post("/", async (req:Request, res:Response): Promise<void> => {
    try {
        console.log("[API] POST/api/records");

        // バリデーション
        const parsed: RecordData = RecordSchema.parse(req.body);

        // Firestoreに記録を保存
        await db.collection("records").add({
            ...parsed,
            createdAt: new Date(),
            updatedAt: new Date(),
        }),

        res.status(200).json({
            ok:true,
            message: "行動記録を保存しました",
        });
    } catch (error) {
        console.error("[POST /api/records] エラー:", error);

        if (error instanceof Error && "issues" in error) {
            res.status(400).json({
            ok:false,
            massage: `リクエストの形式が正しくありません: ${JSON.stringify(
                (error as any).issues,
                null,
                2
            )}`,
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