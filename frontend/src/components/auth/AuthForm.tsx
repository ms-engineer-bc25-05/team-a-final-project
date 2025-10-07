"use client";

import Link from "next/link";
import { useState } from "react";

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  // NOTE: 現時点ではフォーム値を保持のみ。後続でFirebase/API連携時に使用予定。
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = type === "login";

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm text-[#2c4d63] mb-1">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          className="w-full px-4 py-2 border border-[#c8dbe4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5cbe1]"
        />
      </div>

      <div>
        <label className="block text-sm text-[#2c4d63] mb-1">パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2 border border-[#c8dbe4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5cbe1]"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#b9ddee] hover:bg-[#a8d2e8] text-[#2c4d63] font-semibold rounded-2xl py-2 shadow-sm transition"
      >
        {isLogin ? "ログインする" : "登録する"}
      </button>

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
