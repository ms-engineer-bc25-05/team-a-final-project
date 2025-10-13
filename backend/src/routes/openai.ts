// backend/src/routes/openai.ts
import { Router } from "express";
import { assertEnv, makeOpenAI } from "../config/openai";
import { simpleChat } from "../services/openaiService";

const router = Router();

// ルーターの生存確認
router.get("/ping", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

// 環境デバッグ
router.get("/debug/env", (_req, res) => {
  res.json({
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    useMock: String(process.env.USE_MOCK || "false"),
    nodeEnv: process.env.NODE_ENV || "development",
    cwd: process.cwd(),
  });
});

// OpenAI健診（権限・疎通）
router.get("/debug/openai", async (_req, res) => {
  try {
    assertEnv();
    const client = makeOpenAI();
    // @ts-ignore
    const result = await client?.models.list();
    res.json({ ok: true, count: result?.data?.length ?? 0 });
  } catch (e: any) {
    res.status(e?.status ?? 500).json({
      error: {
        status: e?.status ?? 500,
        code: e?.code,
        message: e?.message,
        data: e?.response?.data ?? null,
      },
    });
  }
});

// 本命：試し叩き
router.post("/test", async (req, res) => {
  try {
    assertEnv();
    const { prompt = "こんにちは！" } = req.body ?? {};
    const reply = await simpleChat(String(prompt));
    res.json({ prompt, reply });
  } catch (e: any) {
    const status = e?.status ?? 500;
    const code = e?.code;
    const rawMsg = e?.message ?? "OpenAI call failed";

    let friendly = "内部エラーが発生しました。時間をおいて再度お試しください。";
    if (status === 401) friendly = "APIキーが無効です。管理者に確認してください。";
    if (status === 403) friendly = "このモデルへのアクセス権限がありません。管理者に確認してください。";
    if (status === 429) friendly = "レート制限に達しました。しばらくしてからお試しください。";

    // Retry-After を転送（あれば）
    const ra = e?.response?.headers?.["retry-after"];
    if (ra) res.setHeader("Retry-After", ra);

    res.status(status).json({
      error: {
        status,
        code,
        message: friendly,
        detail: process.env.NODE_ENV === "development" ? rawMsg : undefined,
      },
    });
  }
});

export default router;