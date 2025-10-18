"use client";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f4fbfd]">
      <h1 className="text-2xl font-bold text-[#2c4d63] mb-4">支払いがキャンセルされました 😢</h1>
      <p className="text-[#2c4d63]">再度お試しいただくか、プランを変更してください。</p>
      <Link href="/payment" className="mt-6 text-blue-600 underline">
        プラン変更に戻る
      </Link>
    </div>
  );
}
