"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * NOTE:
 * トップページ（未ログイン時の入口）
 * - FocusMe のコンセプトを伝える軽やかな構成。
 * - 背景は朝の光のような柔らかい水色グラデーション。
 */
export default function HomePage() {
  return (
    <div
      className="flex flex-col justify-center items-center min-h-[100dvh]
                 bg-gradient-to-b from-[#FDFDFC] via-[#EAF5F8] to-[#D9EDF3]
                 px-6 text-center"
    >
      {/* ロゴ＆タイトル */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl font-bold text-[#2C4D63] mb-3 tracking-wide"
      >
        アプリ名
      </motion.h1>

      {/* キャッチコピー */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-[#6B94A3] text-sm mb-10"
      >
        🌿 今日も少し前に進もう
      </motion.p>

      {/* ボタン２つ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="flex flex-col gap-4 w-full max-w-[280px]"
      >
        <Link
          href="/login"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#9EC9D4] to-[#A8D8E6]
                     text-[#2C4D63] font-semibold shadow-md hover:brightness-105 transition"
        >
          ログイン
        </Link>

        <Link
          href="/register"
          className="w-full py-3 rounded-xl border border-[#A8D8E6]
                     text-[#4B7A93] font-medium hover:bg-[#F1F9FB] transition"
        >
          新規登録
        </Link>
      </motion.div>

      {/* フッター */}
      <footer className="mt-16 text-xs text-[#9AB6C3]">
        © 2025 アプリ名
      </footer>
    </div>
  );
}
