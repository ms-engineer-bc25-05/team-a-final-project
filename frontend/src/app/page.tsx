"use client";

import { useState } from "react";
import { postShort } from "@/lib/api"; // src/lib/api.ts の postShort を利用

// NOTE: バックエンド /api/openai/short のレスポンス形式と一致
type ShortResponse = {
  prompt: string;
  reply: string;
  note?: string; 
};

export default function ShortTestPage() {
  const [prompt, setPrompt] = useState("ping from client");
  const [resp, setResp] = useState<ShortResponse | null>(null);  // NOTE: 型修正
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSend() {
    setLoading(true);
    setErr(null);
    setResp(null);

    try {
      const r: ShortResponse = await postShort(prompt); // { prompt, reply, note }
      setResp(r);
    } catch (e) {
      if (e instanceof Error) {  // NOTE: 型修正
        setErr(e.message);
      } else {
        setErr(String(e));
      } 
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#F6FAFC] p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold">/api/openai/short テスト</h1>

        <div className="flex gap-2">
          <input
            className="border p-2 rounded w-full"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="prompt"
          />
          <button
            onClick={onSend}
            disabled={loading}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>

        {err && <pre className="text-red-600 whitespace-pre-wrap">{err}</pre>}
        {resp && (
          <pre className="bg-white border rounded p-3 whitespace-pre-wrap">
            {JSON.stringify(resp, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
