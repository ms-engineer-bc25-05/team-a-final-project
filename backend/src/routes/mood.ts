import { Router,Request, Response } from "express";
import { z } from "zod";
import { db, FieldValue } from "../config/firebase";

const router = Router();

// 入力バリデーション
const moodSchema = z.object({
  userId: z.string().min(1),
  mood: z.enum(["high", "normal", "low"]),
});
// Zod から推論した型を利用
type MoodInput = z.infer<typeof moodSchema>;

// POST /api/mood  →  トップレベル "moods" に保存
router.post("/", async (req: Request<unknown, unknown, MoodInput>, res: Response): Promise<Response> => {
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
  } catch (err: unknown) { // NOTE:　型修正
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/mood] error:", message);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
});

// GET /api/mood?userId=abc123&limit=5  →  最近の気分を取得（検証用）
router.get("/", async (req: Request, res: Response):Promise<Response> => { // NOTE: 型修正
  try {
    const userId = String(req.query.userId ?? "");
    const limitRaw = Number(req.query.limit ?? 5);
    const limit = Math.max(1, Math.min(isFinite(limitRaw) ? limitRaw : 5, 50)); // 1〜50に制限
  
  if (!userId) {
    return res.status(400).json({ ok: false, message: "Missing query: userId" ,
    });
  } 

  const snap = await db
    .collection("moods")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  const items = snap.docs.map((d) => {
    const data = d.data() as MoodInput &  {
      createdAt?: FirebaseFirestore.Timestamp;
    }; 
    return {
      id: d.id,
      userId: data.userId,
      mood: data.mood,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  });
  return res.json({ ok: true, items });
} catch (err: unknown) {  // NOTE: 型修正
  const message = err instanceof Error ? err.message : String(err);
  console.error("[GET /api/mood] error:", message);
  return res.status(500).json({
    ok: false,
    message: "Internal Server Error",
  }); 
}});

export default router;