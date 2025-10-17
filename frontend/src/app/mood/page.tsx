"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { Laugh, Smile, Frown } from "lucide-react";
import { motion } from "framer-motion";

/**
 * NOTE:
 * トップページ（/mood）
 * - AuthLayoutのカードを非表示（showCard=false）
 */
export default function MoodPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const moods = [
    { icon: <Laugh className="w-14 h-14" />, value: "high" },
    { icon: <Smile className="w-14 h-14" />, value: "normal" },
    { icon: <Frown className="w-14 h-14" />, value: "low" },
  ];

  const handleSelect = (value: string) => setSelectedMood(value);

  const handleSubmit = async () => {
    if (!selectedMood) return alert("気分を選択してください！");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "abc123", mood: selectedMood }),
      });
      if (!res.ok) throw new Error("送信に失敗しました");
      router.push("/suggestions");
    } catch {
      alert("もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="今の気分を選んでください" showCard={false}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center h-[520px] mt-6"
      >
        {/* アイコン群 */}
        <div className="flex justify-center gap-8 mt-6 mb-16">
          {moods.map((mood) => (
            <motion.button
              key={mood.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(mood.value)}
              className={`flex items-center justify-center rounded-full w-24 h-24 border transition-all duration-200
                ${
                  selectedMood === mood.value
                    ? "bg-[#fff4d4] border-[#ffd166] text-[#d98a00] scale-110 shadow-sm"
                    : "text-[#9ab9c9] border-[#d7e6ec] hover:text-[#2c4d63] hover:bg-[#f5fbfd]"
                }`}
            >
              {mood.icon}
            </motion.button>
          ))}
        </div>

        {/* 次へボタン */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full max-w-[320px] rounded-2xl py-3 font-semibold shadow-sm transition mt-auto mb-12
            ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#9EC9D4] to-[#A8D8E6] text-[#2C4D63] hover:brightness-105"
            }`}
        >
          {loading ? "送信中..." : "次へ"}
        </motion.button>
      </motion.div>
    </AuthLayout>
  );
}
