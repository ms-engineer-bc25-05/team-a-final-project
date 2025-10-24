"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";

export default function HomePage() {
  const router = useRouter();
  const [showLogo, setShowLogo] = useState(true);

   /**
   * NOTE:
   * 4.5秒後にロゴをフェードアウトし、「はじめる」ボタンを表示する。
   * スプラッシュ的な導入アニメーションとして利用。
   */
  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthLayout showHeader={false} showCard={false}>
      <div className="relative flex min-h-screen flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {showLogo ? (

            <motion.img
              key="logo"
              src="images/motibo.png"
              alt="Motibo"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1.15, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              className="w-72 sm:w-80 h-auto mb-6 drop-shadow-[0_6px_18px_rgba(120,160,200,0.35)]"
            />
          ) : (

            <motion.div
              key="start-block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="absolute top-[42%] flex flex-col items-center gap-8"
            >
              <p className="text-[#2c4d63] text-base sm:text-lg font-semibold tracking-wide whitespace-nowrap">
                ちょうどいい時に、ちょうどいい提案を。
              </p>
              <button
                onClick={() => router.push("/register")}
                className="min-w-40 px-8 py-3 rounded-full bg-white/95 whitespace-nowrap
                           text-base sm:text-lg font-semibold text-[#2c4d63]
                           shadow-[0_6px_20px_rgba(120,160,200,0.25)] hover:bg-white hover:shadow-lg transition"
              >
                はじめる
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}
