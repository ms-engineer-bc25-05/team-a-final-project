/**
 * エントリポイント
 * - .env を読み込む（絶対パス指定で確実に）
 * - Expressアプリを起動
 * - グレースフルシャットダウン対応
 */

import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "..", ".env") }); // ← backend/.env を確実に読み込む

import app from "./app";

const PORT = Number(process.env.PORT || 4000);

// 起動ログ
function logBanner() {
  console.log("=======================================");
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🧠 NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔑 OpenAI key loaded: ${Boolean(process.env.OPENAI_API_KEY)}`);
  console.log("=======================================");
}

const server = app.listen(PORT, () => {
  logBanner();
});

// グレースフルシャットダウン
function shutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Closing server...`);
  server.close(() => {
    console.log("✅ HTTP server closed. Bye!");
    process.exit(0);
  });
  // 10秒で強制終了
  setTimeout(() => {
    console.error("⏱️ Force exit after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// 予期せぬエラーもログ
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});