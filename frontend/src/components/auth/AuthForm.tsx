"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface AuthFormProps {
  type: "login" | "register";
}

// NOTE: 入力ルール（Zodスキーマ）
// - バリデーションルールを一元管理
// - 今後API仕様変更時もここを修正すればOK
const schema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z
    .string()
    .min(6, "パスワードは6文字以上で入力してください")
    .max(20, "パスワードは20文字以内で入力してください"),
});

// NOTE: Zodスキーマから型を自動生成（手動定義不要）
type FormData = z.infer<typeof schema>;

export default function AuthForm({ type }: AuthFormProps) {
  const isLogin = type === "login";

  // NOTE: react-hook-form 初期化
  // - resolver に zodResolver を指定してスキーマバリデーションを連携
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // NOTE: 送信処理（現時点ではダミー）
  // TODO: Firebase Auth や API連携時にここでPOSTリクエストを行う
  const onSubmit = (data: FormData) => {
    console.log("送信データ:", data);
    alert(`${isLogin ? "ログイン" : "登録"}情報を送信しました！`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* NOTE: メールアドレス入力欄 */}
      <div>
        <label className="block text-sm text-[#2c4d63] mb-1">メールアドレス</label>
        <input
          type="email"
          placeholder="example@mail.com"
          {...register("email")}
          className="w-full px-4 py-2 border border-[#c8dbe4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5cbe1]"
        />
        {/* NOTE: エラーメッセージ表示 */}
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* NOTE: パスワード入力欄 */}
      <div>
        <label className="block text-sm text-[#2c4d63] mb-1">パスワード</label>
        <input
          type="password"
          placeholder="••••••••"
          {...register("password")}
          className="w-full px-4 py-2 border border-[#c8dbe4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5cbe1]"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* NOTE: 送信ボタン */}
      <button
        type="submit"
        className="w-full bg-[#b9ddee] hover:bg-[#a8d2e8] text-[#2c4d63] font-semibold rounded-2xl py-2 shadow-sm transition"
      >
        {isLogin ? "ログインする" : "登録する"}
      </button>

      {/* NOTE: ページ遷移リンク（ログイン⇔登録） */}
      <p className="text-center text-sm text-[#5d7c8a] mt-4">
        {isLogin ? (
          <>
            アカウントをお持ちでない方は{" "}
            <Link
              href="/register"
              className="text-[#4d90a6] font-semibold underline-offset-2 hover:underline"
            >
              新規登録
            </Link>
          </>
        ) : (
          <>
            すでにアカウントをお持ちの方は{" "}
            <Link
              href="/login"
              className="text-[#4d90a6] font-semibold underline-offset-2 hover:underline"
            >
              ログイン
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
