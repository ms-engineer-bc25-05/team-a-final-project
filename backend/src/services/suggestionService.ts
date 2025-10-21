// backend/src/services/suggestionService.ts
import { z } from "zod";

/** 画面・アンケ設計と一致させるトピック */
export const TOPICS = ["運動", "学習", "趣味", "生活"] as const;
export type Topic = typeof TOPICS[number];

/** 入力バリデーション */
export const SuggestionReqSchema = z.object({
  topic: z.union([z.enum(TOPICS), z.string().trim().min(1)]).optional(),
  count: z.number().int().min(1).max(5).default(3),
});
export type SuggestionReq = z.infer<typeof SuggestionReqSchema>;

/** 公開レスポンスの型（reason を含まない） */
export type Suggestion = {
  id: string;
  title: string;
  score: number;
  minutes?: number;
};

/** 内部テンプレ用（reason は内部保持のみ） */
type PoolItem = Suggestion & {
  topics: Topic[];
  reason?: string;
};

/** 固定テンプレ（内部では reason を保持してOK） */
const POOL: PoolItem[] = [
  // ===== 運動 =====
  { id: "stretch5", title: "首と肩を5分ストレッチ",   reason: "肩をゆっくり前後に各10回回す",           score: 0.70, minutes: 5,  topics: ["運動", "生活"] },
  { id: "eyes20",   title: "目の休憩",                 reason: "20秒、少し遠くを見る",                   score: 0.63, minutes: 1,  topics: ["運動", "生活"] },
  { id: "posture2", title: "姿勢リセット 2分",        reason: "背すじを伸ばし深呼吸×5回",               score: 0.52, minutes: 2,  topics: ["運動", "生活"] },

  // ===== 学習 =====
  { id: "vocab3",   title: "英単語を3つ覚える",        reason: "発音→意味→例文の順で1巡するだけ",       score: 0.68, minutes: 5,  topics: ["学習"] },
  { id: "reading5", title: "本を5ページ読む",          reason: "タイマーを5分にして止まるまで読む",       score: 0.64, minutes: 5,  topics: ["学習", "趣味"] },
  { id: "app10",    title: "英語アプリを10分",         reason: "リスニング→発話まで1サイクル",           score: 0.55, minutes: 10, topics: ["学習"] },

  // ===== 趣味 =====
  { id: "music1",   title: "好きな曲を1曲だけ聴く",    reason: "目を閉じて集中して聴く",                 score: 0.50, minutes: 4,  topics: ["趣味", "生活"] },
  { id: "sketch5",  title: "5分スケッチ",              reason: "手元のペンでコップを輪郭だけ描く",        score: 0.45, minutes: 5,  topics: ["趣味"] },

  // ===== 生活 =====
  { id: "memo1",    title: "今日の出来事を1行書く",    reason: "箇条書き可",                             score: 0.62, minutes: 2,  topics: ["生活", "学習"] },
  { id: "tidy2",    title: "机の上を2分片づける",      reason: "手元に近い物から2点だけ片づける",        score: 0.58, minutes: 2,  topics: ["生活"] },
  { id: "inbox5",   title: "メール/DMを5分だけ整理",   reason: "既読・アーカイブ・後でやる の3分類だけ",   score: 0.54, minutes: 5,  topics: ["生活"] },
  { id: "tea5",     title: "お茶を淹れて一息つく",      reason: "湯気を3呼吸ながめてから飲む",             score: 0.50, minutes: 5,  topics: ["生活", "趣味"] },
];

/** サンプル用（/examples）表示タイトルだけ */
export const EXAMPLES: string[] = [
  "首と肩を5分ストレッチ",
  "目の休憩",
  "英単語を3つ覚える",
  "本を5ページ読む",
  "今日の出来事を1行書く",
  "机の上を2分片づける",
];

/** トピックのゆるい正規化 */
function normalizeTopic(input?: string): Topic {
  const t = (input ?? "").trim();
  if ((["運動", "運動系", "からだ", "体"] as string[]).includes(t)) return "運動";
  if ((["学習", "勉強", "学び"] as string[]).includes(t)) return "学習";
  if ((["趣味", "リフレッシュ"] as string[]).includes(t)) return "趣味";
  if ((["生活", "ライフ", "家事"] as string[]).includes(t)) return "生活";
  if ((TOPICS as unknown as string[]).includes(t)) return t as Topic;
  return "生活";
}

/** スコア順でピックして、返却時に reason を除外 */
function pickByTopic(topic: Topic, count: number): Suggestion[] {
  const byTopic = POOL.filter((p) => p.topics.includes(topic));
  const source = byTopic.length ? byTopic : POOL;
  return source
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ topics, reason, ...pub }) => pub); // ★ reason を捨てる
}

/** エクスポート：routes から呼ばれるメイン */
export function makeSuggestions(input: SuggestionReq) {
  const parsed = SuggestionReqSchema.parse(input);
  const topic = normalizeTopic(parsed.topic);
  const suggestions = pickByTopic(topic, parsed.count);
  return { topic, count: parsed.count, suggestions };
}