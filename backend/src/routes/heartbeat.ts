import { Router, Request, Response } from "express";
import { db } from "../config/firebase";
import { HeartbeatSchema, Heartbeat } from "../schemas/heartbeat"


const router = Router();

/** 実行中の行動を定期的に更新する（進行中の記録する）*/
router.post("/", async (req:Request, res: Response) => {
    try {
        // ---Zodでリクエストボディの構造と型を検証 ---
        const parsed:Heartbeat = HeartbeatSchema.parse(req.body);
        const  { userId, sessionId, status, timestamp } = parsed;

        // --- Firestoreの heartbeats コレクションに記録 ---
        await db.collection("heartbeats").add({
            userId,
            sessionId,
            status,
            timestamp: new Date(timestamp),
            createdAt: new Date(),
        });

        console.log("行動セッションの記録:", parsed);
        res.status(200).json({
            ok: true,
            message:"行動セッションを記録しました。",
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("[POST /api/heartbeat] エラー:", error.message);
            res.status(400).json({
                ok: false,
                message: `リクエストの形式が正しくありません: ${error.message}`,
            });
        } else {
            res.status(500).json({
                ok: false,
                message:"予期しないエラーが発生しました。",
            });
        }
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
    } catch (error) {
        if (error instanceof Error) {
            console.error("[GET /api/heartbeat/:userId] エラー:", error.message);
            res.status(500).json({
                ok: false,
                message: `行動セッションの取得中にエラーが発生しました: ${error.message} `,
            });
        } else {
            res.status(500).json({
                ok: false,
                message: "予期しないエラーが発生しました。",
            });
        }
    }
});

export default router;