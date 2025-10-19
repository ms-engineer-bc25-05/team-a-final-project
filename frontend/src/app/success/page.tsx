"use client";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f4fbfd]">
      <h1 className="text-2xl font-bold text-[#2c4d63] mb-4">お支払いが完了しました 🎉</h1>
      <p className="text-[#2c4d63]">ご利用ありがとうございます。</p>
      <Link href="/" className="mt-6 text-blue-600 underline">
        トップに戻る
      </Link>
    </div>
  );
}
