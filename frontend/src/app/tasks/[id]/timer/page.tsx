"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";

/**
 * NOTE:
 * タイマー画面（最終版）
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

  // TODO: 完了時に /api/tasks/:id/complete へ保存処理を追加予定
  const handleComplete = () => {
    setIsRunning(false);
    alert("おつかれさま！完了を記録予定です。");
    router.push("/tasks/complete");
  };

  return (
    <AuthLayout title="">
      <div className="flex flex-col items-center justify-between h-[440px] py-8">
        {/* NOTE: 上部タイトル */}
        <div className="text-center">
          <p className="text-xl text-[#2c4d63] font-semibold mb-1">
            ⏱️ 今は「{taskTitle}」の時間。
          </p>
          <p className="text-gray-500 text-sm">無理せず、ゆっくりいきましょう。</p>
        </div>

        {/* NOTE: 円形プログレスタイマー */}
        <div className="relative w-48 h-48 my-6">
          <svg className="w-full h-full" viewBox="0 0 192 192">
            {/* 背景円 */}
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#e6edf1"
              strokeWidth="12"
              fill="none"
            />
            {/* 進捗円 */}
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#ffd166"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${(2 * Math.PI * 88 * (100 - progress)) / 100}`}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear"
              transform="rotate(-90 96 96)" // ← 始点を上から右上に移動して自然な円に
            />
          </svg>

          {/* 残り時間 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-4xl font-bold text-[#2c4d63]">
              {formatTime(secondsLeft)}
            </p>
          </div>
        </div>

        {/* NOTE: ボタン群 */}
        <div className="flex gap-4 mt-4">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="bg-[#ffd166] hover:bg-[#f4c14b] text-[#2c4d63] font-semibold py-2 px-6 rounded-xl shadow-sm transition"
            >
              開始
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="bg-[#b9ddee] hover:bg-[#a5cbe1] text-[#2c4d63] font-semibold py-2 px-6 rounded-xl shadow-sm transition"
            >
              一時停止
            </button>
          )}

          <button
            onClick={handleComplete}
            className="border border-gray-300 text-gray-500 font-medium py-2 px-6 rounded-xl hover:bg-gray-100 transition"
          >
            完了
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
