// backend/src/services/openaiService.ts
import OpenAI from "openai";

const API_KEY = process.env.OPENAI_API_KEY || "";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * 10文字以内のローカル短縮（句読点や空白は除去して詰める）
 */
export function localShortener(text: string, max = 10): string {
  if (!text) return "";
  const cleaned = text.replace(/\s+/g, "");
  const trimmed = cleaned.replace(/[、。,.!！?？:：;；~〜]/g, "");
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

let client: OpenAI | null = null;
if (API_KEY) {
  client = new OpenAI({ apiKey: API_KEY });
}

/**
 * 可能なら OpenAI を使い、401/403/429 などはローカル短縮へフォールバック。
 * 例外は基本投げず、最終的に必ず文字列を返す。
 */
export async function simpleChat(prompt: string): Promise<string> {
  const safeFallback = () => localShortener(prompt);

  // APIキーが無い場合は即フォールバック
  if (!client) return safeFallback();

  try {
    const res = await client.responses.create({
      model: MODEL,
      input: [
        { role: "system", content: "ユーザー文を10文字以内の日本語で短く返してください。返答は短文のみ。" },
        { role: "user", content: prompt },
      ],
    });

    const out = (res as any).output_text?.trim() as string | undefined;
    const text = out || "";
    // OpenAI応答が長すぎる場合もローカルで詰めて10字以内保証
    return text && text.length <= 10 ? text : localShortener(text || prompt);
  } catch (e: any) {
    // ログだけ残してフォールバック
    const status = e?.status;
    const code = e?.code;
    console.error("🔴 OpenAI error (handled in simpleChat):", { status, code, message: e?.message });

    // よくあるフォールバック対象
    if (status === 401 || status === 403 || status === 429) return safeFallback();

    // それ以外のネットワーク系・一時障害などもフォールバック
    return safeFallback();
  }
}
