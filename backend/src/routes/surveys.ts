// backend/src/routes/surveys.ts
import { Router } from "express";
import { db, FieldValue } from "../config/firebase";
import { surveySchema } from "../schemas/survey";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const parsed = surveySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, message: "Invalid request body", issues: parsed.error.flatten() });
    }

    // ← ここが重要： userId を含めたまま保存する
    const payload = parsed.data;

    const ref = await db.collection("surveys").add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ ok: true, message: "Survey saved successfully", id: ref.id });
  } catch (err: any) {
    console.error("[POST /api/surveys] error:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
});

export default router;