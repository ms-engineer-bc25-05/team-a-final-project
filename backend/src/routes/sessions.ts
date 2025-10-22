/**
 * NOTE:
 * /api/sessions ルートでは、ユーザーの行動セッション（SessionData）を
 * Firestore に記録・取得・更新する処理をします。
 * セッション状態の更新（停止・再開・完了）」を追加しました。
 */

import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { db } from "../config/firebase";

const router = express.Router();

/**
 * セッションを「一時停止」に更新するAPI
 * status を "paused" に変更し、
 * pauseHistory 配列に { pausedAt: 現在時刻 } を追加します。
 */
router.patch("/:id/pause", async( req: Request, res: Response):Promise<void> => {
    const { id } = req.params;
    const pausedAt = new Date().toISOString();

    try {
        await db.collection("sessions").doc(id).update({
            status: "paused",
            pauseHistory: admin.firestore.FieldValue.arrayUnion({ pausedAt }),
        });

        res.json({ ok: true, message: "セッションを一時停止しました。", pausedAt });

    } catch (error) {
        console.error("[PATCH /pause] Error:",error);
        res.status(500).json({ ok: false, message:"セッションの一時停止に失敗しました" });
        }
});

/**
 * セッションを「再開」に更新するAPI
 * status を "active" に戻し、
 * pauseHistory 配列に { resumedAt: 現在時刻 } を追加します。
 */
router.patch("/:id/resume", async( req: Request, res: Response):Promise<void> => {
    const { id } = req.params;
    const resumedAt = new Date().toISOString();

    try {
        await db.collection("sessions").doc(id).update({
            status: "active",
            pauseHistory: admin.firestore.FieldValue.arrayUnion({ resumedAt }),
        });

        res.json({ ok: true, message: "セッションを再開しました。", resumedAt });

    } catch (error) {
        console.error("[PATCH /resume] Error:",error);
        res.status(500).json({ ok: false, message:"セッションの再開に失敗しました" });
        }
});

/**
 * セッションを「完了」に更新するAPI
 * 完了時は pauseHistory には触れず、status と endTime のみ更新。
 */
router.patch("/:id/complete", async( req: Request, res: Response):Promise<void> => {
    const { id } = req.params;
    const endTime = new Date().toISOString();

    try {
        await db.collection("sessions").doc(id).update({
            status: "completed",
            endTime,
        });

        res.json({ ok: true, message: "セッションを完了しました。", endTime });

    } catch (error) {
        console.error("[PATCH /complete] Error:",error);
        res.status(500).json({ ok: false, message:"セッションの完了に失敗しました" });
        }
});

export default router;