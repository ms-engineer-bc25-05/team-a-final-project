"use client";

import "@/lib/firebase";
import { useState } from "react";
import { getAuth } from "firebase/auth";
import AuthLayout from "@/components/auth/AuthLayout";

/**
 * NOTE:
 * Stripe Checkout（単発決済）のテスト課金ページ。
 * - API: POST /api/payments/create-checkout-session
 * - 機能: 決済ボタンを押すとStripeのCheckout画面にリダイレクト。
 */
export default function PaymentPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

/**
   * TODO:
   * 将来的には「ユーザーID」や「選択プラン情報」を含めて送信する。
   * 現時点では単発課金テストのためリクエストボディは空。
   */
    const handleCheckout = async () => {
        try {
            setLoading(true);
            setError(null);

            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                setError("ログインが必要です");
                return;
            }

            // NOTE: バックエンドのStrip Checkout APIを呼び出し
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) throw new Error("API URLが設定されていません");

            const res = await fetch(`${apiUrl}/api/payments/create-checkout-session`,{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userID: currentUser.uid,
                    userEmail: currentUser.email,
                })
            });


            if (!res.ok) throw new Error("リクエストに失敗しました");

            const data =await res.json();

            /**
             * NOTE:
             * 成功時: Stripeから返却されたCheckout URLに遷移。
             * URLはセッション固有なので、他人や別ブラウザでは無効になる点に注意。
             */
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("URLが取得できませんでした");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("Stripe Checkout Error:", err.message);
                setError(err.message);
            } else {
                console.error("Unexpected error:", err);
                setError("予期しないエラーが発生しました");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="プレミアムプラン">
          <div className="flex flex-col items-center gap-6">
             {/* NOTE: ページ説明 */}
             <p className="text-center text-[#2c4d63] text-sm leading-relaxed">
                LEVELアップ（Lv.10以上）をご希望の方は<br />
                プレミアムプランがおすすめです✨
             </p>

             {/* NOTE: Stripe Checkoutボタン */}
             <button
               onClick={handleCheckout}
               disabled={loading}
               className="w-full bg-[#b9ddee] hover:bg-[#a8d2e8] text-[#2c4d63] font-semibold rounded-2xl py-2 shadow-sm transition"
               >
                {loading ? "処理中..." : "プランを変更する"}
               </button>

                {/* NOTE: エラーメッセージ表示 */}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          </div>

          {/* TODO:
          - 成功時のリダイレクトページ（/success）
          - キャンセル時のページ（/cancel）
          を次ステップで作成予定。 */}

        </AuthLayout>
    );
}