// backend/src/services/openaiService.ts
import OpenAI from "openai";

const API_KEY = process.env.OPENAI_API_KEY || "";
const MODEL = process.env.OPENAI_MODEL || "gpt-5-nano"; // NOTE: OpenAIのモデルを統一

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
    const res = await client.responses.create ({
      model: MODEL,
      input: [
        {
          role: "system", content: "ユーザー文を10文字以内の日本語で短く返してください。返答は短文のみ。"
        },
        { role: "user", content: prompt },
      ],
    });

    const out= res.output_text?.trim() ?? "";
    // OpenAI応答が長すぎる場合もローカルで詰めて10字以内保証
    return out && out.length <= 10 ? out : localShortener(out || prompt);
  } catch (e) {    // NOTE: 型修正、エラーハンドリング修正
    if (e instanceof Error) {
      console.error("🔴 OpenAI error (handled in simpleChat):", { 
        message: e.message
      });
    } else {
      console.error("🔴 Unknown error in simpleChat:", e);
    }

    // ログだけ残してフォールバック
    const status =
       typeof e === "object" && e && "status" in e
         ? (e as { status?: number }).status
         : undefined;

    // よくあるフォールバック対象
    if (status === 401 || status === 403 || status === 429) {
      return safeFallback();
    }
    // それ以外のネットワーク系・一時障害などもフォールバック
    return safeFallback();
  }
}
