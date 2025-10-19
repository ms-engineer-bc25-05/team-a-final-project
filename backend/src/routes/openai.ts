// backend/src/routes/openai.ts
import { Router } from "express";
// import { assertEnv, makeOpenAI } from "../config/openai"; // ← /shortでは使わない
import { simpleChat } from "../services/openaiService";

const router = Router();

router.get("/ping", (_req, res) => {
  res.type("application/json; charset=utf-8").json({ ok: true, at: new Date().toISOString() });
});

router.get("/debug/env", (_req, res) => {
  res.type("application/json; charset=utf-8").json({
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    useMock: String(process.env.USE_MOCK || "false"),
    nodeEnv: process.env.NODE_ENV || "development",
    cwd: process.cwd(),
  });
});

router.get("/debug/openai", async (_req, res) => {
  try {
    // ここは従来通りでOK（健診用途）
    const { assertEnv, makeOpenAI } = await import("../config/openai");
    assertEnv();
    // @ts-ignore
    const result = await makeOpenAI()?.models.list();
    res.type("application/json; charset=utf-8").json({ ok: true, count: result?.data?.length ?? 0 });
  } catch (e: any) {
    res.status(e?.status ?? 500).type("application/json; charset=utf-8").json({
      error: { status: e?.status ?? 500, code: e?.code, message: e?.message, data: e?.response?.data ?? null },
    });
  }
});

// ★ 短文返答（assertEnv しない → simpleChat が内部でフォールバック）
router.post("/short", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt ?? "").trim();
    if (!prompt) {
      return res.status(400).type("application/json; charset=utf-8").json({ error: { message: "prompt required" } });
    }
    const reply = await simpleChat(prompt);

    // 429 などでも simpleChat が文字列を返してくれるので 200 で返す
    // フォールバック時かどうかをクライアントが知りたいなら note を付けてもOK
    const isFallback = !process.env.OPENAI_API_KEY || reply.length < prompt.length && reply.length <= 10;
    res.type("application/json; charset=utf-8").json({
      prompt,
      reply,
      note: isFallback ? "fallback: local shortener" : undefined,
    });
  } catch (e: any) {
    // ここに落ちるのは基本想定外だが、安全に200でローカル短縮を返す
    const { localShortener } = await import("../services/openaiService");
    const prompt = String(req.body?.prompt ?? "").trim();
    res.type("application/json; charset=utf-8").json({
      prompt,
      reply: localShortener(prompt),
      note: "fallback: local shortener (route-catch)",
    });
  }
});

export default router;
