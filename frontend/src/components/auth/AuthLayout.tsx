"use client";

import { motion } from "framer-motion";
import FooterNav from "@/components/common/FooterNav";


/**
 * AuthLayout
 *
 * NOTE:
 * - 認証系画面の共通レイアウト。
 * - 柔らかい水色グラデーションを背景に採用。
 * - showCard が false の場合、白いカードを描画しない（moodページなどで使用）
 * - showFooter が true の場合、固定フッターを表示。
 */
export default function AuthLayout({
  title,
  children,
  showHeader = true,
  showCard = true, // ← デフォルトtrueに
  showFooter = false, // ← デフォルトfalseに
  whiteBg = false,
}: {
  title?: string;
  children: React.ReactNode;
  showHeader?: boolean;
  showCard?: boolean;
  showFooter?: boolean;
  whiteBg?: boolean;
}) {

  return (
    <div
      className={`flex justify-center items-center min-h-dvh px-safe py-safe
        ${whiteBg
          ? "bg-white" // 完全白
          : "bg-linear-to-b from-[#FDFDFC] via-[#EAF5F8] to-[#D9EDF3]"}`}
    >
       {/* メイン */}
      <motion.main
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className={`w-full max-w-[430px] min-h-[720px] flex flex-col items-center
          ${showCard
            ? "bg-white/90 backdrop-blur-md border border-[#E5EEF0] sm:rounded-4xl shadow-[0_8px_24px_rgba(170,200,210,0.25)]"
            : "bg-transparent"} 
          overflow-hidden`}
        
      >
        {/* ヘッダー */}
        {showHeader && title && (
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full text-center pt-20 pb-6"
          >
           <h1 className="text-[1.9rem] font-bold text-[#2C4D63] tracking-wide">{title}</h1>
          </motion.header>
        )}

        {/* コンテンツ */}
        <div className="flex-1 w-full flex flex-col items-center justify-start px-6 mt-2">
        {showCard ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
            className="w-full max-w-[340px] bg-white/85 border border-[#E3EBEE]
                       rounded-2xl p-6 shadow-[0_4px_12px_rgba(180,200,210,0.15)]"
          >
            {children}
          </motion.div>
        ) : (
            <>{children}</> 
          )}
         </div>
        </motion.main>

        {/* フッター */}
        {/* ✅ フッター（絶対固定） */}
       {showFooter && (
         <div className="fixed bottom-0 left-0 right-0 z-50">
        <FooterNav />
        </div>
        )}
    </div>
  );
}
