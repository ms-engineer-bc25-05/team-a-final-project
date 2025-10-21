// backend/src/routes/surveys.ts
import { Router, Request, Response } from "express";
import { db, FieldValue } from "../config/firebase";
import { surveySchema } from "../schemas/survey";

// NOTE: Firestore ドキュメントの型（Zod スキーマから自動推論）
type SurveyInput = typeof surveySchema._type

const router = Router();

/**
 * POST /api/surveys
 * Body (例):
 * {
 *   "userId": "abc123",
 *   "lifestyle": "朝型",
 *   "freeTimeWeekday": "06:00〜09:00",
 *   "freeTimeWeekend": "19:00〜22:00",
 *   "interests": ["運動", "リラックス"],
 *   "personalityQ1": "とにかく動き出して外に出る",
 *   "personalityQ2": "家でゴロゴロしながら好きなことをする"
 * }
 */
router.post("/", async (req:Request, res: Response): Promise<Response> => {
  try {
    const parsed = surveySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        message: "Invalid request body",
        issues: parsed.error.flatten(),
      });
    }

    // userId を含めたままトップレベル 'surveys' に保存
    const payload: SurveyInput = parsed.data;

    const ref = await db.collection("surveys").add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res
      .status(201)
      .json({ ok: true, message: "Survey saved successfully", id: ref.id });
  } catch (err) { // NOTE: 型の修正
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/surveys] error:", message);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
});

/**
 * GET /api/surveys?userId=abc123&limit=10
 * - 指定ユーザーのアンケートを作成日時の降順で取得
 * - limit: 1〜50 (デフォルト10)
 * ＊必要に応じて Firestore の複合インデックス（surveys: userId ASC × createdAt DESC）を作成してください
 */
router.get("/", async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = String(req.query.userId || "");
    const limitRaw = Number(req.query.limit || 10);
    const limit = Math.max(1, Math.min(isFinite(limitRaw) ? limitRaw : 10, 50)); // 1〜50

    if (!userId) {
      return res.status(400).json({ ok: false, message: "Missing query: userId" });
    }

    const snap = await db
      .collection("surveys")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const items = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        lifestyle: data.lifestyle,
        freeTimeWeekday: data.freeTimeWeekday,
        freeTimeWeekend: data.freeTimeWeekend,
        interests: data.interests,
        personalityQ1: data.personalityQ1,
        personalityQ2: data.personalityQ2,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return res.json({ ok: true, items });
  } catch (e) {
    // インデックス未作成時の親切メッセージ
    if (
      typeof e === "object" &&
      e &&
      "code" in e &&
      (e as{ code:number }).code === 9 &&
      "message" in e &&
      typeof (e as { message: string }).message === "string" &&
      (e as { message: string }).message.includes("create_composite=")
    ) { 
      const message = (e as { message: string }).message;
      const m = message.match(/https:\/\/console\.firebase\.google\.com\/[^\s"]+/);
      return res.status(400).json({
        ok: false,
        message: "Firestore index required. Open the URL to create the composite index.",
        indexUrl: m?.[0] ?? null,
      });
    }
    const message = e instanceof Error ? e.message : String(e);
    console.error("[GET /api/surveys] error:", message);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
});

export default router;