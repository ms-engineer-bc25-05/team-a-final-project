import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/** Firestore内のユーザーXPを取得する */
export async function fetchUserXP(userId: string): Promise<number> {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;
  const data = snap.data();
  return data.xp ?? 0;
}

/**
 * FirestoreのXPを加算して保存する
 * - 初回ユーザー対応
 * - 更新日時付き
 * - XP履歴を users/{uid}/xpLogs に記録
 * - 🔥 1日3タスク達成でボーナスXPを付与
 * - 🚫 XP=0 の場合は更新スキップ
 */
export async function addUserXP(
  userId: string,
  earned: number,
  reason = "task"
): Promise<number> {
  try {
    // ✅ XP=0ならスキップ（15分未満タスクなど）
    if (earned <= 0) {
      console.log("⏸️ XP=0 のため Firestore 更新をスキップしました。");
      return await fetchUserXP(userId); // 現在XPを返す
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const currentXP = userSnap.exists() ? userSnap.data().xp ?? 0 : 0;

    // ✅ 今日の日付キー (例: "2025-10-25")
    const today = new Date().toISOString().split("T")[0];
    const dailyRef = doc(db, "users", userId, "dailyLogs", today);
    const dailySnap = await getDoc(dailyRef);
    const dailyCount = dailySnap.exists() ? dailySnap.data().count ?? 0 : 0;

    // ✅ タスク達成数更新
    const newCount = dailyCount + 1;
    let bonus = 0;

    // ✅ 1日3タスク達成ボーナス（例: +10XP）
    if (newCount === 3) {
      bonus = 10;
      console.log(`🎯 1日3タスク達成ボーナス: +${bonus} XP`);
    }

    const totalGain = earned + bonus;
    const newXP = currentXP + totalGain;

    // ✅ users/{uid} に合計XP更新
    await setDoc(
      userRef,
      {
        xp: newXP,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // ✅ 1日のタスクカウント更新
    await setDoc(
      dailyRef,
      {
        count: newCount,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );

    // ✅ XP履歴を追加
    const logRef = collection(db, "users", userId, "xpLogs");
    await addDoc(logRef, {
      earned,
      bonus,
      reason,
      createdAt: serverTimestamp(),
    });

    console.log(
      `✨ ${earned} (+${bonus}) XP logged for ${userId} (${reason}), dailyCount: ${newCount}`
    );

    return newXP;
  } catch (error) {
    console.error("❌ XP更新エラー:", error);
    return 0;
  }
}
