"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";

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
    alert("おつかれさまです！");
    router.push("/tasks/complete");
  };

//   return (
//     <AuthLayout showCard={false} showFooter={false} whiteBg>
//     <div className="flex flex-col items-center justify-center h-[90vh] -mt-8">
//   {/* タイトル */}
//   <div className="text-center mt-4">
//     <p className="text-lg font-semibold text-[#2c4d63] mb-1">
//       ⏱️「{taskTitle}」の時間
//     </p>
//     <p className="text-sm text-gray-500">無理せず、ゆっくりいきましょう。</p>
//   </div>

//   {/* タイマー */}
//   <div className="relative w-64 h-64 mt-6 mb-12">
//     <svg className="w-full h-full" viewBox="0 0 192 192">
//       <circle cx="96" cy="96" r="88" stroke="#e6edf1" strokeWidth="12" fill="none" />
//       <circle
//         cx="96"
//         cy="96"
//         r="88"
//         stroke="#FFD166"
//         strokeWidth="12"
//         fill="none"
//         strokeDasharray={`${2 * Math.PI * 88}`}
//         strokeDashoffset={`${(2 * Math.PI * 88 * (100 - progress)) / 100}`}
//         strokeLinecap="round"
//         className="transition-all duration-500 ease-linear"
//         transform="rotate(-90 96 96)"
//       />
//     </svg>
//     <div className="absolute inset-0 flex items-center justify-center">
//       <p className="text-5xl font-bold text-[#2C4D63]">{formatTime(secondsLeft)}</p>
//     </div>
//   </div>

//   {/* ボタン */}
//   <div className="flex gap-4 mb-12">
//     {!isRunning ? (
//       <button
//         onClick={() => setIsRunning(true)}
//         className="bg-[#FFD166] hover:bg-[#F4C14B] text-[#2C4D63] font-semibold py-3 px-8 rounded-xl shadow-sm transition"
//       >
//         開始
//       </button>
//     ) : (
//       <button
//         onClick={() => setIsRunning(false)}
//         className="bg-[#B9DDEE] hover:bg-[#A5CBE1] text-[#2C4D63] font-semibold py-3 px-8 rounded-xl shadow-sm transition"
//       >
//         一時停止
//       </button>
//     )}
//     <button
//       onClick={handleComplete}
//       className="border border-gray-300 text-gray-500 font-medium py-3 px-8 rounded-xl hover:bg-gray-100 transition"
//     >
//       完了
//     </button>
//   </div>
// </div>
//     </AuthLayout>
//   );
// }


  return (
    <AuthLayout showCard={false} showFooter={false} whiteBg>
      <div className="flex flex-col items-center justify-start h-[85vh] -mt-4 pt-[10vh]">
        {/* タイトル */}
        <div className="text-center mt-2">
          <p className="text-xl font-semibold text-[#2c4d63] mb-1">
            ⏱️「{taskTitle}」の時間
          </p>
          <p className="text-sm text-gray-500">無理せず、ゆっくりいきましょう。</p>
        </div>

        {/* タイマー */}
        <div className="relative w-64 h-64 mt-6 mb-8">
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
            <p className="text-5xl font-bold text-[#2C4D63]">{formatTime(secondsLeft)}</p>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-5 mb-8">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="w-40 bg-[#FFD166] hover:bg-[#F4C14B] text-[#2C4D63] font-semibold py-3 rounded-xl shadow-sm transition"
            >
              開始
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="w-40 bg-[#B9DDEE] hover:bg-[#A5CBE1] text-[#2C4D63] font-semibold py-3 rounded-xl shadow-sm transition"
            >
              一時停止
            </button>
          )}
          <button
            onClick={handleComplete}
            className="w-40 border border-[#C8D3D8] text-[#5A6A71] font-medium py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition"
          >
            完了
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
