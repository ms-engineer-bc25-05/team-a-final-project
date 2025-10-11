"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AuthLayout from "@/components/auth/AuthLayout";
import { Check } from "lucide-react";

/**
 * NOTE:
 * 提案画面 (/suggestions)
 * - 気分選択結果をもとに3件の提案を表示
 * - 提案を選択 → 「開始」ボタンで /task/[id]/timer へ遷移
 */
export default function SuggestionsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const router = useRouter();

  // NOTE: 現時点ではダミーデータを使用（今後API連携予定）
  const suggestions = [
    {
      id: 1,
      emoji: "🚶‍♂️",
      title: "散歩",
      time: "20分",
      description: "気分転換に軽く体を動かしてみましょう。",
    },
    {
      id: 2,
      emoji: "📚",
      title: "読書",
      time: "30分",
      description: "好きなジャンルの本を少しだけ読む時間に。",
    },
    {
      id: 3,
      emoji: "✏️",
      title: "英語学習",
      time: "25分",
      description: "短めのリスニングや英単語チェックでOKです。",
    },
  ];

  /**
   * NOTE:
   * 「開始」ボタン押下時の処理
   * - 提案が選択されていない場合は警告
   * - 選択済みならタイマー画面へ遷移
   */
  const handleStart = () => {
    if (!selectedId) {
      alert("提案を選択してください！");
      return;
    }
    router.push(`/task/${selectedId}/timer`);
  };

  return (
    <AuthLayout title="今のあなたへの提案">
      <div className="flex flex-col min-h-[90vh] justify-between pb-10">

        {/* NOTE: 提案カードリスト（フェードインアニメーション付き） */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-5 mt-16 mb-6 px-3"
        >
          {suggestions.map((s) => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.1 }}
              onClick={() => setSelectedId(s.id)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 bg-white transition shadow-sm
                ${
                  selectedId === s.id
                    ? "border-[#a5cbe1] bg-[#f4fbff] shadow-md"
                    : "border-gray-200 hover:bg-[#f9f9f9]"
                }`}
            >
              <div className="flex items-center gap-3 text-left">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e6f4fa] text-2xl">
                  {s.emoji}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#2c4d63]">
                    {s.title}
                  </h3>
                  <p className="text-xs text-gray-500">約 {s.time} で完了！</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.description}
                  </p>
                </div>
              </div>
              {selectedId === s.id && (
                <Check
                  className="text-green-500 w-5 h-5 flex-shrink-0"
                  strokeWidth={3}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* NOTE: 画面下部の操作ボタン（固定配置） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="sticky bottom-4 flex flex-col gap-2 bg-white pt-3"
        >
          <button
            onClick={handleStart}
            className="bg-[#ffd166] hover:bg-[#f4c14b] text-[#2c4d63] font-semibold py-2 rounded-xl shadow-sm transition"
          >
            開始
          </button>
          <button className="border border-gray-300 text-gray-500 font-medium py-2 rounded-xl">
            スキップ
          </button>
        </motion.div>

        {/* NOTE: フッターアイコン（現状はダミー） */}
        <div className="flex justify-around items-center mt-4 pt-3 border-t">
          <div className="flex flex-col items-center text-[#6ba4c5] text-xs">
            <span className="text-2xl">🏠</span>
            ホーム
          </div>
          <div className="flex flex-col items-center text-[#6ba4c5] text-xs">
            <span className="text-2xl">📊</span>
            記録
          </div>
          <div className="flex flex-col items-center text-[#6ba4c5] text-xs">
            <span className="text-2xl">⚙️</span>
            設定
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
