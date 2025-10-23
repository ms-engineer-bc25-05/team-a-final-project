"use client";

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { setCookie } from "cookies-next";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthInput from "./AuthInput";
import AuthError from "./AuthError";
import { FirebaseError } from "firebase/app";
import { motion } from "framer-motion";

/**
 * NOTE:
 * 入力ルール（Zodスキーマ）
 * - バリデーションルールを一元管理
 */
const schema = z.object({
  username: z
    .string()
    .min(2, "ユーザー名は2文字以上で入力してください")
    .max(20, "ユーザー名は20文字以内で入力してください")
    .optional(),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z
    .string()
    .min(6, "パスワードは6文字以上で入力してください")
    .max(20, "パスワードは20文字以内で入力してください"),
});

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

  /**
   * NOTE:
   * 認証処理
   */
  const onSubmit = async (data: FormData) => {
    setAuthError("");

    try {
      if (isLogin) {
        // === ログイン処理 ===
        const userCredential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        const userRef = doc(db, "users", userCredential.user.uid);
        const userSnap = await getDoc(userRef);

        const token = await userCredential.user.getIdToken();
        setCookie("firebaseToken", token);

        if (userSnap.exists()) {
          router.push("/mood");
        } else {
          setAuthError("app/user-not-found-in-firestore");
          router.push("/register");
        }
        return;
      }

      // === 新規登録処理 ===
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      if (data.username) {
        await updateProfile(userCredential.user, {
          displayName: data.username,
        });
      }

      // === Firestore登録（重複チェック付き）===
      try {
        const userRef = doc(db, "users", userCredential.user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          console.warn("既に登録済みのユーザーです:", userCredential.user.uid);
          setAuthError("auth/already-registered");
          router.push("/login");
          return;
        }

        await setDoc(userRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          username: data.username || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Firestore save error:", error);
        setAuthError("firestore/write-failed");
        return;
      }

      // === Cookie 保存 ===
      const token = await userCredential.user.getIdToken();
      setCookie("firebaseToken", token);

      // === アンケート画面に遷移 ===
      router.push("/onboarding/survey");
    } catch (err: unknown) {
      console.error("Firebase Auth error:", err);

      if (err instanceof FirebaseError) {
        setAuthError(err.code);
      } else if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError("予期せぬエラーが発生しました");
      }
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col gap-6 w-full max-w-[340px] mx-auto pt-2"
    >
      {/* === ユーザー名 === */}
      {!isLogin && (
        <AuthInput
          label="ユーザー名"
          type="text"
          placeholder="ニックネームまたは名前"
          {...register("username")}
          error={errors.username?.message}
        />
      )}

      {/* === メールアドレス === */}
      <AuthInput
        label="メールアドレス"
        type="email"
        placeholder="mail@example.com"
        {...register("email")}
        error={errors.email?.message}
      />

      {/* === パスワード === */}
      <AuthInput
        label="パスワード"
        type="password"
        placeholder="半角英数字6文字以上"
        {...register("password")}
        error={errors.password?.message}
      />

      {/* === エラーメッセージ === */}
      <AuthError code={authError} />

      {/* === 送信ボタン === */}
      <motion.button
        whileHover={{
          scale: 1.02,
          boxShadow: "0px 8px 18px rgba(160,200,210,0.25)",
        }}
        whileTap={{
          scale: 0.96,
          boxShadow: "0px 2px 8px rgba(140,180,190,0.2)",
        }}
        type="submit"
        className="w-full bg-linear-to-r from-[#9EC9D4] to-[#A8D8E6]
                   text-[#2C4D63] font-semibold py-3 rounded-xl
                   shadow-[0_4px_10px_rgba(150,190,200,0.25)]
                   hover:brightness-105 transition-all duration-300"
      >
        {isLogin ? "ログインする" : "登録する"}
      </motion.button>

      {/* === ログイン/登録リンク === */}
      <p className="text-center text-sm text-[#6B94A3] mt-2 leading-relaxed">
        {isLogin ? (
          <>
            アカウントをお持ちでない方は{" "}
            <Link
              href="/register"
              className="text-[#4B7A93] font-semibold underline-offset-2 hover:underline"
            >
              新規登録
            </Link>
          </>
        ) : (
          <>
            すでにアカウントをお持ちの方は{" "}
            <Link
              href="/login"
              className="text-[#4B7A93] font-semibold underline-offset-2 hover:underline"
            >
              ログイン
            </Link>
          </>
        )}
      </p>
    </motion.form>
  );
}
