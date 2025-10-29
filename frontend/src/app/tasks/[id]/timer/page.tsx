"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

/**
 * NOTE:
 * タイマー画面
 * - クエリからタスク名・所要時間を取得して動的に表示
 * - 円形プログレスバーで残り時間を可視化
 * - 現時点ではローカル制御のみ（API接続は今後実装）
 */
export default function TimerPage() {
  const router = useRouter();
  const params = useSearchParams();
  

  // NOTE: クエリからタスク情報を取得（例: /timer?title=読書&minutes=25）
  const taskTitle = params.get("title") || "このタスク";
  const taskMinutes = Number(params.get("minutes")) || 25;

  const { id } = useParams();
  const taskId = id;

  // NOTE: 残り時間を秒単位で保持
  const totalSeconds = taskMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);

  // NOTE: タイマー進行（開始・停止制御）
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // NOTE: mm:ss 形式に変換
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // NOTE: 進捗率を算出（SVG描画用）
  const progress = (secondsLeft / totalSeconds) * 100;

  
const handleComplete = async () => {
  if (!taskId) return;

  try {
    console.log("🚀 Completing heartbeat session:", taskId);

    // 👇 現在ログインしているユーザーを取得
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("ログインが必要です。");
      return;
    }

    // PATCH リクエスト送信（userIdを追加）
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/heartbeat/${taskId}/complete`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid, 
        }),
      }
    );

    const data = await res.json();
    console.log("✅ Complete response:", data);

    if (!res.ok) throw new Error(data.message || "Failed to complete session");

    alert("おつかれさまです！");
    router.push(`/tasks/${taskId}/complete`);
  } catch (err) {
    console.error("❌ Failed to complete session:", err);
    alert("セッション完了処理に失敗しました。もう一度お試しください。");
  } finally {
    setIsRunning(false);
  }
};

  return (
    <main className="min-h-screen bg-linear-to-b from-[#FAFCFD] to-[#F7FBFC] flex flex-col items-center justify-start pt-16 pb-24 text-center">
      {/* --- Header --- */}
      <header className="mb-14 w-full max-w-[500px] px-6">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-[#2C4D63] text-center tracking-wide 
                       max-w-[90%] truncate mx-auto whitespace-nowrap overflow-hidden text-ellipsis mb-5"
        >
          ⏱️&nbsp; {taskTitle}
        </h1>
        <p className="text-sm text-[#6B94A3]">
          無理せず、ゆっくりいきましょう。
        </p>
      </header>

      {/* --- Timer Circle --- */}
      <div className="relative w-64 h-64 mt-8 mb-10 drop-shadow-[0_6px_18px_rgba(255,209,102,0.25)]">
        <svg className="w-full h-full" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="88" stroke="#E6EDF1" strokeWidth="12" fill="none" />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="#FFD166"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${(2 * Math.PI * 88 * (100 - progress)) / 100}`}
            strokeLinecap="round"
            className="transition-all duration-500 ease-linear"
            transform="rotate(-90 96 96)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-5xl font-bold text-[#2C4D63]">
            {formatTime(secondsLeft)}
          </p>
        </div>
      </div>

      {/* --- Buttons --- */}
      <div className="flex gap-5 mt-4">
        {!isRunning ? (
          <button
            onClick={() => setIsRunning(true)}
            className="w-36 bg-[#FFD166] hover:bg-[#F4C14B] text-[#2C4D63]
                       font-semibold py-3 rounded-2xl shadow-[0_6px_18px_rgba(255,209,102,0.25)]
                       transition-all duration-200"
          >
            開始
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(false)}
            className="w-36 bg-white border border-[#D6E3E8] hover:bg-[#F7FAFB] active:bg-[#EEF5F7] text-[#2C4D63]
                       font-semibold py-3 rounded-2xl shadow-[0_6px_18px_rgba(168,216,230,0.25)]
                       transition-all duration-200"
          >
            一時停止
          </button>
        )}
        <button
          onClick={handleComplete}
          className="w-36 bg-[#A8D8E6] hover:bg-[#9BCDE0] active:bg-[#92C2D8] text-[#2C4D63]
                     font-semibold py-3 rounded-2xl shadow-[0_6px_18px_rgba(155,205,224,0.35)]
                     transition-all duration-200"
        >
          完了
        </button>
      </div>
    </main>
  );
  };

