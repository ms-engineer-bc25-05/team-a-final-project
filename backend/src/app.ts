// backend/src/app.ts
import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";

import openaiRouter from "./routes/openai";
import suggestionsRouter from "./routes/suggestions";

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// すべての JSON 応答を UTF-8 で返す
app.use((_req, res, next) => {
  const origJson = res.json.bind(res);
  res.json = (body: any) => {
    res.set("Content-Type", "application/json; charset=utf-8");
    return origJson(body);
  };
  next();
});

// 簡易ログ
app.use((req, _res, next) => {
  if (req.path.startsWith("/api/openai") || req.path.startsWith("/api/suggestions")) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// --- Root ---
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "API server is running" });
});

// --- Routers ---
app.use("/api/openai", openaiRouter);
app.use("/api/suggestions", suggestionsRouter);

// --- ルート一覧（express-list-endpoints 使用）---
app.get("/__routes", (_req, res) => {
  const endpoints = listEndpoints(app).flatMap((r) =>
    r.methods.map((m) => ({ method: m, path: r.path }))
  );
  res.json({ routes: endpoints });
});

// --- Error Handler ---
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Error:", err);
    res.status(err?.status || 500).json({
      error: {
        message: err?.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      },
    });
  }
);

export default app;
