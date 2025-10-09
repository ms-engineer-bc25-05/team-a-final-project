"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthInput from "./AuthInput";
import AuthError from "./AuthError";

// ✅ 入力ルール（Zodスキーマ）を更新
const schema = z.object({
  username: z
    .string()
    .min(2, "ユーザー名は2文字以上で入力してください")
    .max(20, "ユーザー名は20文字以内で入力してください")
    .optional(), // ← ログイン時は不要なので optional
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z
    .string()
    .min(6, "パスワードは6文字以上で入力してください")
    .max(20, "パスワードは20文字以内で入力してください"),
});

// 型を自動生成
type FormData = z.infer<typeof schema>;

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const isLogin = type === "login";
  const router = useRouter();
  const [authError, setAuthError] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setAuthError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        // ✅ 新規登録時に displayName にユーザー名を保存
        if (data.username) {
          await updateProfile(userCredential.user, {
            displayName: data.username,
          });
        }
      }

      router.push("/");
    } catch (err: any) {
      console.error("Firebase Auth error:", err);
      setAuthError(err.code);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ✅ 新規登録時のみユーザー名を表示 */}
      {!isLogin && (
        <AuthInput
          label="ユーザー名"
          type="text"
          placeholder="例：山田太郎"
          {...register("username")}
          error={errors.username?.message}
        />
      )}

      <AuthInput
        label="メールアドレス"
        type="email"
        placeholder="mail@example.com"
        {...register("email")}
        error={errors.email?.message}
      />

      <AuthInput
        label="パスワード"
        type="password"
        placeholder="半角英数字6文字以上"
        {...register("password")}
        error={errors.password?.message}
      />

      <AuthError code={authError} />

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
