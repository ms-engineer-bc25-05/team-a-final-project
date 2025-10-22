// backend/src/index.ts
import path from "path";
import dotenv from "dotenv";
// backend/.env を確実に読み込む（src から見て1階層上）
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
// import { messaging } from "firebase-admin"; // NOTE:今は使用されていないのでコメントアウト

import stripeRouter from "./routes/stripe";
import { db } from "./config/firebase";
import moodRouter from "./routes/mood";
import surveysRouter from "./routes/surveys";
import paymentsRouter from "./routes/payments";
import sessionsRouter from "./routes/sessions";


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

// ------------------------------------
// Webhookルート
// ------------------------------------
app.use("/api/stripe",stripeRouter);

// ------------------------------------
// ルーター登録
// ------------------------------------
app.use(express.json());
app.use("/api/mood", moodRouter);
app.use("/api/surveys", surveysRouter);
app.use("/api/payments", paymentsRouter); // NOTE: Stripe 決済APIルートを登録
app.use("/api/sessions", sessionsRouter); // NOTE: 行動セッション管理APIルートを登録



// ------------------------------------
// ベースルート
// ------------------------------------
app.get("/", (_req: Request, res: Response):void => {  // NOTE:型修正
  res.send("OK");
});

// ------------------------------------
// ヘルスチェック
// ------------------------------------
app.get("/health", (_req: Request, res: Response):void => {  // NOTE:型修正
  res.status(200).json({ ok: true });
});

// ------------------------------------
// Firestore接続確認
// ------------------------------------
app.get("/health/firebase", async (_req: Request, res: Response): Promise<Response> => {
  try {
    const testDoc = db.collection("test").doc("connection_check");
    await testDoc.set({
      status: "ok",
      timestamp: new Date().toISOString(),
    });

    return res.json({ ok: true, message: "Firestore connection successful" });

  } catch (error: unknown) {  // NOTE: 型エラー修正
    console.error("[Firestore Connection Error]", error);

    if (error instanceof Error) {
      res.status(500).json({
        ok: false,
        message: "Firestore connection failed",
        error: {
          code: "unknown",
          message: error.message,
        },
      });
    } 
    // NOTE: 想定外の型（string, number, objectなど）
    return res.status(500).json({
        ok: false,
        message: "Firestore connection failed",
        error: {
          code: "unknown",
          message: String(error),
        },
      });
  }
});

// ------------------------------------
// 404 ハンドラ
// ------------------------------------
app.use((req: Request, res: Response): void => {  // NOTE:型修正
  res.status(404).json({ ok: false, message: "Not Found", path: req.path });
});

// ------------------------------------
// エラーハンドラ
// ------------------------------------
app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction): void => { // NOTE:型修正
    console.error("[Express Error Handler]", err); 
    // NOTE: Errorインスタンスとして処理可能な場合
    if (err instanceof Error) {
      res.status(500).json({
        ok: false,
        message: err.message,
        code: "internal_error",
      });
      return;
    }
    res.status(500).json({
      ok: false,
      message: "Internal Server Error",
      code: "unknown_error",
      error: String(err),
    });
  }
);

// ------------------------------------
// サーバー起動
// ------------------------------------
app.listen(PORT, (): void => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

export default app;