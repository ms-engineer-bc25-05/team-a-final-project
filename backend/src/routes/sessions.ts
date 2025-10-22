/**
 * NOTE:
 * /api/sessions ルートでは、ユーザーの行動セッション（SessionData）を
 * Firestore に記録・取得・更新する処理をします。
 * （Day6-1）では、まず「セッションの新規作成（POST）」のみ実装。
 * 
 * TODO: Day6-2 以降で以下を拡張予定：
 * - PATCH: 状態更新（pause / resume / complete）
 * - GET: ユーザー別のセッション履歴取得
 */

import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { db } from "../config/firebase";
import { SessionData } from "../types/session";

const router = express.Router();

/**
 * 新しい行動セッションを作成、Firestoreに記録します。
 */
router.post("/", async( req: Request, res: Response):Promise<void> => {
    // 受け取るデータを分解
    const { userId, activityType, suggestion } = req.body;

    try {
        if (!userId) {
            // FIXME: userId は将来的に Firebase Auth トークンから取得予定
            res.status(400).json({ ok: false, message: "ユーザーIDは必須です"});
            return;
        }
        // Firestoreへ登録するデータを整形
        const sessionData: SessionData = {
            userId,
            startTime: new Date().toISOString(),
            status: "active",
            activityType,
            suggestion,
        };

        // Firestoreへ書き込み
        const newDocRef = await db.collection("sessions").add({
            ...sessionData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({
            ok: true,
            message: "セッションが正常に作成されました",
            id: newDocRef.id  // Firestoreで自動発行されたドキュメントID
        });
    } catch (error:unknown) {
        console.error("[POST /api/sessions] Error:",error);

        if (error instanceof Error) {
            res.status(500).json({ ok: false, message: error.message });
        } else {
            res.status(500).json({ ok: false, message:"不明なエラーが発生しました"});
        }
    }
});

export default router;