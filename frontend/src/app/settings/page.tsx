"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";

/**
 * NOTE:
 * 設定ページ (/settings)
 * - アカウント情報（名前・メール・パスワード）
 * - 初回アンケートの再編集（アンケート画面と同一UI）
 * - プラン管理（/payment へ遷移）
 * - デモ用（API通信なし）
 */
export default function SettingsPage() {
  const router = useRouter();

  // アカウント情報
  const [name, setName] = useState("taro");
  const [email, setEmail] = useState("mail@example.com");
  const [password, setPassword] = useState("12345678");

  // アンケート項目
  const [lifestyle, setLifestyle] = useState("朝型");
  const [freeTimeWeekday, setFreeTimeWeekday] = useState("18:30 - 22:00");
  const [freeTimeWeekend, setFreeTimeWeekend] = useState("12:30 - 15:00");
  const [interests, setInterests] = useState<string[]>(["運動", "学習"]);
  const [personalityQ1, setPersonalityQ1] = useState("美味しい朝ごはんをゆっくり楽しむ");
  const [personalityQ2, setPersonalityQ2] = useState("家でゴロゴロしながら好きなことをする");

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const handleSave = () => {
    alert("デモ動作：設定を保存しました（API通信は未実装）");
  };

  return (
    <AuthLayout title="設定" showCard={false}>
      <div className="min-h-screen bg-gradient-to-b from-[#FAFCFD] to-[#F2F8FA] px-6 py-10 overflow-y-auto">
        <form className="space-y-8 w-full max-w-md mx-auto text-[#2C4D63]">
          {/* アカウント情報 */}
          <section>
          <h2 className="block text-[#2c4d63] font-semibold mb-3 text-lg sm:text-xl">アカウント情報</h2>

            <div className="space-y-3 text-sm">
              <label className="block font-medium">
                名前
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E5EEF0] p-2 text-sm focus:ring-1 focus:ring-[#6BB7D6]"
                />
              </label>

              <label className="block font-medium">
                メールアドレス
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E5EEF0] p-2 text-sm focus:ring-1 focus:ring-[#6BB7D6]"
                />
              </label>

              <label className="block font-medium">
                パスワード
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E5EEF0] p-2 text-sm focus:ring-1 focus:ring-[#6BB7D6]"
                />
              </label>
            </div>
          </section>

          {/* 初回アンケート再編集 */}
          <section>
          <h2 className="block text-[#2c4d63] font-semibold mb-3 text-lg sm:text-xl">初回アンケートの再編集</h2>

            {/* 生活リズム */}
            <div>
              <label className="block font-semibold mb-2 text-base">生活リズム</label>
              <div className="flex gap-6">
                {["朝型", "夜型"].map((option) => (
                  <label key={option} className="flex items-center gap-2 text-base">
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
            <div className="mt-5 space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-base">
                  平日の自由時間（目安）
                </label>
                <input
                  type="text"
                  value={freeTimeWeekday}
                  onChange={(e) => setFreeTimeWeekday(e.target.value)}
                  placeholder="例: 18:30 - 22:00"
                  className="w-full rounded-xl border border-[#E5EEF0] p-2 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-base">
                  休日の自由時間（目安）
                </label>
                <input
                  type="text"
                  value={freeTimeWeekend}
                  onChange={(e) => setFreeTimeWeekend(e.target.value)}
                  placeholder="例: 12:30 - 15:00"
                  className="w-full rounded-xl border border-[#E5EEF0] p-2 text-sm"
                />
              </div>
            </div>

            {/* 興味分野 */}
            <div className="mt-6">
              <label className="block font-semibold mb-2 text-base">
                興味のある分野（複数選択可）
              </label>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {["運動", "学習", "趣味", "生活改善", "リラックス", "自己啓発"].map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 bg-[#F8FCFD] border rounded-xl px-3 py-2 hover:bg-[#E9F7FB] transition
                      ${
                        interests.includes(item)
                          ? "border-[#6BB7D6] bg-[#EAF6FB]"
                          : "border-[#CFE4EB]"
                      }`}
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
            </div>

            {/* タイプ診断 */}
            <div className="mt-8 space-y-6">
              <div>
                <p className="font-semibold mb-2 text-base">
                  朝の時間が自由なら、どちらを選びますか？
                </p>
                <div className="flex flex-col gap-2 text-base">
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
                <p className="font-semibold mb-2 text-base">
                  休日は、どちらの過ごし方が好きですか？
                </p>
                <div className="flex flex-col gap-2 text-base">
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
            </div>
          </section>

          {/* 保存ボタン */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              type="button"
              className="w-full bg-[#B9DDEE] hover:bg-[#A8D2E8] text-[#2C4D63] font-semibold rounded-2xl py-3 shadow-sm transition text-base"
            >
              保存する
            </button>
          </div>

          {/* プラン管理 */}
          <section className="mt-6 border-t border-[#E5EEF0] pt-6">
            <h2 className="text-lg font-semibold mb-3">プラン管理</h2>
            <button
              onClick={() => router.push("/payment")}
              type="button"
              className="w-full rounded-2xl border border-[#6BB7D6] text-[#2c4d63] py-3 font-medium hover:bg-[#eaf6fb] transition"
            >
              有料プランの確認・変更はこちら
            </button>
          </section>
        </form>
      </div>
    </AuthLayout>
  );
}
