import express, { Request, Response } from "express";
import Stripe from "stripe";

const router = express.Router();

// NOTE:　Stripe インスタンスを初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{ 
    apiVersion: "2024-06-20" as any,
});

// NOTE: Stripe Checkout セッションを生成し、支払い画面のURLを返す
router.post(
    "/create-checkout-session",
    async (req: Request, res: Response): Promise<void> => {
        try {
          // TODO: 将来的には認証済みユーザーIDをreq.bodyから受け取る
          const userId = "test-user-001";

          // NOTE: Checkout セッションを作成
          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                  price_data: {
                    currency: "jpy",
                    product_data: { name: "プレミアムプラン" },
                    unit_amount: 500,
                  },
                  quantity: 1,
                },
            ],
            metadata: {
              user_id: userId,
            },
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
          });
          // NOTE: フロントにStripe CheckoutのURLを返す
          res.status(200).json({ url: session.url });
        } catch (error) {
            //NOTE: Stripe API 呼び出しでエラーが発生した場合の処理
            console.error("決済が正常に完了できませんでした:" ,error);
            res.status(500).json({ error:"チェックアウトセッションの作成に失敗しました"})
        }
    }
);

export default router;