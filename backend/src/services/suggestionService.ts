// backend/src/services/suggestionService.ts
import type { Suggestion, SuggestionRequest } from "../schemas/suggestions";

// 文字列から安定した疑似乱数(0–1)を作る（同じ topic なら同じ並びに）
function seededScore(seed: string, i: number) {
  let h = 2166136261 ^ i;
  for (let c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  // 0–1 の範囲に正規化
  return ((h >>> 0) % 1000) / 1000;
}

const templates = [
  (t: string) => ({ title: `${t}：まず小さく試す`, reason: "リスク低・早く学べる" }),
  (t: string) => ({ title: `${t}：ユーザー目線の仮説出し`, reason: "定性情報を先に押さえる" }),
  (t: string) => ({ title: `${t}：データ計測の下ごしらえ`, reason: "後の検証を早める" }),
  (t: string) => ({ title: `${t}：ステークホルダー同期`, reason: "期待値を合わせる" }),
  (t: string) => ({ title: `${t}：スコープを半分に`, reason: "納期優先・価値の核に集中" }),
];

export function getDummySuggestions(req: SuggestionRequest): Suggestion[] {
  const { topic, count } = req;
  const picks = Array.from({ length: count }).map((_, i) => {
    const tmpl = templates[i % templates.length](topic);
    const score = seededScore(topic, i);
    return {
      id: `${topic}-${i + 1}`,
      title: tmpl.title,
      reason: tmpl.reason,
      score,
    };
  });
  // スコア降順で安定ソート
  return picks.sort((a, b) => b.score - a.score);
}