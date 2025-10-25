"use client";

import React, { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { addUserXP, fetchUserXP } from "@/lib/firestore/xp";
import { getXPByDuration } from "@/lib/logic/xpRules";
import { getHeroLevel } from "@/hooks/getHeroLevel";

/**
 * NOTE:
 * - タスク完了画面 (/tasks/[id]/complete)
 * - Firestoreから durationMin を取得し、XP加算＆レベルアップ演出
 * - users/{uid} に XP と updatedAt を保存
 * - users/{uid}/xpLogs に履歴を記録
 */
export default function TaskCompletePage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Next.js 15: params は Promise なので use() で展開
  const { id } = React.use(params);

  const [xp, setXP] = useState<number | null>(null);
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Firebase Authユーザー取得
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsub();
  }, []);

  // ✅ タスクdurationを取得しXPを加算
  useEffect(() => {
    if (!userId) return;

    (async () => {
      // 1️⃣ Firestoreからタスク取得
      const taskRef = doc(db, "tasks", id);
      const taskSnap = await getDoc(taskRef);
      const taskDuration = taskSnap.exists()
        ? taskSnap.data().durationMin ?? 0
        : 0;
      const taskTitle = taskSnap.data()?.title ?? "Untitled Task";
      console.log("⏱️ タスク時間:", taskDuration);

      // 2️⃣ durationからXPを算出
      const xpToAdd = getXPByDuration(taskDuration);
      setEarnedXP(xpToAdd);

      // 3️⃣ 現在XPを取得
      const prevXP = await fetchUserXP(userId);

      // 4️⃣ FirestoreにXPを加算＋履歴記録
      const newXP = await addUserXP(userId, xpToAdd, taskTitle);
      setXP(newXP);

      // 5️⃣ レベルアップ判定
      const prevHero = getHeroLevel(prevXP);
      const newHero = getHeroLevel(newXP);
      if (newHero.level > prevHero.level) {
        setLeveledUp(true);
        setTimeout(() => setLeveledUp(false), 2000);
      }
    })();
  }, [userId, id]);

  const hero = getHeroLevel(xp ?? 0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#E7F5F8] to-[#F8FBFC] px-6 text-center">
      <div className="relative bg-white/80 backdrop-blur-xl border border-[#E5EEF0] rounded-[2rem] shadow-[0_8px_20px_rgba(170,200,210,0.25)] px-8 py-10 max-w-sm w-full overflow-hidden">

        {/* 🌟 レベルアップ演出 */}
        {leveledUp && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-yellow-200/40 to-transparent blur-2xl rounded-[2rem]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}

        {/* 🎉 タイトル */}
        <p className="text-[#2c4d63] text-xl font-bold mb-8 relative z-10">
          ✨ がんばりが光りました！ ✨
        </p>

        {/* 👤 レベル・称号 */}
        <p className="text-[#2c4d63] text-lg font-bold mb-1">
          Lv.{hero.level}：{hero.title}
        </p>

        {earnedXP === 0 ? (
        <p className="text-[#9ba6b2] text-base font-medium mt-2">
          ※15分未満のタスクはXP対象外です
        </p>
      ) : (
        <p className="text-[#2c4d63] text-base font-semibold mb-6">
          +{earnedXP} XP 獲得！（合計 {xp ?? "…"} XP）
        </p>
      )}

        {/* 🔘 ボタン */}
        <div className="flex flex-col gap-4 mt-4 relative z-10">
          <Link
            href="/mood"
            className="w-full bg-[#b9ddee] hover:bg-[#a8d2e8] text-[#2c4d63] py-3 rounded-2xl font-semibold shadow-[0_3px_6px_rgba(0,0,0,0.08)] transition active:scale-[0.98]"
          >
            もうひとつ進む
          </Link>
          <Link
            href="/records/daily"
            className="w-full bg-white hover:bg-[#f1f5f6] text-[#2c4d63] border border-[#b9ddee] py-3 rounded-2xl font-semibold shadow-[inset_0_0_6px_rgba(0,0,0,0.05)] transition active:scale-[0.98]"
          >
            振り返りを見る
          </Link>
        </div>
      </div>
    </div>
  );
}
