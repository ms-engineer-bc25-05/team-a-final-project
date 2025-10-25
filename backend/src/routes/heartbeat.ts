import { Router, Request, Response } from "express";
import { db } from "../config/firebase";
import { HeartbeatSchema, Heartbeat } from "../schemas/heartbeat"
import { generateSessionId } from "../utils/session";


const router = Router();

/** 実行中の行動を定期的に更新する（進行中の記録する）
 * 追加: sessionId が指定されていない場合、自動で新しいセッションIDを発行
*/
router.post("/", async (req:Request, res: Response): Promise<void> => {
    try {
        console.log("[API] POST /api/heartbeat");

        // --- Zodでリクエストボディの構造と型を検証 ---
        const parsed:Heartbeat = HeartbeatSchema.parse(req.body);
        const  { userId, elapsedTime, status, sessionId: inputSessionId, timestamp } = parsed;

        // --- セッションIDを自動生成　---
        const sessionId = inputSessionId || generateSessionId();

        // --- Firestoreの heartbeats コレクションに記録 ---
        await db.collection("heartbeats").add({
            userId,
            sessionId,
            elapsedTime,
            status,
            timestamp: new Date(timestamp),
            createdAt: new Date(),
        });

        console.log("行動セッションの記録:", { userId, sessionId, status, elapsedTime });

        // --- レスポンスを返却 ---
        res.status(200).json({
            ok: true,
            message:"行動セッションを記録しました。",
            sessionId,
        });
    } catch (error: unknown) {
        console.error("[POST /api/heartbeat] Error:", error);

        // --- Zodエラー（バリデーション失敗）の場合
        if (typeof error ===   "object" && error && "issues" in error) {
            res.status(400).json({
                ok: false,
                message: `リクエストの形式が正しくありません: ${JSON.stringify(
                    (error as any).issues,
                    null,
                    2
                )}`,
            });
            return;
        } 

        // --- 予期せぬエラー　---
        res.status(500).json({
            ok: false,
            message: "サーバーエラーが発生しました。",
        });
    }
});

/** 指定ユーザーの最新セッション状態を取得 */
router.get("/:userId", async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } =req.params;

        // --- 最新の1件を取得 ---
        const snap = await db
        .collection("heartbeats")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

        if (snap.empty) {
            res.status(200).json({
                ok: true,
                heartbeat: null,
                message: "記録はまだありません。",
            });
            return;
        }

        const latest = snap.docs[0].data() as Heartbeat;
        res.status(200).json({
            ok: true,
            Heartbeat: latest,
            message: "最新の行動セッションを取得しました。",
        });
    } catch (error: unknown) {
        console.error("[GET /api/heartbeat/:userId] エラー:", error);
        
        res.status(500).json({
            ok: false,
            message: 
            error instanceof Error
               ? `行動セッションの取得中にエラーが発生しました: ${error.message}`
               : "予期しないエラーが発生しました。",
        });
    }
});

export default router;