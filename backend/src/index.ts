// backend/src/index.ts
import path from "path";
import dotenv from "dotenv";
// backend/.env を確実に読み込む（src から見て1階層上）
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import { db } from "./config/firebase";
import moodRouter from "./routes/mood";
import surveysRouter from "./routes/surveys";

const app = express();
const PORT = process.env.PORT || 4000;

// ------------------------------------
// ミドルウェア
// ------------------------------------
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json());

// ------------------------------------
// ルーター登録
// ------------------------------------
app.use("/api/mood", moodRouter);
app.use("/api/surveys", surveysRouter);

// ------------------------------------
// ベースルート
// ------------------------------------
app.get("/", (_req, res) => {
  res.send("OK");
});

// ------------------------------------
// ヘルスチェック
// ------------------------------------
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// ------------------------------------
// Firestore接続確認
// ------------------------------------
app.get("/health/firebase", async (_req, res) => {
  try {
    const testDoc = db.collection("test").doc("connection_check");
    await testDoc.set({
      status: "ok",
      timestamp: new Date().toISOString(),
    });

    res.json({ ok: true, message: "Firestore connection successful" });
  } catch (error: any) {
    console.error("[/health/firebase] error:", error);
    res.status(500).json({
      ok: false,
      message: "Firestore connection failed",
      error: {
        code: error?.code ?? "unknown",
        message: error?.message ?? String(error),
      },
    });
  }
});

// ------------------------------------
// 404 ハンドラ
// ------------------------------------
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Not Found", path: req.path });
});

// ------------------------------------
// エラーハンドラ
// ------------------------------------
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[Express Error Handler]", err);
    res.status(err?.status || 500).json({
      ok: false,
      message: err?.message || "Internal Server Error",
      code: err?.code || "internal",
    });
  }
);

// ------------------------------------
// サーバー起動
// ------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

export default app;