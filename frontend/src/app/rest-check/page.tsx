"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AuthLayout from "@/components/auth/AuthLayout";

/**
 * NOTE:
 * 休む確認画面 (/rest-check)
 * - 提案カードを3回スキップした後に表示される
 * - 「休む」か「もう少しだけやる」かを選択し、次の画面へ遷移する
 */
export default function RestCheckPage() {
  const router = useRouter();

  /**
   * NOTE:
   * 「休む」ボタン押下時 → 休息完了画面 (/rest-done) へ遷移
   */
  const handleRest = () => router.push("/rest-done");

  /**
   * NOTE:
   * 「もう少しだけやる」ボタン押下時 → 提案画面 (/suggestions) に戻る
   */
  const handleContinue = () => router.push("/suggestions");

  return (
    <AuthLayout title="">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        // NOTE: スマホでは中央よりやや上に配置し、自然な視線位置に調整
        className="flex flex-col items-center text-center px-6 pt-16 pb-16 md:pt-24 md:pb-20"
      >
        <h1 className="text-2xl font-semibold mb-10 text-gray-800">
          今日は休みますか？
        </h1>

        <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
          {/* NOTE: メインボタン（休む） */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleRest}
            className="w-full bg-[#B7D7E8] text-[#2F4F4F] font-semibold py-3 rounded-2xl shadow-sm hover:bg-[#9CC9E2] transition"
          >
            休む
          </motion.button>

          {/* NOTE: サブボタン（もう少しだけやる） */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            className="w-full bg-white text-gray-700 py-3 rounded-2xl border border-gray-300 shadow-sm hover:bg-gray-50 transition"
          >
            もう少しだけやる
          </motion.button>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
