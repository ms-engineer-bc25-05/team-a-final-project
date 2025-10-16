// frontend/src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE || "";

/** Preview などで API ベースURLが未設定/ダミーなら false */
export function isApiReady(): boolean {
  if (!BASE) return false;
  // ざっくりダミー判定（必要なら調整）
  return !BASE.includes("example.invalid");
}

type Json = unknown;

export async function getJson<T = Json>(path: string, init?: RequestInit): Promise<T> {
  if (!isApiReady()) {
    // API未接続時の安全なダミー（ページ側で分岐してメッセージ表示推奨）
    return [] as unknown as T;
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function postJson<T = Json>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  if (!isApiReady()) {
    return { ok: true, mock: true } as unknown as T;
  }
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
    ...init,
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}