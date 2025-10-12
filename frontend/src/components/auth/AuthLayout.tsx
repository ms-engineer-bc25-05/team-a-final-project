"use client";

/**
 * NOTE:
 * 認証・共通レイアウト。
 * 背景グラデーションとカードデザインを統一。
 * 各ページで呼吸感のある間隔を保つ。
 */
export default function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#d4edf6] to-[#bcd7e5] pt-16 pb-12">
      {/* カード部分 */}
      <div className="w-full max-w-sm min-h-[500px] bg-white rounded-3xl shadow-md p-8 flex flex-col justify-between">
        <div>
          {/* タイトルと下コンテンツの間を広めに */}
          <h1 className="text-2xl font-semibold text-center text-[#2c4d63] mb-5">
            {title}
          </h1>
          {/* ページ固有コンテンツ */}
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
