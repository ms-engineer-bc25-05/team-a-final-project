"use client";

/**
 * NOTE:
 * 認証・共通レイアウト。
 * 背景グラデーションとカードデザインを統一。
 * 他の画面（例：気分選択など）でも再利用してUI一貫性を保つ。
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
      {/* カード部分：高さと幅を固定 */}
      <div className="w-full max-w-sm min-h-[480px] bg-white rounded-3xl shadow-md p-8 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-center text-[#2c4d63] mb-6">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}
