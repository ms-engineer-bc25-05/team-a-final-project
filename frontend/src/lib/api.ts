// frontend/src/lib/api.ts

/** APIベースURL
 * 優先: NEXT_PUBLIC_API_URL
 * 互換: NEXT_PUBLIC_BACKEND_ORIGIN / NEXT_PUBLIC_API_BASE
 * 最後: http://localhost:4000
 */
const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || 
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.replace(/\/+$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000";

/** Preview などで API ベースURLが未設定/ダミーなら false */
export function isApiReady(): boolean {
  if (!BASE) return false;
  return !BASE.includes("example.invalid");
}

/** 共通：タイムアウト付き fetch(JSON想定) */
async function request<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  if (!isApiReady()) {
    // API未接続時の安全なダミー（ページ側で分岐表示推奨）
    return [] as unknown as T;
  }
  const { timeoutMs = 10_000, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {

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

/* ========== 型 ==========
   ※ 既存UI互換を保つため Suggestion は従来の形を維持
  　 （バックエンドが minutes/tip を返す場合は正規化で合わせる）
================================= */
export type Suggestion = {
  id: string;
  title: string;
  reason?: string; // BEの tip などをマップ
  score?: number;  // BEの minutes などをマップ
};

export type SuggestionsEnvelope = { ok?: unknown; items?: unknown[]; suggestions?: unknown[] };

export type Heartbeat = {
  id?: string;
  userId: string;
  sessionId?: string;
  elapsedTime: number;
  status: "running" | "paused" | "completed" | string;
  timestamp?: unknown;
  createdAt?: unknown;
};

export type HeartbeatsEnvelope = { ok: boolean; count: number; items: Heartbeat[] };

/* ========== 正規化ユーティリティ ========== */
function normalizeSuggestions(raw: unknown): Suggestion[] {
  const source: unknown[] = Array.isArray(raw)
    ? raw
    : (raw && typeof raw === "object" && Array.isArray((raw as { items?: unknown[] }).items))
    ? ((raw as { items?: unknown[] }).items ?? [])
    : (raw && typeof raw === "object" && Array.isArray((raw as { suggestions?: unknown[] }).suggestions))
    ? ((raw as { suggestions?: unknown[] }).suggestions ?? [])
    : [];

  return source
    .map((x, i) => {
      if (!x || typeof x !== "object") return null;
      const obj = x as Record<string, unknown>;

      const id =
        (typeof obj.id === "string" && obj.id) ||
        `sg_${Date.now()}_${i}`;

      const title =
        (typeof obj.title === "string" && obj.title) ||
        (typeof obj.name === "string" && obj.name) ||
        "Untitled";

      // tip -> reason、minutes -> score を正規化
      const reason =
        (typeof obj.reason === "string" && obj.reason) ||
        (typeof obj.tip === "string" && obj.tip) ||
        undefined;

      const score =
        typeof obj.score === "number"
          ? obj.score
          : typeof obj.minutes === "number"
          ? obj.minutes
          : undefined;

      const s: Suggestion = { id, title };
      if (reason) s.reason = reason;
      if (typeof score === "number") s.score = score;
      return s;
    })
    .filter((v): v is Suggestion => v !== null);
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

/** 安全に JSON を読む（429/非JSONでもベストエフォート） */
async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    try {
      const t = await res.text();
      return JSON.parse(t);
    } catch {
      return null;
    }
  }
}

/** 提案を取得（count 指定可）
 * - 2xx 以外（429 など）でも本文に {items|suggestions|配列} があれば正規化して返す
 */
export async function fetchSuggestions(count = 3): Promise<Suggestion[]> {
  const url = `${BASE}/api/suggestions?count=${encodeURIComponent(count)}`;
  const res = await fetch(url, { cache: "no-store" });
  const body = await safeJson(res);
  return normalizeSuggestions(body);
}

/* ==========================================
   Heartbeats: 一覧（GET）
   - 互換性維持のため、従来の getHeartbeats は Heartbeat[] を返却
   - 404（未実装）は空配列を返す（例外にしない）
   - 追加：exists フラグ付きで返す getHeartbeatsMeta を用意
     → 画面側で「未実装なら以降リクエストしない」等の制御に利用可能
   ========================================== */

/** 追加：existsフラグ付きの返却 */
export type HeartbeatsResult = { items: Heartbeat[]; exists: boolean };

/** 新関数（推奨）：exists 付き */
export async function getHeartbeatsMeta(userId: string, limit = 5): Promise<HeartbeatsResult> {
  const url = `${BASE}/api/heartbeats?userId=${encodeURIComponent(userId)}&limit=${Math.min(
    Math.max(limit, 1),
    50
  )}`;
  const res = await fetch(url, { cache: "no-store" });

  // ★ 404 は「エンドポイント未実装」とみなし、以降の呼び出し抑制に使えるよう exists=false を返す
  if (res.status === 404) return { items: [], exists: false };

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`/api/heartbeats HTTP ${res.status} ${text}`.trim());
  }

  const json: unknown = await res.json();
  const env =
    json && typeof json === "object"
      ? (json as { ok?: unknown; items?: unknown })
      : null;

  if (!env || env.ok !== true || !Array.isArray(env.items)) {
    return { items: [], exists: true };
  }
  return { items: env.items as Heartbeat[], exists: true };
}

/** 互換維持：従来の Heartbeat[] 返却版（内部で Meta を使用） */
export async function getHeartbeats(userId: string, limit = 5): Promise<Heartbeat[]> {
  const result = await getHeartbeatsMeta(userId, limit);
  return result.items;
}

/** Heartbeats: 1件POST（サーバ側で sessionId 自動生成を推奨） */
export async function postHeartbeat(payload: {
  userId: string;
  elapsedTime: number;
  status: "running" | "paused" | "completed" | string;
  timestamp?: string; // ISO（省略時サーバnow）
}) {
  return postJson<{ ok: boolean; message: string; sessionId?: string }>(`/api/heartbeat`, payload);
}

/** ベースURLも一応エクスポート（デバッグ用） */
export const API_BASE = BASE;
