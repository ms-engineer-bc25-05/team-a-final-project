"use client";

import FirebaseTest from "@/components/FirebaseTest";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

async function getData() {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/test",
    { cache: "no-store" } // SSRでキャッシュさせない
  );
  return res.json();
}

export default function Home() {
  const [data, setData] = useState<{ message: string } | null>(null);
  const { user,loading} = useAuth();

  useEffect(() => {
    (async () => {
      const res = await getData();
      setData(res);
    })();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold text-blue-600">Frontend</h1>
      <p>Backend says: {data?.message}</p>

      {/* ✅Firebase Auth 状態確認 */}
       {user ? (
        <p className="text-green-600">ログイン中：{user.email}</p>
       ) : (
         <p className="text-gray-500">未ログインです</p>
       )}

      {/* ✅ クライアント側（Firebase確認） */}
      <FirebaseTest />
    </div>
  );
}
