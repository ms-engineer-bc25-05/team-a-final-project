import { Router, Request, Response } from "express";
import { db } from "../config/firebase";
import { RecordData } from "../schemas/records";
// import { ZodError } from "zod";  // 今は使用しないためコメントアウト
import dayjs from "dayjs";

const router = Router();

/** GET /api/records/daily
 * 今日の行動を返す
 */
router.get("/daily", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ ok: false, message: "userId が必要です。"});
      return;
    }
    const today = dayjs().format("YYYY-MM-DD");

    const snapshot = await db
      .collection("records")
      .where("userId", "==", userId)
      .where("date", "==", today) 
      .get();
    
    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  
    res.status(200).json({
      ok: true,
      date: today,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("[GET /api/records/daily] エラー:", error);
    res.status(500).json({ ok:false, message:"サーバーエラーが発生しました。"});
    
  }
});
/** GET /api/records/weekly
 * 直近7日間の行動記録を返す
 */
router.get("/weekly", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ ok: false, message: "userId が必要です。"});
      return;
    }
    const end = dayjs();
    const start = end.subtract(6, "day");
    const startDate = start.format("YYYY-MM-DD");
    const endDate = end.format("YYYY-MM-DD");

    const snapshot = await db
      .collection("records")
      .where("userId", "==", userId)
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .orderBy("date", "desc")
      .get();
    
    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  
    res.status(200).json({
      ok: true,
      period: { start: startDate, end: endDate },
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("[GET /api/records/weekly] エラー:", error);
    res.status(500).json({ ok:false, message:"サーバーエラーが発生しました。"});
    
  }
});
/** GET /api/records/monthly
 * 今月の行動記録を返す
 */
router.get("/monthly", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ ok: false, message: "userId が必要です。"});
      return;
    }
    const now = dayjs();
    const prefix = now.format("YYYY-MM");

    const snapshot = await db
      .collection("records")
      .where("userId", "==", userId)
      .orderBy("date", "desc")
      .get();
    
    const records = snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data()) as RecordData }))
      .filter((rec) => rec.date?.startsWith(prefix));
  
    res.status(200).json({
      ok: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("[GET /api/records/monthly] エラー:", error);
    res.status(500).json({ ok:false, message:"サーバーエラーが発生しました。"});
    
  }
});

export default router;

