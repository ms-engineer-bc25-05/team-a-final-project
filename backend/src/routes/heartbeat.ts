import { Router, Request, Response } from "express";
import { db } from "../config/firebase";
import { HeartbeatSchema, Heartbeat } from "../schemas/heartbeat"
import { generateSessionId } from "../utils/session";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const router = Router();

/** 実行中の行動を定期的に更新する（進行中の記録する）
 * 追加: sessionId が指定されていない場合、自動で新しいセッションIDを発行
*/
router.post("/", async (req:Request, res: Response): Promise<void> => {
    try {
        console.log("[API] POST /api/heartbeat");

        // --- Zodでリクエストボディの構造と型を検証 ---
        const parsed:Heartbeat = HeartbeatSchema.parse(req.body);
        const  { userId, elapsedTime, status, sessionId: inputSessionId, timestamp, } = parsed;

        // --- セッションIDを自動生成　---
        const sessionId = inputSessionId || generateSessionId();

        // --- Firestoreの heartbeats コレクションに記録 ---
        await db.collection("heartbeats").doc(sessionId).set({
            userId,
            sessionId,
            elapsedTime,
            status,
            timestamp: new Date(timestamp),
            title: parsed.title || "未設定",        // 🆕 タイトル追加
            category: parsed.category || "日常",    // 🆕 カテゴリ追加
            description: parsed.description || "",  // 🆕 説明追加
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

/** セッションを完了して records に登録 */
router.patch("/:sessionId/complete", async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const { userId } = req.body; // 👈 追加：フロントから受け取る
  
      console.log(`[PATCH /api/heartbeat/${sessionId}/complete] userId=${userId}`);
  
      // --- 該当セッションを取得 ---
      const docRef = db.collection("heartbeats").doc(sessionId);
      const doc = await docRef.get();
  
      if (!doc.exists) {
        res.status(404).json({ ok: false, message: "指定されたセッションが見つかりません。" });
        return;
      }
  
      const data = doc.data();
  
      // --- heartbeats のステータスを更新 ---
      await docRef.update({
        status: "completed",
        updatedAt: new Date(),
      });
  
      const updated = (await docRef.get()).data();
      const date = dayjs().tz("Asia/Tokyo").format("YYYY-MM-DD");
  
      // --- records コレクションに保存 ---
      await db.collection("records").add({
        userId: userId || updated?.userId || "unknown", // ✅ 優先的にreq.body.userIdを使う
        title: updated?.title || "未設定",
        category: updated?.category || "日常",
        duration: updated?.elapsedTime || 0,
        reason: updated?.description || "",
        xp: 10,
        date,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      res.status(200).json({
        ok: true,
        message: "セッションを完了し、recordsに保存しました。",
        sessionId,
      });
    } catch (error) {
      console.error("[PATCH /api/heartbeat/:sessionId/complete] エラー:", error);
      res.status(500).json({
        ok: false,
        message: "セッション完了処理中にエラーが発生しました。",
      });
    }
  });
  

export default router;