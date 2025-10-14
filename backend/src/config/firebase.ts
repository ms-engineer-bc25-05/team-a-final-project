// backend/src/config/firebase.ts
import admin from "firebase-admin";

// ==============================
// 🔧 必須環境変数チェック
// ==============================
const required = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
] as const;

for (const key of required) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    console.error(`[Firebase Config Error] Missing environment variable: ${key}`);
    throw new Error(`[Firebase Config] Missing env: ${key}`);
  }
}

// ==============================
// 🧩 変数整形（不可視文字・改行対策）
// ==============================
const projectId = process.env.FIREBASE_PROJECT_ID!.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n").trim();

// ==============================
// 🔍 起動確認ログ（デバッグ用）
// ==============================
console.log("-------------------------------------------------");
console.log("[Firebase Env Check]");
console.log("PROJECT_ID:", projectId);
console.log("CLIENT_EMAIL:", clientEmail);
console.log("PRIVATE_KEY set?", !!privateKey);
console.log("-------------------------------------------------");

// ==============================
// 🚀 Firebase Admin 初期化
// ==============================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  console.log("✅ Firebase Admin initialized successfully.");
}

// ==============================
// 📦 Firestore Export
// ==============================
export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;