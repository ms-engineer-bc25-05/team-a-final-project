// backend/src/routes/surveys.ts
import { Router } from "express";
import { db, FieldValue } from "../config/firebase";
import { surveySchema } from "../schemas/survey";

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
router.post("/", async (req, res) => {
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
    const payload = parsed.data;

    const ref = await db.collection("surveys").add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res
      .status(201)
      .json({ ok: true, message: "Survey saved successfully", id: ref.id });
  } catch (err: any) {
    console.error("[POST /api/surveys] error:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
});

/**
 * GET /api/surveys?userId=abc123&limit=10
 * - 指定ユーザーのアンケートを作成日時の降順で取得
 * - limit: 1〜50 (デフォルト10)
 * ＊必要に応じて Firestore の複合インデックス（surveys: userId ASC × createdAt DESC）を作成してください
 */
router.get("/", async (req, res) => {
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
  } catch (e: any) {
    // インデックス未作成時の親切メッセージ
    if (e?.code === 9 && typeof e?.message === "string" && e.message.includes("create_composite=")) {
      const m = e.message.match(/https:\/\/console\.firebase\.google\.com\/[^\s"]+/);
      return res.status(400).json({
        ok: false,
        message: "Firestore index required. Open the URL to create the composite index.",
        indexUrl: m?.[0] ?? null,
      });
    }
    console.error("[GET /api/surveys] error:", e);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
});

export default router;