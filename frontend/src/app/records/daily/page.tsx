"use client";

import React, { JSX } from "react";
import useSWR from "swr";
import { useAuth } from "@/hooks/useAuth";
import AuthLayout from "@/components/auth/AuthLayout";
import Image from "next/image";
import FooterNav from "@/components/common/FooterNav";
import { useRouter, usePathname } from "next/navigation";
import { Gem, Sparkles } from "lucide-react";

console.log("🔧 NEXT_PUBLIC_API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

/**
 * NOTE:
 * - 振り返り画面（日・週・月切替対応）
 * - タブクリックで各ページに遷移 (/records/daily /records/weekly /records/monthly)
 */

type TabType = "daily" | "weekly" | "monthly";

type RecordItem = {
  id?: string;
  title: string;
  category?: string;
  duration?: number;
  reason?: string;
  xp?: number;
  date?: string;
};

type RecordsResponse = {
  ok: boolean;
  count: number;
  records: RecordItem[];
};

type HeroInfo = {
  level: number;
  title: string;
  xp: number;
  image: string;
};

const fetcher = async (url: string): Promise<RecordsResponse> => {
  console.log("🌐 Fetching URL:", url);
  const res = await fetch(url);
  console.log("🌐 Response URL (final):", res.url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export default function RecordsDailyPage(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  console.log("🔍 Current user.uid:", user?.uid);
  console.log("📘 SWR URL:", user ? `/api/records/daily?userId=${user.uid}` : "null");

  // NOTE: 現在のタブをURLから判定
  const currentTab: TabType =
    pathname.includes("weekly") 
    ? "weekly" :
    pathname.includes("monthly") 
    ? "monthly" 
    : "daily";

  const hero: HeroInfo = {
    level: 5,
    title: "剣士",
    xp: 320,
    image: "/images/hero_lv5.png",
  };

  const shouldFetch = !loading && !!user;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // NOTE: userが確定し、ロード完了後のみfetchする
  const apiUrl = shouldFetch
    ? `${baseUrl}/api/records/daily?userId=${user.uid}`
    : null;

  const { data, error, isLoading } = useSWR<RecordsResponse>(apiUrl, fetcher);

  console.log("🧩 loading:", loading);
  console.log("🧩 user:", user);
  console.log("🧩 apiUrl:", apiUrl);
  // const apiUrl = user ? `/api/records/daily?userId=${user.uid}` : null;
  // const { data, error, isLoading } = useSWR<RecordsResponse>(apiUrl, fetcher);


  if (loading) {
    return (
      <AuthLayout showHeader={false}>
        <div className="flex items-center justify-center h-screen text-[#547386]">
          ローディング中...
        </div>
      </AuthLayout>
    );
  }

  const records = data?.records ?? [];
  console.log("📘 Records fetched:", records);

  return (
    <AuthLayout showHeader={false} showCard={false}>
      <div className="flex min-h-screen flex-col items-center pb-24 pt-20">
        {/* Header */}
        <header className="mb-14 w-full max-w-[500px] text-center px-6">
          <h1 className="text-2xl font-bold text-[#2c4d63] mb-9 tracking-wide">
            今日のがんばり
          </h1>

          {/* カプセル型タブ */}
          <div className="flex justify-center gap-3 text-sm">
            {(["daily", "weekly", "monthly"] as TabType[]).map((key) => {
              const isActive = currentTab === key;
              const label = key === "daily" ? "日" : key === "weekly" ? "週" : "月";
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => router.push(`/records/${key}`)}
                  className={`px-7 py-2.5 rounded-full transition-all duration-200 font-medium
                    ${
                      isActive
                        ? "bg-[#6BB7D6] text-white shadow-sm"
                        : "bg-white/80 text-[#547386] border border-[#E5EEF0] hover:bg-[#eaf6fb]"
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Hero Section */}
        <section className="mb-12 flex w-full justify-center px-6">
          <div className="w-full max-w-[500px] flex flex-col items-center rounded-[2.2rem] border border-[#E5EEF0] bg-white/97 p-8 shadow-[0_12px_36px_rgba(170,200,210,0.35)] backdrop-blur">
            <Image
              src={hero.image}
              alt="hero"
              width={125}
              height={125}
              className="object-contain drop-shadow-sm"
              priority
              unoptimized
            />
            <p className="mt-3 text-base font-semibold text-[#2c4d63]">
              Lv.{hero.level} {hero.title}
            </p>
            <p className="text-sm text-[#547386]">累計 {hero.xp} XP</p>
          </div>
        </section>

        {/* Summary Section */}
        <section className="w-full max-w-[500px] px-6">

        {/* NOTE:
             エラー時（API未接続 or 通信失敗）
             - 開発中はモックデータ利用を案内
             - 本番API実装後はコメントアウト部分に切り替え予定
        */}

          {error && (
            <p className="mb-6 mx-auto max-w-[480px] rounded-4xl border border-[#D5EEF6] bg-[#F4FBFD] p-4 text-sm text-[#2c4d63] text-center">
              モックデータを表示中です
            </p>
          )}
          
        {/* FIXME: API実装後にこちらへ切り替え
             ※ JSX内には直接コメントアウトのHTMLを置けないため、ここに残しておく
             <p className="...">データの取得に失敗しました。再読み込みしてください。</p>
        */}

          <div className="mb-7 text-center">
            {isLoading ? (
              <p className="text-sm text-[#547386]">読み込み中...</p>
            ) : (
              <p className="text-base text-[#2c4d63] flex items-center justify-center gap-2">
                <Sparkles size={18} strokeWidth={2.3} className="text-[#E2C37E] drop-shadow-[0_0_2px_rgba(226,195,126,0.35)] translate-y-px" />
                本日 <span className="font-semibold">{records.length}件</span> 達成
              </p>
            )}
          </div>

          {records.length === 0 ? (
            <div className="mx-auto max-w-[480px] rounded-[2.2rem] border border-[#E5EEF0] bg-white/97 p-8 text-center shadow-sm">
              <p className="text-[15px] font-semibold text-[#2c4d63]">
                今日はまだ記録がありません
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-[480px] flex-col gap-5">
              {records.map((r, idx) => (
                <div
                key={idx}
                  className="flex items-center justify-between rounded-[2.2rem] border border-[#E5EEF0] bg-white/97 px-7 py-6 shadow-sm backdrop-blur"
                >
                  <p className="flex items-center gap-2 text-[16px] text-[#2c4d63]">
                  <Gem size={18} strokeWidth={2.4} className="text-[#6BB7D6] shrink-0 translate-y-px" /> 
                  {r.title}
                  </p>
                  <p className="text-sm font-semibold text-[#547386]">
                  {r.duration ?? 0}分
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <FooterNav />
      </div>
    </AuthLayout>
  );
}
