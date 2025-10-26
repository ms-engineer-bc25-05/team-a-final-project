// backend/src/routes/suggestions.ts
import { Request, Response,Router} from "express";
import OpenAI from "openai";
import { db } from "../config/firebase";
import { z } from "zod";
import { makeSuggestions } from "../services/suggestionService";
import { SuggestionRequestSchema, SuggestionRequest } from "../schemas/suggestions";
import { buildSuggestionPrompt } from "../utils/openaiPrompt";


const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /api/suggestions
 * OpenAI を使って実際に提案を生成するルート。
 */

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed: SuggestionRequest = SuggestionRequestSchema.parse(req.body);
    const { topic, subInterests = [], count, userId, mood: parsedMood, userProfile } = parsed;

    // ユーザーIDが存在しない場合エラー表示
    if (!userId) {
      res.status(400).json({ message: "Missing userId in request body"});
        return;
    }

    // Firestoreからユーザー情報を取得
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    
    // 最新のmoodを取得
    const moodSnap = await db
      .collection("mood")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    let dbMood: string | null = null;
    if (!moodSnap.empty) {
      const doc = moodSnap.docs[0].data();
      dbMood = doc.status || doc.mood || null;
    }

    const normalizeMood = (m: string | null): "high" | "normal" | "low" => {
      if (!m) return "normal";
      if (m.includes("高") || m === "high") return "high";
      if (m.includes("低") || m === "low") return "low";
      return "normal";
    };

    const mood = normalizeMood(parsedMood ?? dbMood);

    console.log("🎭 Mood fetched:", mood);

    // 最新のsurveysを取得
    const surveySnap = await db
      .collection("surveys")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    const surveyData = !surveySnap.empty ? surveySnap.docs[0].data() : {};

    const userProfileFinal = {
      typeMorning: surveyData?.lifestyle || "未設定",
      freeTime: `${surveyData?.freeTimeWeekday || "未設定"}／${surveyData?.freeTimeWeekend || "未設定"}`,
      interests: surveyData?.interests || [],
      personality: [surveyData?.personalityQ1, surveyData?.personalityQ2].filter(Boolean),
    };

  
    console.log("🧠 UserProfile fetched:", userProfileFinal);
    console.log("📘 Mood fetched:", dbMood);

    const topics = userProfileFinal.interests ?? [];

    // Open AI　プロンプトを/utile/openaiPrompt.tsから呼び出す
    const prompt =  buildSuggestionPrompt({
      userProfile: userProfileFinal,
      mood,
      topics,
      subInterests,
      count: 3,
      })
  
      console.log("🧠 userProfile.interests:", userProfileFinal.interests);
      console.log("📘 topics:", topics);
      console.log("➡️ 最終的にAIに渡す topics:", topics ? [topics] : userProfileFinal?.interests || []);


      console.log("🧾 Prompt content:\n", prompt);

    // OpenAI API　呼び出し
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content;
    let suggestions;
    console.log("✅ AI response (raw):", content);

    try {
      suggestions = JSON.parse(content || "[]");
    } catch {
      suggestions = [{ title: content?.slice(0,50) || "提案生成に失敗しました" }];
    }

    res.json({
      suggestions,
      message: "success",
    });
  } catch (error) {
    console.error("[POST /api/suggestions] OpenAI Error:", error);

    const fallback = makeSuggestions({ topic: req.body.topic || "生活",count:3 });
    res.json({
      ...fallback,
      message: "fallback: OpenAI error",
    });
  }
});


/** Figma の呼称に完全一致させる（表示ラベルを固定） */
const TOPIC_LABELS = {
  exercise: "運動",
  study: "学習",
  hobby: "趣味",
  life: "生活",
} as const;

/** ヘルスチェック */
router.get("/ping", (_req: Request, res: Response): void => {
  res.json({ ok: true, at: new Date().toISOString() });
});

/**
 * 例一覧（Figmaの文言に完全一致）
 * - topics: 画面で見せるカテゴリ一覧（見出し＋短い説明）
 * - example: リクエスト例 & サンプルレスポンス（中身は生活・リフレッシュ寄り）
 */
router.get("/examples", (_req: Request, res: Response): void => {
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

router.get("/", (req: Request, res: Response): Response => {
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


export default router;
