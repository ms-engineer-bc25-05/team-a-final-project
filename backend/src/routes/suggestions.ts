// backend/src/routes/suggestions.ts
import { Router } from "express";
import { z } from "zod";
import {
  SuggestionRequestSchema,
  type SuggestionRequest,
} from "../schemas/suggestions";
import { getDummySuggestions } from "../services/suggestionService";

const router = Router();

// 生存確認
router.get("/ping", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

// サンプル（便利）
router.get("/examples", (_req, res) => {
  res.json({ examples: ["会議運営", "オンボーディング改善", "テスト戦略"] });
});

// 本命：ダミー提案
router.post("/", (req, res) => {
  try {
    // PowerShell でも崩れにくいよう、Content-Type: application/json を前提
    const parsed: SuggestionRequest = SuggestionRequestSchema.parse(req.body);
    const suggestions = getDummySuggestions(parsed);
    res.json({
      topic: parsed.topic,
      count: suggestions.length,
      suggestions,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({
        error: { message: "Invalid request", issues: e.flatten() },
      });
    }
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
});

export default router;