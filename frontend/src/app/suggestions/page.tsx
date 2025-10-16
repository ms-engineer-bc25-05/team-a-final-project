"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AuthLayout from "@/components/auth/AuthLayout";
import { Check } from "lucide-react";
import { isApiReady, postJson } from "@/lib/api";

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
          | { topic: string; count: number; suggestions: { id: string; title: string; reason: string; score: number }[] }
          | { id: string; title: string; reason: string; score: number }[] = await postJson(
          "/api/suggestions",
          { topic: "会議運営", count: 3 }
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
    <AuthLayout title="今のあなたへの提案">
      <div className="flex flex-col min-h-[90vh] justify-between pb-10">

        {/* NOTE: 提案カードリスト（motionアニメーション付き） */}
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
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 bg-white transition shadow-sm ${
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
                  <h3 className="text-base font-semibold text-[#2c4d63]">{s.title}</h3>
                  <p className="text-xs text-gray-500">約 {s.time} で完了！</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>
                </div>
              </div>
              {selectedId === s.id && (
                <Check className="text-green-500 w-5 h-5 flex-shrink-0" strokeWidth={3} />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* NOTE: 画面下部の操作ボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="sticky bottom-4 flex flex-col gap-2 bg-white pt-3"
        >
          <button
            onClick={handleStart}
            disabled={isPending}
            className="bg-[#ffd166] hover:bg-[#f4c14b] text-[#2c4d63] font-semibold py-2 rounded-xl shadow-sm transition"
          >
            {isPending ? "遷移中..." : "開始"}
          </button>
          <button
            onClick={handleSkip}
            disabled={isPending}
            className="border border-[#b3d9e8] text-[#4b7a93] font-medium py-2 rounded-xl transition
          hover:bg-[#e3f4fa] active:bg-[#cdeaf6] active:text-[#2c4d63]"
          >
            スキップ（{skipCount}/3）
          </button>
        </motion.div>

        {/* NOTE: フッター（今後リンク先を実装予定） */}
        <div className="flex justify-around items-center mt-4 pt-3 border-t">
          <div className="flex flex-col items-center text-[#6ba4c5] text-xs">
            <span className="text-2xl">🏠</span> ホーム
          </div>
          <div className="flex flex-col items-center text-[#6ba4c5] text-xs">
            <span className="text-2xl">📊</span> 記録
          </div>
          <div className="flex flex-col items-center text-[#6ba4c5] text-xs">
            <span className="text-2xl">⚙️</span> 設定
          </div>
        </div>

      </div>
    </AuthLayout>
  );
}