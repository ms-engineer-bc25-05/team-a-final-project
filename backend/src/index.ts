import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// ==============================
// Firebase 初期化
// ==============================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

// ==============================
// ルート定義
// ==============================

// ① 基本ルート
app.get("/", (_req, res) => {
  res.send("OK");
});

// ② ヘルスチェック
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// ③ API 疎通確認
app.get("/api/test", (_req, res) => {
  res.json({ message: "API is working fine 🎉" });
});

// ④ Firestore 接続確認
app.get("/health/firebase", async (_req, res) => {
  try {
    const testDoc = db.collection("test").doc("connection_check");
    await testDoc.set({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
    res.json({ ok: true, message: "Firestore connection successful" });
  } catch (error) {
    console.error("[Firestore Connection Error]", error);
    res
      .status(500)
      .json({ ok: false, message: "Firestore connection failed" });
  }
});

// ==============================
// サーバ起動
// ==============================
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});