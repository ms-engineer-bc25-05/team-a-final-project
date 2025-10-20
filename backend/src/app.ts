// backend/src/app.ts
import express, { Request, Response, NextFunction} from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";

import openaiRouter from "./routes/openai";
import suggestionsRouter from "./routes/suggestions";

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// すべての JSON 応答を UTF-8 で返す
app.use((_req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json.bind(res);
  res.json = function <T>(body: T): Response<T> {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return originalJson(body);
  };
  next();
});

// 簡易ログ
app.use((req: Request, _res: Response, next: NextFunction): void => {
  if (req.path.startsWith("/api/openai") || req.path.startsWith("/api/suggestions")) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// --- Root ---
app.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "API server is running" });
});

// --- Routers ---
app.use("/api/openai", openaiRouter);
app.use("/api/suggestions", suggestionsRouter);

// --- ルート一覧（express-list-endpoints 使用）---
app.get("/__routes", (_req: Request, res: Response): void => {
  const endpoints = listEndpoints(app).flatMap((route) =>
    route.methods.map((method) => ({
      method,
      path: route.path,
    }))  
  );
  res.json({ routes: endpoints });
});

// --- Error Handler ---
app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("[Error Handler]", err);

    if (err instanceof Error){
      res.status(500).json({
        error: {
          message: err.message,
          stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        },
      });
      return;
    }

    // NOTE: それ以外の未知のエラー
    res.status(500).json({
      error: {
        message: "Internal Server Error",
        detail: String(err),
      },
    });
  }
);

export default app;
