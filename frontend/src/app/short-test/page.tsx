"use client";

import { useState } from "react";

// バックエンド /api/openai/short のレスポンス形式
type ShortResponse = {
  prompt: string;
  reply: string;
  note?: string;
};

export default function ShortTestPage() {
  const [prompt, setPrompt] = useState("ping from client");
  const [resp, setResp] = useState<ShortResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSend() {
    setLoading(true);
    setErr(null);
    setResp(null);

    try {
      // ★ 相対パスに変更（next.config.ts の rewrites 経由で http://localhost:4000 へ）
      const res = await fetch(`/api/openai/short`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: ShortResponse = await res.json();
      setResp(json);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
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
