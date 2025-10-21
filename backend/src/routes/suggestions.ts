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

/**
 * GET /api/suggestions
 * フロントの接続確認用：常に 429 を返す“フォールバック”エンドポイント。
 * - クエリ: ?count=3, ?topic=運動 等（topic は省略可、未指定時は「生活」）
 * - レスポンス: { suggestions: [...], message: "fallback 429" } を 429 で返す
 *
 * これにより、OpenAI を使わずに rewrite → backend の経路と UI 表示を検証できる。
 */
const QuerySchema = z.object({
  count: z.coerce.number().int().min(1).max(10).default(3),
  topic: z
    .string()
    .optional(), // 日本語ラベル（例: "運動"）を想定。未指定なら「生活」。
});

router.get("/", (req, res) => {
  const q = QuerySchema.safeParse(req.query);
  if (!q.success) {
    return res.status(400).json({ ok: false, message: "Invalid query", issues: q.error.issues });
  }

  const count = q.data.count;
  const requestedTopic = q.data.topic;

  // 日本語ラベルのいずれかであれば採用、そうでなければ「生活」
  const labels = Object.values(TOPIC_LABELS) as readonly string[];
  const topic = labels.includes(requestedTopic ?? "") ? (requestedTopic as string) : TOPIC_LABELS.life;

  // 既存の makeSuggestions を利用して見た目を合わせる
  const result = makeSuggestions({ topic, count });

  // makeSuggestions の戻りが { suggestions: [...] } または配列、どちらでも拾えるように揃える
  const suggestions =
    Array.isArray((result as any)?.suggestions) ? (result as any).suggestions : Array.isArray(result) ? result : [];

  res.setHeader("Retry-After", "60");
  return res.status(429).json({
    suggestions,
    message: "fallback 429",
  });
});

/**
 * POST /api/suggestions
 * 本来の提案生成（将来的にOpenAIなどと接続）。現状は makeSuggestions をそのまま返す。
 */
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
