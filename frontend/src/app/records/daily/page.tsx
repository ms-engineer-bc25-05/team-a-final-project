"use client";

import React, { JSX, useState } from "react";
import useSWR from "swr";
import AuthLayout from "@/components/auth/AuthLayout";
import Image from "next/image";
import FooterNav from "@/components/common/FooterNav";

type TabType = "daily" | "weekly" | "monthly";

type RecordItem = {
  id: string;
  emoji: string;
  title: string;
  minutes: number;
};

type RecordsResponse = {
  records: RecordItem[];
};

type HeroInfo = {
  level: number;
  title: string;
  xp: number;
  image: string;
};

// --- fetcher ---
const fetcher = async (url: string): Promise<RecordsResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

// --- fallbackData (モック) ---
const fallbackData: RecordsResponse = {
  records: [
    { id: "1", emoji: "🚶‍♂️", title: "散歩", minutes: 20 },
    { id: "2", emoji: "📚", title: "読書", minutes: 30 },
  ],
};

export default function RecordsDailyPage(): JSX.Element {
  const [tab, setTab] = useState<TabType>("daily");

  const hero: HeroInfo = {
    level: 5,
    title: "剣士",
    xp: 320,
    image: "/images/hero_lv5.png",
  };

  const { data, error, isLoading } = useSWR<RecordsResponse>(
    "/api/records/daily",
    fetcher,
    { fallbackData }
  );

  const records = data?.records ?? [];

  return (
    <AuthLayout showHeader={false} showCard={false}>
      <div className="flex min-h-screen flex-col items-center pb-24 pt-20">
        {/* Header */}
        <header className="mb-14 w-full max-w-[500px] text-center px-6">
          <h1 className="text-2xl font-bold text-[#2c4d63] mb-9 tracking-wide">
            今日のがんばり
          </h1>

          {/* タブ（カプセル型） */}
          <div className="flex justify-center gap-3 text-sm">
            {(["daily", "weekly", "monthly"] as TabType[]).map((key) => {
              const isActive = tab === key;
              const label = key === "daily" ? "日" : key === "weekly" ? "週" : "月";
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  type="button"
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
          {error && (
            <p className="mb-6 mx-auto max-w-[480px] rounded-[2rem] border border-[#D5EEF6] bg-[#F4FBFD] p-4 text-sm text-[#2c4d63] text-center">
              モックデータを表示中です
            </p>
          )}

          <div className="mb-7 text-center">
            {isLoading ? (
              <p className="text-sm text-[#547386]">読み込み中...</p>
            ) : (
              <p className="text-sm text-[#2c4d63]">
                本日 <span className="font-semibold">{records.length}件</span> 達成
              </p>
            )}
          </div>

          {records.length === 0 ? (
            <div className="mx-auto max-w-[480px] rounded-[2.2rem] border border-[#E5EEF0] bg-white/97 p-8 text-center shadow-sm">
              <p className="text-[15px] font-semibold text-[#2c4d63]">
                今日はまだ記録がありません
              </p>
              <p className="mt-1 text-sm text-[#547386]">
                「＋」ボタンから最初の記録を追加してみましょう
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-[480px] flex-col gap-5">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-[2.2rem] border border-[#E5EEF0] bg-white/97 px-7 py-6 shadow-sm backdrop-blur"
                >
                  <p className="text-[16px] text-[#2c4d63]">
                    {r.emoji} {r.title}
                  </p>
                  <p className="text-sm font-semibold text-[#547386]">
                    {r.minutes}分
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
