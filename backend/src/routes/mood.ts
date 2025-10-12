import { Router } from "express";
import { z } from "zod";
import { db, FieldValue } from "../config/firebase";

const router = Router();

// 入力バリデーション
const moodSchema = z.object({
  userId: z.string().min(1),
  mood: z.enum(["high", "normal", "low"]),
});

// POST /api/mood  →  トップレベル "moods" に保存
router.post("/", async (req, res) => {
  try {
    const parsed = moodSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        message: "Invalid request body",
        issues: parsed.error.flatten(),
      });
    }
    const { userId, mood } = parsed.data;

    const ref = await db.collection("moods").add({
      userId,
      mood,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ ok: true, message: "Mood saved", id: ref.id });
  } catch (e: any) {
    console.error("[POST /api/mood] error:", e);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
});

// GET /api/mood?userId=abc123&limit=5  →  最近の気分を取得（検証用）
router.get("/", async (req, res) => {
  const userId = String(req.query.userId || "");
  const limit = Number(req.query.limit || 5);
  if (!userId) return res.status(400).json({ ok: false, message: "Missing query: userId" });

  const snap = await db
    .collection("moods")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(Math.max(1, Math.min(limit, 50)))
    .get();

  const items = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      mood: data.mood,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  });
  return res.json({ ok: true, items });
});

export default router;