import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Firestoreにタスクを追加する（初回で自動生成される）
 */
export async function createTask({
  userId,
  title,
  durationMin,
}: {
  userId: string;
  title: string;
  durationMin: number;
}) {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      userId,
      title,
      durationMin,
      createdAt: serverTimestamp(),
    });
    console.log("✅ タスク作成成功:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ タスク作成エラー:", error);
    throw error;
  }
}
