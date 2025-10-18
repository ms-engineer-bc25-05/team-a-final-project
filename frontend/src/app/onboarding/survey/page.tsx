"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import FreeTimeSection from "@/components/survey/FreeTimeSection";

/**
 * NOTE:
 * アンケート画面（/onboarding/survey）
 * - 朝型/夜型の生活リズム
 * - 平日・休日の自由時間（セレクト＋30分刻み）
 * - 興味分野（複数選択）
 * - タイプ診断（2問）
 * - /api/surveys へ POST → 成功時 /mood へ遷移
 */
export default function SurveyPage() {
  const router = useRouter();

  const [lifestyle, setLifestyle] = useState("");
  const [freeTimeWeekday, setFreeTimeWeekday] = useState("");
  const [freeTimeWeekend, setFreeTimeWeekend] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [personalityQ1, setPersonalityQ1] = useState("");
  const [personalityQ2, setPersonalityQ2] = useState("");

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lifestyle || !freeTimeWeekday || !freeTimeWeekend) {
      alert("未入力の項目があります。");
      return;
    }

    if (freeTimeWeekday === "invalid" || freeTimeWeekend === "invalid") {
      alert("終了時間は開始時間より後に設定してください。");
      return;
    }

    const surveyData = {
      userId: "abc123",
      lifestyle,
      freeTimeWeekday,
      freeTimeWeekend,
      interests,
      personalityQ1,
      personalityQ2,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(`送信に失敗しました: ${result.message || "不明なエラー"}`);
        return;
      }

      alert("アンケートを送信しました！");
      router.push("/mood");
    } catch (error) {
      alert("ネットワークエラーが発生しました。");
      console.error(error);
    }
  };

  return (
    <AuthLayout title="アンケート" showCard={false} >
      <div className="min-h-screen bg-gradient-to-b from-[#FAFCFD] to-[#F2F8FA] px-6 py-10 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 w-full max-w-md mx-auto text-[#2C4D63]"
        >
          {/* 生活リズム */}
          <div>
            <label className="block font-semibold mb-2 text-base sm:text-lg">
              生活リズム
            </label>
            <div className="flex gap-6">
              {["朝型", "夜型"].map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm sm:text-base">
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

          {/* 自由時間 */}
          <FreeTimeSection
            label="平日の自由時間（目安）"
            onChange={setFreeTimeWeekday}
          />
          <FreeTimeSection
            label="休日の自由時間（目安）"
            onChange={setFreeTimeWeekend}
          />

          {/* 興味分野 */}
          <div>
            <label className="block font-semibold mb-2 text-base sm:text-lg">
              興味のある分野（複数選択可）
            </label>

            {/* メインカテゴリ */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {["運動", "学習", "趣味", "生活改善", "リラックス", "自己啓発"].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 bg-[#F8FCFD] border border-[#CFE4EB] rounded-xl px-3 py-2 hover:bg-[#E9F7FB] transition"
                >
                  <input
                    type="checkbox"
                    value={item}
                    checked={interests.includes(item)}
                    onChange={() => toggleInterest(item)}
                  />
                  {item}
                </label>
              ))}
            </div>

            {/* 趣味サブカテゴリ */}
            {interests.includes("趣味") && (
              <div className="ml-2 grid grid-cols-2 gap-3 text-sm text-[#2c4d63]">
                {["読書", "ゲーム", "映画鑑賞", "買い物"].map((sub) => (
                  <label
                    key={sub}
                    className="flex items-center gap-2 bg-white border border-[#D9E7ED] rounded-xl px-3 py-2 hover:bg-[#F4FAFB] transition"
                  >
                    <input
                      type="checkbox"
                      value={sub}
                      checked={interests.includes(sub)}
                      onChange={() => toggleInterest(sub)}
                    />
                    {sub}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* タイプ診断 */}
          <div>
            <p className="font-semibold mb-2 text-base sm:text-lg">
              朝の時間が自由なら、どちらを選びますか？
            </p>
            <div className="flex flex-col gap-2 text-sm sm:text-base">
              {["美味しい朝ごはんをゆっくり楽しむ", "とにかく動き出して外に出る"].map(
                (option) => (
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
                )
              )}
            </div>
          </div>

          <div>
            <p className="font-semibold mb-2 text-base sm:text-lg">
              休日は、どちらの過ごし方が好きですか？
            </p>
            <div className="flex flex-col gap-2 text-sm sm:text-base">
              {["家でゴロゴロしながら好きなことをする", "友達と出かけたり新しいことに挑戦する"].map(
                (option) => (
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
                )
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            className="w-full bg-[#B9DDEE] hover:bg-[#A8D2E8] text-[#2C4D63] font-semibold rounded-2xl py-3 shadow-sm transition text-base sm:text-lg"
          >
            回答を送信
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
