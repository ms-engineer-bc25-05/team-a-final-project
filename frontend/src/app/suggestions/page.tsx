"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import AuthLayout from "@/components/auth/AuthLayout";
import { Check } from "lucide-react";
import { isApiReady, postJson } from "@/lib/api";
import FooterNav from "@/components/common/FooterNav";

/** デフォルトのトピック（必要に応じて一括変更可） */
const DEFAULT_TOPIC = "運動";

/** Suggestion型定義 */
type Suggestion = {
  id: number;
  title: string;
  reason?: string;
  time: string;
  emoji: string;
  description: string;
};

/**
 * NOTE:
 * 提案画面 (/suggestions)
 * - APIから提案データを取得し、カードとして表示
 * - 提案を3回スキップすると「休む確認画面 (/rest-check)」へ遷移
 * - 「開始」で選択した提案に紐づくタイマー画面へ遷移
 */
export default function SuggestionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [skipCount, setSkipCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // NOTE: 現時点ではダミーデータ。API成功時に上書き。
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
    if (loading) {
      console.log("⏳ 認証セッション復元中...");
      return;
    }
    if (!user) {
      console.warn("⚠️ ユーザーが未ログインです");
      return;
    }
    let cancelled = false;
  
    (async () => {
      try {
        if (!isApiReady()) return;

        const user = auth.currentUser;
        if(!user) {
          console.warn("ユーザーが未ログインです");
          return;
        }
      
        console.log("🛰️ Fetching suggestions for:", user.uid);

        const res = await postJson<{ suggestions: Suggestion[] }>(
          "/api/suggestions", {
            topic: DEFAULT_TOPIC, // 例: "運動"
            count: 3,
            userId: user.uid,
            userProfile: {
              typeMorning: "朝方",
              freeTime: "3時間",
              interests: ["学習", "リラックス"],
              personality: ["マイペース型", "インドア型"],
            },
              mood: "やる気が低い",
          },
            { timeoutMs: 60000 }
        );
        console.log("✅ API response:", res);
       
        const list = res.suggestions;
        const emojis = ["🚶‍♂️", "📚", "✏️", "🧘", "🧹", "🍵"];
        const times = ["15分", "20分", "25分", "30分"];

        const mapped: Suggestion[] = list.slice(0, 3).map((s: Suggestion, i: number) => ({
          id: i + 1, // 既存の number id に合わせる
          emoji: emojis[i % emojis.length],
          title: s.title || `提案 ${i + 1}`,
          time: s.time || times[i % times.length],
          description: s.reason || "少しだけ手を付けてみましょう。",
        }));

        if (!cancelled) setSuggestions(mapped);
      } catch (err) {
        console.error("❌ Failed to fetch suggestions:", err);
        // 取得失敗時は何もしない（既存ダミーのまま）
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, user]);

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
        className="flex flex-col justify-between min-h-dvh px-5 pt-12 pb-[calc(env(safe-area-inset-bottom)+80px)]"
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
      className={`flex items-center justify-between w-full max-w-[500px] mx-auto min-h-[120px] 
        rounded-[1.8rem] px-6 py-4 sm:py-5 text-left transition-all duration-200 backdrop-blur-sm
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
          <p className="mt-0.5 text-[13px] sm:text-[14px] text-[#7A9AA9] leading-snug line-clamp-2">
            {s.description}
          </p>
        </div>
      </div>
      {selectedId === s.id && (
        <Check className="text-[#2c4d63] w-5 h-5 shrink-0" strokeWidth={3} />
      )}
    </motion.button>
  ))}
</div>
{/* 

{/* 操作ボタン群 */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1, duration: 0.4 }}
  className="flex flex-col gap-3 mt-8"
>
  {/* 開始ボタン */}
  <motion.button
    whileTap={{ scale: 0.97 }}
    className="relative w-full bg-linear-to-b from-[#FFE48C] to-[#FFD166]
             hover:from-[#FFE070] hover:to-[#F4C14B]
             text-[#2C4D63] font-semibold py-3 sm:py-3.5 rounded-2xl
             shadow-[0_6px_18px_rgba(255,209,102,0.45)]
             transition-all duration-300 transform hover:-translate-y-0.5"
    onClick={handleStart}
  >
    {isPending ? "送信中..." : "開始"}

    <span className="absolute inset-0 rounded-2xl bg-linear-to-t from-[#EFC94C]/20 to-transparent pointer-events-none" />

  </motion.button>

  {/* スキップボタン */}
  <motion.button
    whileTap={{ scale: 0.96 }}
    className="bg-white border border-[#C8E1EB] text-[#3F6A80] font-medium py-2.5 sm:py-3 rounded-2xl 
               shadow-[0_4px_12px_rgba(160,190,210,0.25)] hover:bg-[#F9FCFD] active:bg-[#EEF5F7]
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
