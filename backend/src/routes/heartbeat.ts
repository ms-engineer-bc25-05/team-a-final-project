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

/** セッションを一時停止 */

router.patch("/:sessionId/pause", async (req: Request, res: Response):Promise<void> => {
    try {
        console.log("🩵 [DEBUG] req.params:", req.params);
        const { sessionId } = req.params;

        // デバックを追加
        if (!sessionId) {
            console.error("セッションIDが未定義です");
            res.status(400).json({
                ok:false,
                message: "セッションIDが指定されていません",
            });
            return;
        }

        // sessionId に該当する最新ドキュメントを取得
        const snapshot = await db
           .collection("heartbeats")
           .where("sessionId", "==", sessionId)
           .orderBy("timestamp","desc")
           .limit(1)
           .get();

         if (snapshot.empty) {
            res.status(404).json({
                ok: false,
                message: "指定されたセッションが見つかりません。",
            });
            return;
         } 
         
         const docRef = snapshot.docs[0].ref;

         await docRef.update({
            status: "paused",
            updatedAt: new Date(),
         });

         res.status(200).json({
            ok: true,
            message: "セッションを一時停止しました。",
            sessionId,
         });
    } catch (error) {
        console.error("[PATCH /api/heartbeat/:sessionId/pause] エラー詳細:", error);
        res.status(500).json({
            ok: false,
            message: `セッションの一時停止中にエラーが発生しました: ${String(
                (error as Error).message
            )}`,
        });
    }
});

/** セッションを再開 */
router.patch("/:sessionId/resume", async (req:Request, res: Response): Promise<void> => {
    try {
        const { sessionId } =req.params;

        const snapshot = await db
           .collection("heartbeats")
           .where("sessionId", "==", sessionId)
           .orderBy("timestamp","desc")
           .limit(1)
           .get();

        if (snapshot.empty) {
            res.status(404).json({
                ok:false,
                message: "指定されたセッションが見つかりません。",
            });
            return;
        }
        const docRef =snapshot.docs[0].ref;
        
        await docRef.update({
            status: "active",
            updatedAt: new Date(),
        });

        res.status(200).json({
            ok:true,
            message: "セッションを再開しました。",
            sessionId,
        });
    } catch (error) {
        console.error("[PATCH /api/heartbeat/:sessionId/resume] エラー:", error);
        res.status(500).json({
            ok:false,
            message: "セッションの再開中にエラーが発生しました。",
        });
    }
});

export default router;