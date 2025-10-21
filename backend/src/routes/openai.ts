// backend/src/routes/openai.ts
import { Router, Request, Response } from "express";
// import { assertEnv, makeOpenAI } from "../config/openai"; // ← /shortでは使わない
import { simpleChat,localShortener } from "../services/openaiService";
import { error } from "console";

const router = Router();

router.get("/ping", (_req: Request, res: Response): void => {  // NOTE: 型を明示
  res
    .type("application/json; charset=utf-8")
    .json({ ok: true, at: new Date().toISOString() });
});

router.get("/debug/env", (_req: Request, res: Response): void => {
  res.type("application/json; charset=utf-8").json({
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    useMock: String(process.env.USE_MOCK || "false"),
    nodeEnv: process.env.NODE_ENV || "development",
    cwd: process.cwd(),
  });
});

router.get("/debug/openai", async (_req: Request, res: Response): Promise<void> => { // NOTE: 型を明示
  try {
    // ここは従来通りでOK（健診用途）
    const { assertEnv, makeOpenAI } = await import("../config/openai");
    assertEnv();
    // @ts-ignore
    const client = makeOpenAI();
    const result = await makeOpenAI()?.models.list();
    res.type("application/json; charset=utf-8").json({ ok: true, count: result?.data?.length ?? 0 });
  } catch (err: unknown) {
    const status =
      typeof err === "object" && err && "status" in err
        ? (err as {status?: number }).status ?? 500
        :500;
    const code =
      typeof err === "object" && err && "code" in err
        ? (err as {code?: string }).code
        : undefined;
    const message =
         err instanceof Error ? err.message : "Unknown error occurred";
    const data =
      typeof err === "object" && err && "response" in err
        ? (err as { response?: { data?: unknown } }).response?.data ?? null
        : null;
    res
       .status(status)
       .type("application/json; charset=utf-8")
       .json({ error: { status,code,message,data} });
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
  } catch (err: unknown) {
    // ここに落ちるのは基本想定外だが、安全に200でローカル短縮を返す
    const prompt = String(req.body?.prompt ?? "").trim();
    const fallbackReply = localShortener(prompt);

    const message =
      err instanceof Error ? err.message : String(err ?? "Unknown error");
      console.error("🔥 [POST/api/openai/short] unexpected error:", message);
      
      res.type("application/json; charset=utf-8").json({
        prompt,
        reply: localShortener(prompt),
        note: "fallback: local shortener (route-catch)",
    });
  }
});

export default router;
