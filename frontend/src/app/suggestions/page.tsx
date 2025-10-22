"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AuthLayout from "@/components/auth/AuthLayout";
import { Check } from "lucide-react";
import { isApiReady, postJson } from "@/lib/api";
import FooterNav from "@/components/common/FooterNav";

/** デフォルトのトピック（必要に応じて一括変更可） */
const DEFAULT_TOPIC = "運動";

/**
 * NOTE:
 * 提案画面 (/suggestions)
 * - 提案を3回スキップすると「休む確認画面 (/rest-check)」へ遷移
 * - React19対応のため、状態更新と遷移を分離（useEffectで管理）
 */
export default function SuggestionsPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [skipCount, setSkipCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // NOTE: 現時点ではダミーデータ。将来的にAPI連携予定。
  // → APIが使える場合は起動時に差し替える（最小変更）
  const [suggestions, setSuggestions] = useState([
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
  ]);

  // 追加: 起動時にAPIが使えるなら取得して上書き（使えない場合は既存ダミーのまま）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!isApiReady()) return;
        // /api/suggestions を叩き、UI用の絵文字/時間を付加して既存の描画に合わせる
        const res:
          | { topic: string; count: number; suggestions: { id: string; title: string; reason?: string; score: number }[] }
          | { id: string; title: string; reason?: string; score: number }[] = await postJson(
          "/api/suggestions",
          { topic: DEFAULT_TOPIC, count: 3 }
        );
        const list = Array.isArray(res) ? res : res.suggestions;

        const emojis = ["🚶‍♂️", "📚", "✏️", "🧘", "🧹", "🍵"];
        const times = ["15分", "20分", "25分", "30分"];
        const mapped = list.slice(0, 3).map((s, i) => ({
          id: i + 1, // 既存の number id に合わせる
          emoji: emojis[i % emojis.length],
          title: s.title,
          time: times[i % times.length],
          description: s.reason || "少しだけ手を付けてみましょう。",
        }));

        if (!cancelled) setSuggestions(mapped);
      } catch {
        // 取得失敗時は何もしない（既存ダミーのまま）
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * NOTE:
   * skipCountが3以上になったタイミングで遷移を実行。
   * router.push() は useEffect内で呼び出すことで「レンダー中更新」エラーを回避。
   */
  useEffect(() => {
    if (skipCount >= 3) {
      startTransition(() => router.push("/rest-check"));
      setSkipCount(0); // 次回のスキップカウントをリセット
    }
  }, [skipCount, router, startTransition]);

  /**
   * NOTE:
   * 「開始」ボタン押下時
   * - 提案が未選択の場合は警告を表示
   * - 選択済みなら該当タスクのタイマー画面へ遷移
   */
  const handleStart = () => {
    if (!selectedId) {
      alert("提案を選択してください！");
      return;
    }
    startTransition(() => router.push(`/tasks/${selectedId}/timer`));
  };

  /**
   * NOTE:
   * 「スキップ」ボタン押下時
   * - カウントアップのみ実行（3回目はuseEffect側で遷移処理）
   */
  const handleSkip = () => {
    setSkipCount((prev) => prev + 1);
  };

  return (
    <AuthLayout showHeader={false} showCard={false}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-between min-h-[100dvh] px-5 pt-12 pb-[calc(env(safe-area-inset-bottom)+80px)]"
      >
        {/* タイトル */}
        <h1 className="text-2xl font-bold text-[#2c4d63] mb-6 text-center tracking-wide">
          あなたへの提案
        </h1>

        {/* 提案カード群 */}
        <div className="flex flex-col gap-4 sm:gap-5">
          {suggestions.map((s) => (
            <motion.button
              key={s.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedId(s.id)}
              className={`flex items-center justify-between rounded-[1.8rem] px-5 py-4 sm:px-6 sm:py-5 text-left transition-all duration-200 backdrop-blur-sm
                ${
                  selectedId === s.id
                    ? "bg-[#F0FAFF] border border-[#84C5E0] shadow-[0_6px_20px_rgba(100,160,190,0.3)]"
                    : "bg-white/95 border border-[#DCE9EF] shadow-[0_4px_12px_rgba(180,200,210,0.25)] hover:border-[#B9DBEA]"
                }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#E8F6FB] text-xl sm:text-2xl">
                  {s.emoji}
                </span>
                <div>
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-[#26485E] tracking-wide">
                    {s.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#547386]">{s.time}</p>
                  <p className="mt-0.5 text-[13px] sm:text-[14px] text-[#7A9AA9] leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
              {selectedId === s.id && (
                <Check className="text-[#2c4d63] w-5 h-5 flex-shrink-0" strokeWidth={3} />
              )}
            </motion.button>
          ))}
        </div>

        {/* 操作ボタン群 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col gap-3 mt-8"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            className="bg-[#FFD166] hover:bg-[#F4C14B] active:translate-y-[1px]
            text-[#2C4D63] font-semibold py-2.5 sm:py-3 rounded-2xl 
              shadow-[0_4px_10px_rgba(240,200,100,0.4)] transition-all duration-200"
            onClick={handleStart}
          >
            {isPending ? "送信中..." : "開始"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96, backgroundColor: "#CFEAF5" }}
            className="border border-[#B9DDEE]/70 text-[#3F6A80] font-medium py-2.5 sm:py-3 rounded-2xl 
            bg-white/70
              shadow-[inset_0_0_8px_rgba(160,200,220,0.15)] backdrop-blur-sm 
              transition-all duration-200"
            onClick={handleSkip}
          >
             スキップ
          </motion.button>
        </motion.div>

        <FooterNav />
      </motion.div>
    </AuthLayout>
  );
}

