import express, { Request, Response } from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import serviceAccount from "../../serviceAccountKey.json";


const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover"
});

// Firestore初期化（serviceAccountを使う）
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

const db = admin.firestore();

// NOTE: Stripe Webhookを受けるルーター設定
router.post(
    "/webhook",
    bodyParser.raw({ type: "application/json"}),
    async (req: Request,res: Response): Promise<void> => {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

        if (!sig) {
            console.error("No stripe-signature header value was provided");
            res.status(400).send("Missing Stripe signature");
            return;
        }

        try {
            // NOTE: Stripe署名の検証
            const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            console.log("✅ Webhook verified:", event.type);

            if (event.type === "checkout.session.completed") {
                const session = event.data.object as Stripe.Checkout.Session;

                const metadata =session.metadata as {
                    userId?: string;
                    userEmail?: string;
                };
                
                await db.collection("payments").add({
                    userId: metadata?.userId ?? null,  
                    userEmail: metadata?.userEmail ?? session.customer_email ?? null,
                    amount_total: session.amount_total,
                    currency: session.currency,
                    status: session.payment_status,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                console.log("✅ Firestoreに支払い情報を登録しました");
            }

            res.sendStatus(200);

        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("❌ Webhook verification failed", err.message);
                res.status(400).send(`webhook Error: ${err.message}`);
            } else {
                console.error("❌ Unknown error in webhook:", err);
                res.status(400).send("Unknown Webhook Error");
            }
            
        }           
    }
);

export default router;