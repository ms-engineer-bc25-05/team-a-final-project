"use client";

import { motion } from "framer-motion";
import { use, useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { addUserXP, fetchUserXP } from "@/lib/firestore/xp";
import { getXPByDuration } from "@/lib/logic/xpRules";
import { getHeroLevel } from "@/hooks/getHeroLevel";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AuthLayout from "@/components/auth/AuthLayout";

/**
 * NOTE:
 * - タスク完了画面 (/tasks/[id]/complete)
 * - Firestoreから durationMin を取得 → XP加算＆レベル判定
 * - users/{uid} に XPを加算し履歴も記録
 */
export default function TaskCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [xp, setXP] = useState<number | null>(null);
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>("");

  // ✅ ログインユーザー監視
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsub();
  }, []);

  // ✅ Firestoreからタスクを取得 → XP処理
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const q = query(collection(db, "heartbeats"), where("sessionId", "==", id));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        console.error("❌ Task not found:", id);
        return;
      }

      const task = querySnap.docs[0].data();
      const taskDuration = task.elapsedTime ?? task.minutes ?? task.durationMin ?? 0;

      console.log("🧩 Task snapshot data:", task);

      setTaskTitle(task.title ?? "Untitled Task");

      console.log("⏱️ タスク時間:", taskDuration);

      // XP算出
      const xpToAdd = getXPByDuration(taskDuration);
      setEarnedXP(xpToAdd);

      // 現在XP取得
      const prevXP = await fetchUserXP(userId);

      // XP加算＋履歴保存
      const newXP = await addUserXP(userId, xpToAdd, task.title);
      setXP(newXP);

      // レベルアップ判定
      const prevHero = getHeroLevel(prevXP);
      const newHero = getHeroLevel(newXP);
      if (newHero.level > prevHero.level) {
        setLeveledUp(true);
        setTimeout(() => setLeveledUp(false), 2000);
      }
    })();
  }, [userId, id]);

  // 現在レベル情報
  const hero = getHeroLevel(xp ?? 0);

  if (xp === null) {
  return (
    <AuthLayout showHeader={false} showCard={false}>
       <div className="flex flex-1 flex-col items-center justify-start text-[#648091] mt-60">
        <p className="text-[#547386] text-sm animate-pulse">がんばりを記録中...</p>
       </div>
       </AuthLayout>
      );
    } 

  return (
    <AuthLayout showHeader={false} showCard={false}>
      <div className="relative flex min-h-screen flex-col items-center justify-between pb-24 pt-20 text-[#2c4d63]">

       {/* ふんわり光の演出 */}
      <div className="fixed inset-0 -z-10 bg-linear-to-b from-[#EAF6FB] via-[#F8FBFC] to-[#FFFFFF]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(185,221,238,0.35),transparent_70%)]" />
      
        {/* 見出し */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl font-bold mb-10 text-[#2c4d63] flex items-center gap-2"
        >
          お疲れさまでした！
        </motion.h1>

        {/* キャラカード */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex justify-center w-full px-6 mb-10"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              boxShadow: [
                "0 0 0 rgba(255,255,255,0)",
                "0 0 30px rgba(185,221,238,0.8)",
                "0 0 0 rgba(255,255,255,0)"
              ],
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-full max-w-[480px] flex flex-col items-center rounded-4xl border border-[#DCEAF0] bg-white/95 p-8 shadow-[0_8px_28px_rgba(180,210,225,0.35)] backdrop-blur-md"
          >
            <Image
              src={`/images/hero_lv${hero.level}.png`}
              alt={`Lv.${hero.level} ${hero.title}`}
              width={130}
              height={130}
              className="drop-shadow-[0_0_15px_rgba(185,221,238,0.7)]"
              unoptimized
              priority
            />
            <p className="mt-4 text-lg font-semibold text-[#2c4d63]">
              Lv.{hero.level} {hero.title}
            </p>
            <p className="text-base font-medium text-[#547386] mt-2">
              +{earnedXP} XP 獲得！（合計 {xp ?? "…"} XP）
            </p>
          </motion.div>
        </motion.section>

        {/* レベルアップ時の光エフェクト */}
        {leveledUp && (
        <motion.div
          className="absolute inset-0 bg-linear-to-tr from-yellow-200/40 to-transparent blur-2xl rounded-4xl`"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.8, 0.3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        )}

        {/* 一言メッセージ */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="text-[#476272] text-lg font-semibold tracking-wide leading-relaxed text-center mb-10"
        >
          {taskTitle}を完了!<br />
          <span className="text-[#2c4d63] font-semibold">よくがんばりました ☀️</span>
        </motion.p>

        {/* ボタン群 */}
        <div className="w-full max-w-[480px] flex flex-col items-center gap-4 px-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/suggestions")}
            className="w-full bg-linear-to-r from-[#B9DDEE] to-[#A7D4E8] text-[#2C4D63] font-semibold rounded-2xl py-3 shadow-[0_6px_14px_rgba(160,200,220,0.5)] hover:shadow-[0_4px_12px_rgba(140,190,210,0.6)] transition text-base sm:text-lg"
          >
            次の提案へ進む
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/records/daily")}
            className="w-full border border-[#CDE2EA] bg-white/80 hover:bg-[#F4FAFB] text-[#2C4D63] font-medium rounded-2xl py-3 shadow-sm transition text-base sm:text-lg"
          >
            振り返りを見る
          </motion.button>
        </div>
      </div>
    </AuthLayout>
  );
}
