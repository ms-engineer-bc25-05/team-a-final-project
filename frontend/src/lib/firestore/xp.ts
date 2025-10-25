import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/** NOTE: ユーザーXPを取得（存在しない場合は0） */
export async function fetchUserXP(userId: string): Promise<number> {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;
  const data = snap.data();
  return data.xp ?? 0;
}

/**
 * NOTE:
 * ユーザーのXPを加算・更新する。
 * - 初回ユーザー対応
 * - dailyLogsにタスク達成数を記録（JST基準）
 * - XP=0のときは更新をスキップ
 */
export async function addUserXP(
  userId: string,
  earned: number,
  reason = "task"
): Promise<number> {
  try {
    if (earned <= 0) {
      console.log("⏸️ XP=0 のため Firestore 更新をスキップしました。");
      return await fetchUserXP(userId); 
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const currentXP = userSnap.exists() ? userSnap.data().xp ?? 0 : 0;

    // NOTE: JST基準でdailyLogsキーを生成
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const today = jst.toISOString().split("T")[0];
    const dailyRef = doc(db, "users", userId, "dailyLogs", today);
    const dailySnap = await getDoc(dailyRef);
    const dailyCount = dailySnap.exists() ? dailySnap.data().count ?? 0 : 0;

    const newCount = dailyCount + 1;
    const newXP = currentXP + earned;

    await setDoc(
      userRef,
      {
        xp: newXP,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      dailyRef,
      {
        count: newCount,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );

    // NOTE: XP履歴ログを追加
    const logRef = collection(db, "users", userId, "xpLogs");
    await addDoc(logRef, {
      earned,
      reason,
      createdAt: serverTimestamp(),
    });

    console.log(`✨ ${earned} XP logged for ${userId} (${reason}), dailyCount: ${newCount}`);

    return newXP;
  } catch (error) {
    console.error("❌ XP更新エラー:", error);
    return 0;
  }
}
