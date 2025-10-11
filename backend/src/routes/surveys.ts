import { Router } from "express";
import { db, FieldValue } from "../config/firebase";
import { surveySchema } from "../schemas/survey";

const router = Router();

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

    const { userId, ...payload } = parsed.data;
    const colRef = db.collection("users").doc(userId).collection("surveys");
    const docRef = await colRef.add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      ok: true,
      message: "Survey saved successfully",
      id: docRef.id,
    });
  } catch (err: any) {
    console.error("[POST /api/surveys] error:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal Server Error",
      error: { code: err?.code ?? "unknown", message: err?.message ?? String(err) },
    });
  }
});

export default router;