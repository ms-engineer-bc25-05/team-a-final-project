// backend/src/services/openaiService.ts
import { makeOpenAI, config } from "../config/openai";

const client = makeOpenAI();

/** OpenAI へのシンプル問い合わせ（短文・確定的な応答に調整） */
export async function simpleChat(prompt: string): Promise<string> {
  if (!client || config.useMock) {
    return `MOCK_REPLY: ${prompt}`;
  }

  try {
    const res = await client.chat.completions.create(
      {
        model: config.model,
        messages: [
          {
            role: "system",
            content:
              "出力は日本語。10文字以内の短文で、句点なしで返答してください。説明や注釈は付けないこと。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 1,   // ★ ブレを最小化
        max_completion_tokens: 20,   // ★ 長文を抑制
      },
      { timeout: config.timeoutMs } // timeout は第2引数
    );

    const msg = res.choices?.[0]?.message?.content ?? "";
    return typeof msg === "string" ? msg : JSON.stringify(msg);
  } catch (e: any) {
    console.error("🔴 OpenAI error:");
    console.error("status:", e?.status);
    console.error("code:", e?.code);
    console.error("message:", e?.message);
    console.error("response.data:", e?.response?.data);
    throw e;
  }
}