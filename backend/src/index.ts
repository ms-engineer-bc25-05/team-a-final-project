import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/firebase";
import moodRouter from "./routes/mood";
import { messaging } from "firebase-admin";

dotenv.config(); // ← dotenvの読み込みはここに集約

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ------------------------------------
// 基本ルート
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
// 疎通確認
// ------------------------------------
app.get("/api/test", (_req, res) => {
  res.json({ message: "API is working fine 🎉" });
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
  } catch (error: unknown) {  // NOTE: anyの型エラー修正
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
    } else {
      // NOTE: 想定外の型（string, number, objectなど）
      res.status(500).json({
        ok: false,
        message: "Firestore connection failed",
        error: {
          code: "unknown",
          message: String(error),
        },
      });
    }
  }
});

// ------------------------------------
// 気分API
// ------------------------------------
app.use("/api/mood", moodRouter);

// ------------------------------------
// サーバ起動
// ------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});