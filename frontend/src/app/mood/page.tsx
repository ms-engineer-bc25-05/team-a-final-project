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
 * - 選択後は次の提案ページ (/suggestions) へ遷移
 */
export default function MoodPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // 現在選択されている気分（high / normal / low）を保持
  const moods = [
    { icon: <Laugh className="w-14 h-14" />, value: "high" },
    { icon: <Smile className="w-14 h-14" />, value: "normal" },
    { icon: <Frown className="w-14 h-14" />, value: "low" },
  ];

  // 気分アイコン選択時の処理
  const handleSelect = (value: string) => setSelectedMood(value);

  // 「次へ」ボタン押下時の処理
  const handleSubmit = () => {
    if (!selectedMood) {
      alert("気分を選択してください！");
      return;
    }

     // TODO: 今後 POST /api/mood に送信する処理を追加予定
    console.log("選択された気分:", selectedMood);

    // 次のページ（提案画面）へ遷移
    router.push("/suggestions");
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
            className="w-full bg-[#b9ddee] hover:bg-[#ffd166] hover:text-[#2c4d63] text-[#2c4d63] font-semibold rounded-2xl py-2 shadow-sm transition"
          >
            次へ
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
