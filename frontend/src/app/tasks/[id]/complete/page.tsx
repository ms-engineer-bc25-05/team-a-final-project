"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useHeroLevel } from "@/hooks/useHeroLevel";
import { useState, useEffect } from "react";

/**
 * NOTE:
 * 実行完了画面 (/tasks/[id]/complete)
 * - タスク完了後に表示されるページ
 * - 獲得XPに応じてキャラクターや称号を切り替える
 * - レベルアップ時のみキャラが光るアニメーション演出あり
 * - 現時点ではXP値は仮データ（今後Firestore連携予定）
 * - eslint-disable コメントは、XP加算機能実装時にsetXP利用予定のため一時的に使用
 */

export default function TaskCompletePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [xp, setXP] = useState(245);
  const [earnedXP] = useState(10); // 今回の獲得XP
  const [leveledUp, setLeveledUp] = useState(false);

  const prevHero = useHeroLevel(xp);
  const newXP = xp + earnedXP;
  const newHero = useHeroLevel(newXP);

  useEffect(() => {
    if (newHero.level > prevHero.level) {
      setLeveledUp(true);
      const timer = setTimeout(() => setLeveledUp(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [newHero.level, prevHero.level]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#E7F5F8] to-[#F8FBFC] px-6 text-center">
      <div className="relative bg-white/80 backdrop-blur-xl border border-[#E5EEF0] rounded-[2rem] shadow-[0_8px_20px_rgba(170,200,210,0.25)] px-8 py-10 max-w-sm w-full overflow-hidden">
        
        {/* 光エフェクト：レベルアップ時のみ */}
        {leveledUp && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-yellow-200/40 to-transparent blur-2xl rounded-[2rem]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}

        {/* タイトル */}
        <p className="text-[#2c4d63] text-xl font-bold mb-8 relative z-10">
          🎉 お疲れさまです！
        </p>

        {/* キャラ画像 */}
        <motion.img
          key={newHero.image}
          src={newHero.image}
          alt={newHero.title}
          width={200}
          height={200}
          className="mx-auto mb-6 drop-shadow-md bg-transparent"
          style={{ imageRendering: "pixelated" }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale: leveledUp ? [1, 1.1, 1] : 1,
            opacity: 1,
          }}
          transition={{ duration: 0.6 }}
        />

        {/* レベルとXP */}
        <div className="relative z-10">
          <p className="text-[#2c4d63] text-lg font-bold mb-1">
            Lv.{newHero.level}：{newHero.title}
          </p>
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[#2c4d63] text-base font-semibold mb-6"
          >
            +{earnedXP} XP 獲得！
          </motion.p>
        </div>

        {/* ボタン群 */}
        <div className="flex flex-col gap-4 mt-4 relative z-10">
          <Link
            href="/mood"
            className="w-full bg-[#b9ddee] hover:bg-[#a8d2e8] text-[#2c4d63] py-3 rounded-2xl font-semibold shadow-[0_3px_6px_rgba(0,0,0,0.08)] transition active:scale-[0.98]"
          >
            もうひとつ進む
          </Link>
          <Link
            href="/record/daily"
            className="w-full bg-white hover:bg-[#f1f5f6] text-[#2c4d63] border border-[#b9ddee] py-3 rounded-2xl font-semibold shadow-[inset_0_0_6px_rgba(0,0,0,0.05)] transition active:scale-[0.98]"
          >
            振り返りを見る
          </Link>
        </div>
      </div>
    </div>
  );
}
