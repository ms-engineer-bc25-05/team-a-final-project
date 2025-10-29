// frontend/src/lib/api.ts

/** APIベースURL
 * 優先: NEXT_PUBLIC_API_URL
 * 互換: NEXT_PUBLIC_BACKEND_ORIGIN, NEXT_PUBLIC_API_BASE
 * 最後: http://localhost:4000
 */
const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || // ← 優先
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.replace(/\/+$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000";


/** 提案データ型 */
type Suggestion = {
   id: string;
   title: string;
   reason?: string;
   score?: number;
};

 
/** Preview などで API ベースURLが未設定/ダミーなら false */
export function isApiReady(): boolean {
  if (!BASE) return false;
  return !BASE.includes("example.invalid");
}

/** 共通：タイムアウト付き fetch */
async function request<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  if (!isApiReady()) {
    // API未接続時の安全なダミー（ページ側で分岐してメッセージ表示推奨）
    return [] as unknown as T;
  }

  const { timeoutMs = 10_000, ...rest } = init; 
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
//     const res = await fetch(`${BASE}${path}`, {
//       cache: "no-store",
//       headers: { "Content-Type": "application/json", ...(rest.headers || {}) },
//       signal: controller.signal,
//       ...rest,
//     });

//     if (!res.ok) {
//       const text = await res.text().catch(() => "");
//       throw new Error(`${rest.method ?? "GET"} ${path} failed: ${res.status} ${text}`.trim());
//     }
//     // JSONのみを想定
//     return (await res.json()) as T;
//   } finally {
//     clearTimeout(id);
//   }
// }const isAbsoluteUrl = /^https?:\/\//i.test(path);

const isAbsoluteUrl = /^https?:\/\//i.test(path);
const url = isAbsoluteUrl ? path : `${BASE}${path}`;

const res = await fetch(url, {
  cache: "no-store",
  headers: { "Content-Type": "application/json", ...(rest.headers || {}) },
  signal: controller.signal,
  ...rest,
});

if (!res.ok) {
  const text = await res.text().catch(() => "");
  throw new Error(`${rest.method ?? "GET"} ${path} failed: ${res.status} ${text}`.trim());
}

return (await res.json()) as T;
} finally {
clearTimeout(id);
}
}

type Json = unknown;

export async function getJson<T = Json>(path: string, init?: RequestInit & { timeoutMs?: number }) {
  return request<T>(path, { method: "GET", ...(init || {}) });
}

export async function postJson<T = Json>(
  path: string,
  body: unknown,
  init?: RequestInit & { timeoutMs?: number }
) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body), ...(init || {}) });
}

/* ========== 個別エンドポイントの薄いラッパ ========== */

/** /api/openai/short のレスポンス型（現状の実装に合わせて） */
export type ShortResponse = {
  prompt: string;
  reply: string;
  note?: string; // e.g. "fallback: local shortener"
};

/** ショート要約の呼び出し */
export function postShort(prompt: string, timeoutMs = 20_000) {
  return postJson<ShortResponse>("/api/openai/short", { prompt }, { timeoutMs });
}

/** 提案を取得するAPI */
export async function fetchSuggestions() {
  return getJson<Suggestion[]>("/api/suggestions");
}

