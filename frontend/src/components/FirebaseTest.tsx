"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function FirebaseTest() {
  useEffect(() => {
    console.log("Firebase Auth instance:", auth);

    //NOTE: Firestore接続テストを追加
    import("@/lib/firestoreTest").then(({ testGetSurveys }) => {
      testGetSurveys(); 
    });
  }, []);

  return (
    <div className="mt-4 p-4 bg-yellow-50 border rounded">
      <p className="font-semibold text-gray-700">
        Firebase Auth 初期化確認ログをコンソールに出力しました
      </p>
      <p className="text-sm text-gray-500">
        (ブラウザの DevTools Console を開いて確認してください)
      </p>
    </div>
  );
}
