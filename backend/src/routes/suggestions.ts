// backend/src/routes/suggestions.ts
import { Router } from "express";
import { z } from "zod";
import { SuggestionReqSchema, makeSuggestions } from "../services/suggestionService";

const router = Router();

/** Figma の呼称に完全一致させる（表示ラベルを固定） */
const TOPIC_LABELS = {
  exercise: "運動",
  study: "学習",
  hobby: "趣味",
  life: "生活",
} as const;

/** ヘルスチェック */
router.get("/ping", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

/**
 * 例一覧（Figmaの文言に完全一致）
 * - topics: 画面で見せるカテゴリ一覧（見出し＋短い説明）
 * - example: リクエスト例 & サンプルレスポンス（中身は生活・リフレッシュ寄り）
 */
router.get("/examples", (_req, res) => {
  const topics = [
    { key: TOPIC_LABELS.exercise, desc: "体を軽く動かしてリフレッシュ" },
    { key: TOPIC_LABELS.study,    desc: "短時間のインプットや復習に" },
    { key: TOPIC_LABELS.hobby,    desc: "気分転換に好きなことを少し" },
    { key: TOPIC_LABELS.life,     desc: "暮らしを整える小さな行動" },
  ];

  // 表示用の例は任意のカテゴリでOK（ここでは「運動」にしています）
  const exampleRequest = { topic: TOPIC_LABELS.exercise, count: 3 };
  const exampleResponse = makeSuggestions(exampleRequest);

  res.json({
    ok: true,
    topics,
    example: {
      request: exampleRequest,
      response: exampleResponse,
    },
  });
});

/** 提案本体（現在は生活にトーンを固定。topicは将来の拡張用として受け取る） */
router.post("/", (req, res) => {
  try {
    const parsed = SuggestionReqSchema.parse(req.body);
    const payload = makeSuggestions(parsed);
    res.json(payload);
  } catch (e) {
    const zerr = e as z.ZodError;
    res.status(400).json({
      ok: false,
      message: "Invalid request body",
      issues: zerr.issues ?? undefined,
    });
  }
});

export default router;