// route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // NOTE: ダミーデータ（バックエンド未接続時の代替）
  const data = {
    records: [
      { id: "1", emoji: "🚶‍♂️", title: "散歩", minutes: 20 },
      { id: "2", emoji: "📚", title: "読書", minutes: 30 },
    ],
  };
  return NextResponse.json(data);
}
