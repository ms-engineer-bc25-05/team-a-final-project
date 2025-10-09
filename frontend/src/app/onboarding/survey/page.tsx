"use client";

import { useState } from "react";

/**
 * NOTE:
 * アンケート画面（/onboarding/survey）
 * - 朝型/夜型の生活リズム
 * - 平日・休日の自由時間（共通3時間幅×3択＋自由入力）
 * - 興味分野（複数選択）
 * - タイプ診断（2問）
 * 現時点ではローカルstateで保持し、後続でFirestore/API連携予定。
 */

export default function SurveyPage() {
  // 各項目の状態管理
  const [lifestyle, setLifestyle] = useState("");
  const [freeTimeWeekday, setFreeTimeWeekday] = useState("");
  const [freeTimeWeekend, setFreeTimeWeekend] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [personalityQ1, setPersonalityQ1] = useState("");
  const [personalityQ2, setPersonalityQ2] = useState("");

  // 興味分野（複数選択）
  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : [...prev, value]
    );
  };

  // 送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const surveyData = {
      lifestyle,
      freeTimeWeekday,
      freeTimeWeekend,
      interests,
      personalityQ1,
      personalityQ2,
    };
    console.log("アンケート送信データ:", surveyData);
    alert("アンケートを送信しました！（現在はダミー処理）");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#e5f3f9] to-[#d4edf6] px-6 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-center text-[#2c4d63] mb-6">
          アンケート
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 生活リズム */}
          <div>
            <label className="block text-[#2c4d63] font-semibold mb-2">
              生活リズム
            </label>
            <div className="flex gap-4">
              {["朝型", "夜型"].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="lifestyle"
                    value={option}
                    checked={lifestyle === option}
                    onChange={(e) => setLifestyle(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* 自由時間（ハイブリッド） */}
          <div>
            <label className="block text-[#2c4d63] font-semibold mb-2">
              平日の自由時間（目安）
            </label>

            {/* プリセットボタン（平日） */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {["06:00〜09:00", "10:00〜13:00", "19:00〜22:00"].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFreeTimeWeekday(time)}
                  className={`px-2 py-1 rounded-xl border text-sm transition ${
                    freeTimeWeekday === time
                      ? "bg-[#b9ddee] border-[#a5cbe1] text-[#2c4d63]"
                      : "bg-white border-[#c8dbe4] text-[#5d7c8a]"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {/* 自由入力（平日） */}
            <input
              type="text"
              value={freeTimeWeekday}
              onChange={(e) => setFreeTimeWeekday(e.target.value)}
              placeholder="例：18:30〜22:00（自由入力も可）"
              className="w-full border border-[#c8dbe4] rounded-xl p-2"
            />

            <label className="block text-[#2c4d63] font-semibold mb-2 mt-6">
              休日の自由時間（目安）
            </label>

            {/* プリセットボタン（休日） */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {["08:00〜11:00", "13:00〜16:00", "19:00〜22:00"].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFreeTimeWeekend(time)}
                  className={`px-2 py-1 rounded-xl border text-sm transition ${
                    freeTimeWeekend === time
                      ? "bg-[#b9ddee] border-[#a5cbe1] text-[#2c4d63]"
                      : "bg-white border-[#c8dbe4] text-[#5d7c8a]"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {/* 自由入力（休日） */}
            <input
              type="text"
              value={freeTimeWeekend}
              onChange={(e) => setFreeTimeWeekend(e.target.value)}
              placeholder="例：09:00〜21:00（自由入力も可）"
              className="w-full border border-[#c8dbe4] rounded-xl p-2"
            />
          </div>

          {/* 興味分野（複数選択） */}
          <div>
            <label className="block text-[#2c4d63] font-semibold mb-2">
              興味のある分野（複数選択可）
            </label>
            <div className="flex flex-wrap gap-3">
              {["運動", "学習", "趣味", "生活改善", "リラックス", "自己啓発"].map(
                (item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={item}
                      checked={interests.includes(item)}
                      onChange={() => toggleInterest(item)}
                    />
                    {item}
                  </label>
                )
              )}
            </div>
          </div>

          {/* タイプ診断① */}
          <div>
            <p className="text-[#2c4d63] font-semibold mb-1 sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis">
              朝の時間が自由なら、どちらを選びますか？
            </p>
            <div className="flex flex-col gap-2">
              {[
                "美味しい朝ごはんをゆっくり楽しむ",
                "とにかく動き出して外に出る",
              ].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="personalityQ1"
                    value={option}
                    checked={personalityQ1 === option}
                    onChange={(e) => setPersonalityQ1(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* タイプ診断② */}
          <div>
            <p className="text-[#2c4d63] font-semibold mb-1 sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis mt-4">
              お休みの日は、どちらの過ごし方が好きですか？
            </p>
            <div className="flex flex-col gap-2">
              {[
                "家でゴロゴロしながら好きなことをする",
                "友達と出かけたり新しいことに挑戦する",
              ].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="personalityQ2"
                    value={option}
                    checked={personalityQ2 === option}
                    onChange={(e) => setPersonalityQ2(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            className="w-full bg-[#b9ddee] hover:bg-[#a8d2e8] text-[#2c4d63] font-semibold rounded-2xl py-2 shadow-sm transition"
          >
            回答を送信
          </button>
        </form>
      </div>
    </div>
  );
}
