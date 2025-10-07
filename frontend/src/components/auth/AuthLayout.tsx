"use client";

/**
 * NOTE:
 * 認証関連ページ（ログイン・新規登録）の共通レイアウト。
 * 背景のグラデーションやフォーム枠の統一感を保つためのコンポーネント。
 */
export default function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#d4edf6] to-[#bcd7e5]">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-center text-[#2c4d63] mb-6">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
