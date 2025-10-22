// frontend/src/app/suggestions-test/page.tsx
'use client';

import { useState } from 'react';

type Suggestion = {
  id?: string;
  title?: string;
  score?: number;
  minutes?: number;
  [k: string]: unknown;
};

function isSuggestionArray(x: unknown): x is Suggestion[] {
  return Array.isArray(x) && x.every((i) => typeof i === 'object' && i !== null);
}

function extractSuggestions(data: unknown): Suggestion[] {
  if (isSuggestionArray(data)) return data;
  if (typeof data === 'object' && data !== null) {
    const s = (data as Record<string, unknown>).suggestions;
    if (isSuggestionArray(s)) return s;
  }
  return [];
}

export default function SuggestionsTestPage() {
  const [topic, setTopic] = useState('運動');
  const [count, setCount] = useState(3);
  const [status, setStatus] = useState('');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const fetchSuggestions = async () => {
    setLoading(true);
    setErr('');
    setStatus('');
    setItems([]);

    try {
      const url = `/api/suggestions?topic=${encodeURIComponent(topic)}&count=${count}`;
      const res = await fetch(url, { cache: 'no-store' });
      setStatus(`${res.status} ${res.statusText}`);

      const data: unknown = await res.json().catch(() => ({} as unknown));
      const list = extractSuggestions(data);
      setItems(list);

      if (res.status === 429 && list.length === 0) {
        setErr('429（フォールバック）：suggestions が空でした');
      } else if (res.status !== 200 && res.status !== 429) {
        setErr(`Unexpected: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(`Network Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">/api/suggestions 接続確認</h1>

      <div className="space-y-2">
        <label className="block">
          <span className="text-sm">トピック</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </label>

        <label className="block">
          <span className="text-sm">件数</span>
          <input
            type="number"
            value={count}
            min={1}
            max={10}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-1 w-24 rounded border p-2"
          />
        </label>

        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="rounded-2xl px-4 py-2 shadow border hover:opacity-80 disabled:opacity-50"
        >
          {loading ? 'Loading…' : '取得する'}
        </button>
      </div>

      {status && <p className="text-sm text-gray-700">Status: {status}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      <p className="text-sm text-gray-600">topic: {topic} / count: {count}</p>

      <ul className="list-disc pl-6 space-y-2">
        {items.map((s, i) => (
          <li key={s.id ?? i}>
            <div className="font-medium">{s.title}</div>
            <div className="text-sm text-gray-600">
              id: {s.id ?? '(n/a)'} ・ score: {s.score ?? '-'} ・ {s.minutes ?? '-'}分
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
