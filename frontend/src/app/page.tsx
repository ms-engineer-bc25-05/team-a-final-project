"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import AuthLayout from "@/components/auth/AuthLayout";

export default function TopPage() {
  const router = useRouter();
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthLayout showHeader={false} showCard={false}>
      {/* NOTE: 全体をやや上に配置して、ブランドロゴを視覚的中央より少し上に見せる */}
      <div className="relative flex min-h-screen flex-col items-center justify-center text-center -translate-y-[14vh]">
        <AnimatePresence mode="wait">
          {showLogo ? (
            // NOTE: 起動画面（フェードイン・アウト付きロゴアニメーション）
            <motion.img
              key="logo"
              src="/images/motibo.png"
              alt="Motibo"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-72 sm:w-80 h-auto mb-6 drop-shadow-[0_6px_18px_rgba(120,160,200,0.35)]"
            />
          ) : (

            <motion.div
              key="start-block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center px-8"
            >
              {/* ブランドロゴ */}
              <motion.img
                src="/images/motibo-logo.png"
                alt="Motibo Logo"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="w-44 sm:w-44 h-auto mx-auto -mb-1.5"
              />

              {/* アプリ説明 */}
              <div className="mt-0 mb-2">
                <p className="text-[#2c4d63] text-base font-medium leading-relaxed tracking-wide max-w-[320px] mx-auto mb-2">
                  あなたの性格や気分に合わせて
                  <br />
                  “ちょうどいい行動”を提案してくれる、
                  <br />
                  スケジュール習慣化アプリです。
                </p>
                <p className="text-[#527288] text-sm mt-0.5">
                  今日から、ちょうどいい一歩を。
                </p>
              </div>

              {/* ボタン */}
              <motion.button
                onClick={() => router.push("/register")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="mt-2 px-12 py-4 rounded-full bg-[#cfe8fa] text-[#2c4d63] font-semibold text-lg shadow-md hover:bg-[#d9edfc] transition-colors"
              >
                はじめる
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}
