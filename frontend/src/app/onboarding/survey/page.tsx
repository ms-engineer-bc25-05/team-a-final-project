"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import AuthLayout from "@/components/auth/AuthLayout";
import FreeTimeSection from "@/components/survey/FreeTimeSection";

/**
 * NOTE:
 * アンケート画面（/onboarding/survey）
 * - 朝型/夜型の生活リズム
 * - 平日・休日の自由時間（セレクト＋30分刻み）
 * - 興味分野（複数選択・カードUI）
 * - 趣味を選択した場合にサブジャンル表示
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

  /** NOTE: 興味トグル（ON/OFF切替） */
  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  /** NOTE: フォーム送信 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return alert("ログイン情報が取得できません。再度ログインしてください。");

    if (!lifestyle || !freeTimeWeekday || !freeTimeWeekend)
      return alert("未入力の項目があります。");

    if (freeTimeWeekday === "invalid" || freeTimeWeekend === "invalid")
      return alert("終了時間は開始時間より後に設定してください。");

    const personalityMap: Record<string, string> = {
      "美味しい朝ごはんをゆっくり楽しむ": "マイペース型",
      "とにかく動き出して外に出る": "アクティブ型",
      "家でゴロゴロしながら好きなことをする": "インドア型",
      "友達と出かけたり新しいことに挑戦する": "アウトドア型",
    };

    const surveyData = {
      userId: user.uid,
      lifestyle,
      freeTimeWeekday,
      freeTimeWeekend,
      interests,
      personalityQ1: personalityMap[personalityQ1] || "",
      personalityQ2: personalityMap[personalityQ2] || "",
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData),
      });

      if (!res.ok) throw new Error("送信に失敗しました。");
      alert("アンケートを送信しました！");
      router.push("/mood");
    } catch {
      alert("ネットワークエラーが発生しました。");
    }
  };

  return (
    <AuthLayout title="アンケート" showCard={false}>
      <div className="min-h-screen bg-linear-to-b from-[#FAFCFD] to-[#F2F8FA] px-6 pt-8 pb-4 overflow-y-auto">
      <p className="text-sm sm:text-base text-[#527288] leading-relaxed text-center mt-2 mb-6">
       いくつかの質問に答えると、<br />
       あなたに合った“ちょうどいい行動”を提案します。
      </p>
        <form
          onSubmit={handleSubmit}
          className="space-y-8 w-full max-w-md mx-auto text-[#2C4D63]"
        >
          {/* 生活リズム */}
          <section>
            <h2 className="font-semibold mb-3 text-lg sm:text-xl">生活リズム</h2>
            <div className="flex gap-8 items-center">
              {["朝型", "夜型"].map((option) => (
                <label key={option} className="flex items-center gap-3 text-base sm:text-lg">
                  <input
                    type="radio"
                    name="lifestyle"
                    value={option}
                    checked={lifestyle === option}
                    onChange={(e) => setLifestyle(e.target.value)}
                    className="w-5 h-5 accent-[#8EC3E6]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </section>

          {/* 自由時間 */}
          <FreeTimeSection label="平日の自由時間（目安）" onChange={setFreeTimeWeekday} />
          <FreeTimeSection label="休日の自由時間（目安）" onChange={setFreeTimeWeekend} />

          {/* 興味分野 */}
          <section>
            <h2 className="font-semibold mb-2 text-base sm:text-lg">
              興味のあること（複数選択可）
            </h2>
            <p className="text-sm text-[#527288] mb-4">
              今のあなたが「気になること」や「楽しみたいこと」を選んでください。
            </p>

            {/* メインカテゴリ */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {["運動", "学習", "趣味", "生活改善", "自己啓発", "リラックス"].map((item) => (
                <label
                  key={item}
                  className={`flex items-center justify-center rounded-xl px-3 py-3 font-medium border text-[#2c4d63] transition
                  ${
                    interests.includes(item)
                      ? "bg-[#B9DDEE] border-[#7CB8D9] shadow-inner"
                      : "bg-[#F8FCFD] border-[#CFE4EB] hover:bg-[#E9F7FB]"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={item}
                    checked={interests.includes(item)}
                    onChange={() => toggleInterest(item)}
                    className="hidden"
                  />
                  {item}
                </label>
              ))}
            </div>

            {/* 趣味ジャンル（趣味を選んだ人のみ表示） */}
            {interests.includes("趣味") && (
              <div className="mt-5">
                <p className="font-semibold mb-2 text-base sm:text-lg">趣味のジャンル</p>
                <p className="text-sm text-[#527288] mb-3">
                  「趣味」を選んだ方は、当てはまるジャンルも選んでください。
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {["読書", "ゲーム", "映画鑑賞", "買い物"].map((sub) => (
                    <label
                      key={sub}
                      className={`flex items-center justify-center rounded-xl px-3 py-2 font-medium border transition
                      ${
                        interests.includes(sub)
                          ? "bg-[#D6ECF8] border-[#A8D2E8] shadow-inner"
                          : "bg-[#FFFFFF] border-[#D9E7ED] hover:bg-[#F4FAFB]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={sub}
                        checked={interests.includes(sub)}
                        onChange={() => toggleInterest(sub)}
                        className="hidden"
                      />
                      {sub}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 朝の質問 */}
          <section>
            <h2 className="font-semibold mb-2 text-base sm:text-lg">
              朝の時間が自由なら、どちらを選びますか？
            </h2>
            <div className="flex flex-col gap-2 text-sm sm:text-base">
              {["美味しい朝ごはんをゆっくり楽しむ", "とにかく動き出して外に出る"].map(
                (option) => (
                  <label key={option} className="flex items-center gap-2 font-medium">
                    <input
                      type="radio"
                      name="personalityQ1"
                      value={option}
                      checked={personalityQ1 === option}
                      onChange={(e) => setPersonalityQ1(e.target.value)}
                      className="w-5 h-5 accent-[#8EC3E6]"
                    />
                    {option}
                  </label>
                )
              )}
            </div>
          </section>

          {/* 休日の質問 */}
          <section>
            <h2 className="font-semibold mb-2 text-base sm:text-lg">
              休日は、どちらの過ごし方が好きですか？
            </h2>
            <div className="flex flex-col gap-2 text-sm sm:text-base">
              {[
                "家でゴロゴロしながら好きなことをする",
                "友達と出かけたり新しいことに挑戦する",
              ].map((option) => (
                <label key={option} className="flex items-center gap-2 font-medium">
                  <input
                    type="radio"
                    name="personalityQ2"
                    value={option}
                    checked={personalityQ2 === option}
                    onChange={(e) => setPersonalityQ2(e.target.value)}
                    className="w-5 h-5 accent-[#8EC3E6]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </section>

          {/* 送信ボタン */}
          <button
            type="submit"
            className="w-full bg-[#B9DDEE] hover:bg-[#A8D2E8] text-[#2C4D63] font-semibold rounded-2xl py-3 shadow-sm transition text-base sm:text-lg"
          >
            この内容で提案を受ける
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
