// backend/src/utils/openaiPrompt.ts
export type UserProfile = {
  typeMorning?: string;       // 朝型 or 夜型
  freeTime?: string;          // 自由時間（例: "20:00〜22:00／13:00〜17:00"）
  interests?: string[];       // 興味分野（例: ["趣味", "映画鑑賞", "学習"]）
  personality?: string[];     // 性格タイプ（例: ["マイペース型", "インドア型"]）
};

type BuildPromptParams = {
    userProfile: UserProfile;
    mood: "high" | "normal" | "low";
    topics: string[];
    subInterests?: string[];
    count?: number;
};

export function buildSuggestionPrompt({
  userProfile,
  mood,
  topics,
  subInterests = [],
  count = 3,
}: BuildPromptParams): string {

    // 趣味の分類を組み込み
    const subText =
      subInterests.length > 0
        ? `また、ユーザーは次のような具体的な興味があります:${subInterests.join("、")}。`
      : "";

  // 難易度を気分によって調整
  const difficultyMap: Record<typeof mood, string> = {
    high: "中〜高のみ",
    normal: "低〜中のみ",
    low: "低のみ",
  };

  const topicExamples: Record<string, string> = {
    "運動": "ヨガ、ストレッチ、散歩、軽い筋トレなど",
    "学習": "本を読む、オンライン講座を受ける、語学の勉強など",
    "趣味": "好きなことをする（ゲーム、映画鑑賞、読書、買い物など）",
    "生活改善": "掃除、整理整頓、早寝準備など",
    "リラックス": "呼吸法、瞑想、アロマ、音楽を聴くなど",
    "自己啓発": "日記をつける、振り返り、ポジティブな言葉を書くなど",
  };
  const topicHints = topics
    .map((t) => `・${t}: ${topicExamples[t] || "関連する行動"}`)
    .join("\n");

  const topicsText = topics.length > 0 ? topics.join("、") : "未設定";

  // 運動を選んだかどうかを判定
  const includesExercise = topics.includes("運動");
  // 運動カテゴリ選択時のみ条件文を出力
  const exerciseCondition = includesExercise
    ? `- 「運動」分野を選択しているため、ストレッチや軽い運動などの行動を含めても構いません。`
    : `- ユーザーは「運動」分野を選択していないため、ヨガ・ストレッチ・ウォーキングなど体を動かす行動は提案しないでください。`;


  return `
あなたはポジティブで明るいパーソナルスケジュールのコーチです。
以下のユーザー情報と現在の気分をもとに、${count}個の今日の行動提案を**ランダム**に出してください。

【ユーザー情報】
- タイプ: ${userProfile?.typeMorning || "未設定"}
- 自由時間: ${userProfile?.freeTime || "未設定"}
- 興味分野: ${topicsText}
- 性格タイプ: ${(userProfile?.personality || []).join("、") || "未設定"}
- 今日の気分: ${mood || "普通"}

【興味分野別の例】
${topicHints}

【条件】
1. 提案内容は「${topicsText}」の分野に関連し、${subInterests.length > 0 ? `特に「${subInterests.join("、")}」のようなテーマ` : "関連するテーマ"}を中心にしてください。
2. ${exerciseCondition}
3. ${subText} 
4. 所要時間（time）は「15〜30分」または「15〜60分」程度にすること。
5. difficulty（難易度）は現在の気分に応じて次の範囲から選択すること。：
   - high → 難易度：${difficultyMap.high}
   - normal → 難易度：${difficultyMap.normal}
   - low → 難易度：${difficultyMap.low}
6. 所要時間（time）は必ず次の構成で出力すること：
   - 1件目：15〜30分未満の短めの行動
   - 2件目：30〜60分の行動
   - 3件目：30〜60分の行動
7. 出力順は上から「短い→長い」順に並べること。
8. 各提案には「タイトル（15文字以内）」を含めること。
9. **reason** は、やる気が出るような明るいトーンで行動の説明をしてください。
10. 出力形式は、JSON形式で：
[
  { "title": "提案タイトル", "reason": "短い説明分", "time": "〇分", "difficulty": "低/中/高" }
]
  `.trim();
}
