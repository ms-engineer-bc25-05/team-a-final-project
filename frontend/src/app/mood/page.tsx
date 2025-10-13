"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { Laugh, Smile, Frown } from "lucide-react";

/**
 * NOTE:
 * 気分選択画面 (/mood)
 * - AuthLayout を利用してログイン画面と統一感のあるカードUIに
 * - ユーザーが現在の気分（高い・普通・低い）を3択で選ぶ
 * - - 選択後は /api/mood にPOSTしてから提案ページ (/suggestions) へ遷移
 */
export default function MoodPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 現在選択されている気分（high / normal / low）を保持
  const moods = [
    { icon: <Laugh className="w-14 h-14" />, value: "high" },
    { icon: <Smile className="w-14 h-14" />, value: "normal" },
    { icon: <Frown className="w-14 h-14" />, value: "low" },
  ];

  // 気分アイコン選択時の処理
  const handleSelect = (value: string) => setSelectedMood(value);

  // 気分をAPIに送信
  const handleSubmit = async () => {
    if (!selectedMood) {
      alert("気分を選択してください！");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "abc123", // ← 仮ユーザー（後でFirebase Authで置き換える）
          mood: selectedMood,
        }),
      });      

      if (!res.ok) throw new Error("送信に失敗しました");

      const data = await res.json();
      console.log("✅ APIレスポンス:", data);


      // 次のページ（提案画面）へ遷移
      router.push("/suggestions");
    } catch (error) {
      console.error("❌ エラー:", error);
      alert("気分の送信に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="今の気分を選んでください">
      <div className="flex flex-col justify-between h-[420px]">
        {/* アイコン群:中央より少し上に配置 */}
        <div className="flex justify-center items-center flex-1 mt-[-30px]">
          <div className="flex justify-center gap-5">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleSelect(mood.value)}
                className={`flex items-center justify-center rounded-full w-24 h-24 border transition-all duration-200
                  ${
                    selectedMood === mood.value
                      ? "bg-[#e6f4fa] border-[#a5cbe1] text-[#ffb347] scale-110 shadow-sm"
                      : "text-[#9ab9c9] border-[#d7e6ec] hover:text-[#2c4d63] hover:bg-[#f2f8fb]"
                  }`}
              >
                {mood.icon}
              </button>
            ))}
          </div>
        </div>

        {/* 次へボタン */}
        <div className="mb-10">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full rounded-2xl py-2 font-semibold shadow-sm transition ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#b9ddee] hover:bg-[#ffd166] hover:text-[#2c4d63] text-[#2c4d63]"
            }`}
          >
            {loading ? "送信中..." : "次へ"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}