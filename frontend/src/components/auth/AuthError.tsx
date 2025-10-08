"use client";

/**
 * NOTE:
 * Firebase Authentication のエラーコードを日本語に変換して表示。
 * エラーコードを直接渡せば、自動でメッセージを選んで出力します。
 */

const errorMessages: Record<string, string> = {
  "auth/email-already-in-use": "このメールアドレスはすでに登録されています。",
  "auth/invalid-email": "メールアドレスの形式が正しくありません。",
  "auth/weak-password": "パスワードは6文字以上にしてください。",
  "auth/user-not-found": "アカウントが見つかりません。",
  "auth/wrong-password": "メールアドレスまたはパスワードが間違っています。",
  "auth/missing-password": "パスワードを入力してください。",
  "auth/too-many-requests": "試行回数が多すぎます。しばらく待ってから再試行してください。",
  default: "認証に失敗しました。もう一度お試しください。",
};

export default function AuthError({ code }: { code: string }) {
  if (!code) return null;

  const message = errorMessages[code] || errorMessages.default;

  return (
    <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-md py-2 px-3 mt-2">
      {message}
    </p>
  );
}
