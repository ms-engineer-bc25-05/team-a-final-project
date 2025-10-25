// frontend/src/app/short-test/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  API_BASE,
  isApiReady,
  postShort,
  getHeartbeats,
  postHeartbeat,
  fetchSuggestions,
  type Heartbeat,
  type Suggestion,
} from "../../lib/api";

type ShortResponse = {
  prompt: string;
  reply: string;
  note?: string;
};

export default function ShortTestPage() {
  // ===== OpenAI Short =====
  const [prompt, setPrompt] = useState<string>("ping from client");
  const [shortResp, setShortResp] = useState<ShortResponse | null>(null);
  const [shortErr, setShortErr] = useState<string | null>(null);
  const [shortLoading, setShortLoading] = useState<boolean>(false);

  // ===== Heartbeats =====
  const [userId, setUserId] = useState<string>("seed-user");
  const [beats, setBeats] = useState<Heartbeat[]>([]);
  const [beatsErr, setBeatsErr] = useState<string | null>(null);
  const [beatsLoading, setBeatsLoading] = useState<boolean>(false);

  // ===== Suggestions =====
  const [sugs, setSugs] = useState<Suggestion[]>([]);
  const [sugsErr, setSugsErr] = useState<string | null>(null);
  const [sugsLoading, setSugsLoading] = useState<boolean>(false);

  const canCall = useMemo<boolean>(() => isApiReady(), []);

  // ---- actions ----
  const onSendShort = async (): Promise<void> => {
    setShortLoading(true);
    setShortErr(null);
    setShortResp(null);
    try {
      const json = await postShort(prompt, 20_000);
      setShortResp(json);
    } catch (e: unknown) {
      setShortErr(e instanceof Error ? e.message : String(e));
    } finally {
      setShortLoading(false);
    }
  };

  const loadBeats = useCallback(async (): Promise<void> => {
    if (!canCall) return;
    setBeatsLoading(true);
    setBeatsErr(null);
    try {
      const items = await getHeartbeats(userId, 5);
      setBeats(items ?? []);
    } catch (e: unknown) {
      setBeats([]);
      setBeatsErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBeatsLoading(false);
    }
  }, [canCall, userId]);

  const seedOneBeat = async (): Promise<void> => {
    if (!canCall) return;
    setBeatsLoading(true);
    setBeatsErr(null);
    try {
      await postHeartbeat({
        userId,
        elapsedTime: Math.floor(Math.random() * 240) + 30,
        status: "running",
        timestamp: new Date().toISOString(),
      });
      await loadBeats();
    } catch (e: unknown) {
      setBeatsErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBeatsLoading(false);
    }
  };

  const loadSugs = useCallback(async (): Promise<void> => {
    if (!canCall) return;
    setSugsLoading(true);
    setSugsErr(null);
    try {
      const items = await fetchSuggestions(3);
      setSugs(items ?? []);
    } catch (e: unknown) {
      setSugs([]);
      setSugsErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSugsLoading(false);
    }
  }, [canCall]);

  useEffect(() => {
    void (async () => {
      // 初回は Heartbeats だけ自動ロード
      await loadBeats();

      // （以前）初回に Suggestions も自動ロードしていた
      // await loadSugs(); // ← 自動ロードをやめ、Reload を押すまで空表示にする
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-[100dvh] bg-[#F6FAFC] p-6 space-y-10">
      <div className="max-w-5xl mx-auto space-y-2">
        <h1 className="text-2xl font-bold">Integration Test (/short-test)</h1>
        <p className="text-sm opacity-70">
          API_BASE: <code>{API_BASE}</code>{" "}
          {!canCall && <span className="text-red-600 ml-2">※ API未設定</span>}
        </p>
      </div>

      {/* ====== OpenAI Short ====== */}
      <section className="max-w-5xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold">1) /api/openai/short</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            className="border p-2 rounded w-full"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="prompt"
          />
          <button
            onClick={onSendShort}
            disabled={shortLoading}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {shortLoading ? "Sending..." : "Send"}
          </button>
        </div>
        {shortErr && <pre className="text-red-600 whitespace-pre-wrap">{shortErr}</pre>}
        {shortResp && (
          <pre className="bg-white border rounded p-3 whitespace-pre-wrap">
            {JSON.stringify(shortResp, null, 2)}
          </pre>
        )}
      </section>

      {/* ====== Heartbeats ====== */}
      <section className="max-w-5xl mx-auto space-y-3">
        <h2 className="text-xl font-semibold">2) /api/heartbeats （取得＆1件投入）</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="border rounded px-3 py-2"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="userId"
          />
          <button
            onClick={() => void loadBeats()}
            disabled={beatsLoading}
            className="rounded border px-4 py-2 shadow disabled:opacity-50"
          >
            {beatsLoading ? "Loading..." : "Reload"}
          </button>
          <button
            onClick={() => void seedOneBeat()}
            disabled={beatsLoading}
            className="rounded border px-4 py-2 shadow disabled:opacity-50"
          >
            Seed 1 Heartbeat
          </button>
          {beatsErr && <span className="text-red-600">{beatsErr}</span>}
        </div>

        <ul className="list-disc pl-6">
          {beats.length ? (
            beats.map((b, i) => (
              <li key={b.id ?? `beat-${i}`}>
                {b.userId} / {b.status} / {b.elapsedTime}s
              </li>
            ))
          ) : (
            <li className="opacity-60">
              データなし（GET未実装・userId不一致、または back 未起動の可能性）
            </li>
          )}
        </ul>
      </section>

      {/* ====== Suggestions ====== */}
      <section className="max-w-5xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold">3) /api/suggestions</h2>
        <div className="flex gap-2">
          <button
            onClick={() => void loadSugs()}
            disabled={sugsLoading}
            className="rounded border px-4 py-2 shadow disabled:opacity-50"
          >
            {sugsLoading ? "Loading..." : "Reload"}
          </button>
          {sugsErr && <span className="text-red-600">{sugsErr}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sugs.length ? (
            sugs.map((s) => (
              <div key={s.id} className="rounded-2xl border p-4 shadow-sm bg-white">
                <div className="font-semibold">{s.title}</div>
                {"score" in s && typeof s.score === "number" && (
                  <div className="opacity-70">目安: {s.score} 分</div>
                )}
                {"reason" in s && s.reason && (
                  <div className="text-sm opacity-80 mt-1">Tip: {s.reason}</div>
                )}
                <div className="mt-3 flex gap-2">
                  <button className="rounded-xl px-3 py-1 border shadow">今やる</button>
                  <button className="rounded-xl px-3 py-1 border shadow">スキップ</button>
                </div>
              </div>
            ))
          ) : (
            <div className="opacity-60">
              {/* 初回は自動ロードしない方針のため、Reload を押すまで空表示 */}
              /api/suggestions が未取得です。Reload を押してください。
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
