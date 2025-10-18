"use client";

import { useState, useEffect, useCallback } from "react";

export type FreeTimeSectionProps = {
  label: string;
  onChange: (value: string) => void;
};

/**
 * NOTE:
 * 自由時間セクション（30分刻みセレクト）
 * - 開始時間と終了時間を選択
 * - 初期値あり（平日・休日で自動切替）
 * - エラー時は親に "invalid" を返す
 */
export default function FreeTimeSection({ label, onChange }: FreeTimeSectionProps) {
  const isWeekend = label.includes("休日");
  const [start, setStart] = useState(isWeekend ? "10:00" : "19:00");
  const [end, setEnd] = useState(isWeekend ? "13:00" : "22:00");
  const [error, setError] = useState("");

  const times = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, "0");
    const m = i % 2 === 0 ? "00" : "30";
    return `${h}:${m}`;
  });

  const handleChange = useCallback(
    (newStart: string, newEnd: string) => {
      if (newStart && newEnd) {
        const startNum = Number(newStart.replace(":", "."));
        const endNum = Number(newEnd.replace(":", "."));
        if (endNum <= startNum) {
          setError("終了時間は開始時間より後に設定してください。");
          onChange("invalid");
        } else {
          setError("");
          onChange(`${newStart}〜${newEnd}`);
        }
      }
    },
    [onChange]
  );

  useEffect(() => {
    handleChange(start, end);
  }, [start, end, handleChange]);

  return (
    <div className="mt-6">
      <label className="block text-[#2c4d63] font-semibold mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <select
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border border-[#c8dbe4] rounded-xl p-2 flex-1 bg-white"
        >
          <option value="">開始</option>
          {times.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <span className="text-gray-500">〜</span>

        <select
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border border-[#c8dbe4] rounded-xl p-2 flex-1 bg-white"
        >
          <option value="">終了</option>
          {times.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
