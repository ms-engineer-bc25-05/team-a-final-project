"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * NOTE:
 * TimeSelect コンポーネント
 * - 時間を「30分刻み」で選択できるカスタムドロップダウン
 * - 下方向にパネルを開く（top-full）
 * - 外部クリックで自動的に閉じる
 * - 選択時は即時反映＆閉じる
 */
type TimeSelectProps = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

function TimeSelect({ value, onChange, className = "" }: TimeSelectProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // 00:00〜23:30（30分刻み）
  const times = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const h = String(Math.floor(i / 2)).padStart(2, "0");
        const m = i % 2 === 0 ? "00" : "30";
        return `${h}:${m}`;
      }),
    []
  );

  // 外側クリックで閉じる
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* 表示ボタン */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full border border-[#c8dbe4] rounded-2xl px-4 py-3
                   bg-white text-[#2c4d63] text-lg sm:text-xl font-semibold
                   shadow-sm flex items-center justify-center gap-2"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value}
        <span aria-hidden className="text-[#2c4d63]/60">▼</span>
      </button>

      {/* 下にしか開かないパネル */}
      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 top-full mt-2 z-50 w-full
                     bg-white border border-[#c8dbe4] rounded-2xl shadow-lg
                     max-h-[240px] overflow-y-auto"
          role="listbox"
        >
          {times.map((t) => {
            const active = t === value;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onChange(t);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-lg
                            hover:bg-[#EAF6FB]
                            ${
                              active
                                ? "bg-[#B9DDEE] font-semibold text-[#2C4D63]"
                                : "text-[#2c4d63]"
                            }`}
                role="option"
                aria-selected={active}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * NOTE:
 * FreeTimeSection コンポーネント
 * - 開始・終了時間を個別に選択可能
 * - 妥当性チェック：終了 <= 開始 の場合はエラー表示
 * - 親コンポーネントに「start〜end」形式で通知
 */
export type FreeTimeSectionProps = {
  label: string;
  onChange: (value: string) => void;
};

export default function FreeTimeSection({ label, onChange }: FreeTimeSectionProps) {
  const isWeekend = label.includes("休日");
  const [start, setStart] = useState(isWeekend ? "10:00" : "19:00");
  const [end, setEnd] = useState(isWeekend ? "13:00" : "22:00");
  const [error, setError] = useState("");

  // 妥当性チェック
  useEffect(() => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const s = sh * 60 + sm;
    const e = eh * 60 + em;

    if (e <= s) {
      setError("終了時間は開始時間より後に設定してください。");
      onChange("invalid");
    } else {
      setError("");
      onChange(`${start}〜${end}`);
    }
  }, [start, end, onChange]);

  return (
    <div className="mt-8 sm:mt-10">
      <label className="block text-[#2c4d63] font-semibold mb-3 text-lg sm:text-xl">
        {label}
      </label>

      {/* 時間選択エリア */}
      <div className="flex items-start gap-3">
        <TimeSelect value={start} onChange={setStart} className="flex-1" />
        <span className="text-[#2c4d63] font-medium text-lg sm:text-xl mt-3">〜</span>
        <TimeSelect value={end} onChange={setEnd} className="flex-1" />
      </div>

      {error && <p className="text-red-500 text-sm sm:text-base mt-2">{error}</p>}
    </div>
  );
}
