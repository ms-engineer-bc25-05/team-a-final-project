export type Suggestion = { id: string; title: string; minutes: number; tip?: string };
export type SuggestionsResponse = { ok: boolean; items: Suggestion[] };

export type Heartbeat = {
  id?: string;
  userId: string;
  sessionId?: string;
  elapsedTime: number;
  status: "running" | "paused" | "completed" | string;
  timestamp?: unknown;
  createdAt?: unknown;
};
export type HeartbeatsResponse = { ok: boolean; count: number; items: Heartbeat[] };
