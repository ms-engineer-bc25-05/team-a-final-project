
"use client";

import { motion } from "framer-motion";
import FooterNav from "@/components/common/FooterNav";

/**
 * NOTE:
 * お疲れ様画面 (/rest-done)
 * - iPhoneのsafe-area対応済み（フッター固定）。
 */

export default function RestDonePage() {
  return (
    <div
      className="min-h-[100dvh] flex flex-col justify-between 
                 bg-gradient-to-b from-[#CDE9F6] via-[#E9F7FB] to-[#FDF6E3]
                 relative overflow-x-hidden"
    >
      {/* メインコンテンツ */}
      <div className="flex flex-col items-center justify-center text-center flex-1 space-y-6 pb-[100px] -mt-10">
        
        {/* 🌙 三日月（ふんわり光＋ゆっくりフェードイン） */}
        <motion.img
          src="/images/half-moon.png"
          alt="moon"
          className="w-36 h-36 mb-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* メッセージ：月の後にやさしく登場 */}
        <motion.h2
          className="text-lg sm:text-xl font-normal text-[#2c4d63]/90 tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          今はゆっくり休みましょう
        </motion.h2>
      </div>

      {/* フッター（固定＋ぼかし背景） */}
      <footer
        className="fixed bottom-[env(safe-area-inset-bottom)] left-0 right-0 z-50 
                   bg-white/80 backdrop-blur-md border-t border-[#DCE9EE]"
      >
        <FooterNav />
      </footer>
    </div>
  );
}
