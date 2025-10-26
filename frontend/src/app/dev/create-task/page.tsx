"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/**
 * 開発用タスク作成ページ (/dev/create-task)
 * - ログイン中ユーザーのUIDを自動挿入
 * - durationMin と title をフォームで指定
 * - Firestore tasks コレクションに追加
 * - XPロジック（15〜29分＝5XP、30分以上＝10XP）確認用
 */
export default function DevCreateTaskPage() {
  const [title, setTitle] = useState("集中タイマー30分");
  const [duration, setDuration] = useState<number>(30);
  const [message, setMessage] = useState("");

  const handleCreateTask = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("ログインしてください。");
      return;
    }

    try {
      const ref = await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        title,
        durationMin: duration,
        createdAt: serverTimestamp(),
      });
      setMessage(`✅ タスク作成完了: ${ref.id}`);
      console.log("✅ Created task:", ref.id);
    } catch (err) {
      console.error("❌ Firestore エラー:", err);
      setMessage("❌ タスク作成に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#E7F5F8] to-[#F8FBFC] text-[#2c4d63] px-6">
      <div className="bg-white/80 backdrop-blur-xl border border-[#E5EEF0] rounded-2xl shadow-md p-6 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">
          🧪 開発用タスク作成ページ
        </h1>

        <label className="block text-sm mb-2 font-medium">タイトル</label>
        <input
          type="text"
          placeholder="例：集中タイマー15分"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-[#bcd5de] rounded-lg px-3 py-2 mb-4"
        />

        <label className="block text-sm mb-2 font-medium">所要時間（分）</label>
        <input
          type="number"
          min={5}
          max={120}
          step={5}
          placeholder="15"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full border border-[#bcd5de] rounded-lg px-3 py-2 mb-6"
        />

        <button
          onClick={handleCreateTask}
          className="w-full bg-[#b9ddee] hover:bg-[#a8d2e8] text-[#2c4d63] py-2 rounded-lg font-semibold transition"
        >
          タスクを作成
        </button>

        {message && (
          <p className="text-sm text-center mt-4 text-[#2c4d63]">{message}</p>
        )}
      </div>
    </div>
  );
}
