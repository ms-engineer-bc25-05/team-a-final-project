import FirebaseTest from "@/components/FirebaseTest";

async function getData() {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL + "/api/test",
    { cache: "no-store" } // SSRでキャッシュさせない
  );
  return res.json();
}

export default async function Home() {
  const data = await getData();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-600">Frontend</h1>
      <p>Backend says: {data.message}</p>

      {/* ✅ クライアント側（Firebase確認） */}
      <FirebaseTest />
    </div>
  );
}
