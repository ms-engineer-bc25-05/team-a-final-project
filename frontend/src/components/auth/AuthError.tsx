"use client";

/**
 * NOTE:
 * Firebase Authentication のエラーコードを日本語に変換して表示。
 * エラーコードを直接渡せば、自動でメッセージを選んで出力します。
 */

const errorMessages: Record<string, string> = {
   // === Firebase Auth 系 ===
  "auth/email-already-in-use": "このメールアドレスはすでに登録されています。",
  "auth/invalid-email": "メールアドレスの形式が正しくありません。",
  "auth/weak-password": "パスワードは6文字以上にしてください。",
  "auth/user-not-found": "アカウントが見つかりません。",
  "auth/wrong-password": "メールアドレスまたはパスワードが間違っています。",
  "auth/missing-password": "パスワードを入力してください。",
  "auth/too-many-requests": "試行回数が多すぎます。しばらく待ってから再試行してください。",

  // === Firestore / アプリ固有エラー ===
  "firestore/write-failed": "ユーザー情報の保存に失敗しました。",
  "app/user-not-found-in-firestore": "登録情報が確認できません。お手数ですが、新規登録をお願いいたします。",

  // デフォルト
  default: "認証またはデータ登録に失敗しました。もう一度お試しください。",
};

export default function AuthError({ code, message }: { code?: string; message?: string }) {
  if (!code && !message) return null;

  const resolvedMessage = (code && errorMessages[code]) || message || errorMessages.default;

  return (
    <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-md py-2 px-3 mt-2">
      {resolvedMessage}
    </p>
  );
}
