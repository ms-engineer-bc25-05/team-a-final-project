"use client";

import { createTask } from "@/lib/firestore/tasks";
import { useEffect } from "react";

export default function TestTaskPage() {
  useEffect(() => {
    (async () => {
      const id = await createTask({
        userId: "test-user",
        title: "集中タイマー30分",
        durationMin: 30,
      });
      console.log("✅ 作成されたタスクID:", id);
    })();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">タスク作成テスト中… コンソールを確認してください。</p>
    </div>
  );
}
