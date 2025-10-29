// backend/src/utils/openaiPrompt.ts
import dayjs from "dayjs";

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

  // 現在時刻・曜日から時間帯を判定
  const now = dayjs();
  const hour = now.hour();
  const isWeekend = [0, 6].includes(dayjs().day());

  let timeSlot = "夜";
  if (hour >= 5 && hour < 11) timeSlot = "朝";
  else if (hour >= 11 && hour < 17) timeSlot = "昼";

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
    "運動": "ジムに行く、ウォーキング、ヨガ、ランニング、youtubeを見ながらストレッチなど",
    "学習": "本を読む、オンライン講座を受ける、語学の勉強など",
    "趣味": "好きなことをする",
    "映画鑑賞": "映画やドラマ、アニメなどを観てリラックスする",
    "読書": "小説やエッセイ、漫画などを読んで気分転換する",
    "生活改善": "掃除、整理整頓、早寝準備など",
    "リラックス": "瞑想、アロマを焚く、音楽を聴くなど",
    "自己啓発": "ビジネス書や自己啓発本を読む、日記をつける、目標設定など",
  };
  const topicHints = topics
    .map((t) => `・${t}: ${topicExamples[t] || "関連する行動"}`)
    .join("\n");

  // 興味分野を整形して自然文に
  const topicsText = topics.length > 0 ? topics.join("、") : "未設定";

  // 運動を選んだかどうかを判定
  const includesExercise = topics.includes("運動");
  // 運動カテゴリ選択時のみ条件文を出力
  const exerciseCondition = includesExercise
    ? `- 「運動」分野を選択しているため、ジムに行くや軽い運動などの行動を含めても構いません。`
    : `- ユーザーは「運動」分野を選択していないため、ヨガ・ストレッチ・ウォーキングなど体を動かす行動は提案しないでください。`;



  return `
あなたはポジティブで明るいパーソナルスケジュールのコーチです。
以下のユーザー情報と現在の気分をもとに、${count}個の今日の行動提案を**ランダム**に出してください。

【現在の日時情報】
- 現在時刻: ${now.format("HH:mm")}
- 曜日: ${isWeekend ? "休日" : "平日"}
- 時間帯区分: ${timeSlot}

【ユーザー情報】
- 興味分野: ${topicsText}
- 性格タイプ: ${(userProfile?.personality || []).join("、") || "未設定"}
- 今日の気分: ${mood || "普通"}

【興味分野別の例】
${topicHints}

【補足】
- 「映画鑑賞」には映画・ドラマ・アニメも含みます。
- 「読書」には漫画・小説・エッセイなども含みます。

【条件】
1. 提案内容は、ユーザーの興味分野「${topicsText}」の中から、その日の気分や流れに合いそうな行動を選んで提案してください。
2. ${exerciseCondition}
3. ${subText} 
4. 所要時間（time）は次の候補から選んでください：
   - 15分（短時間行動・自己啓発向け）
   - 30分
   - 45分
   - 120分（映画鑑賞などの長時間行動）
5. difficulty（難易度）は現在の気分に応じて次の範囲から選択すること。：
   - high → 難易度：${difficultyMap.high}
   - normal → 難易度：${difficultyMap.normal}
   - low → 難易度：${difficultyMap.low}
6. 所要時間（time）は必ず次の構成で出力すること：
   - 1件目：15分の行動（自己啓発または短時間向け）
   - 2件目：30分の行動
   - 3件目：45分の行動（ただし映画鑑賞の場合は120分）
7. 各提案は、基本的に1つの興味分野を中心にしてください。
   - ただし、現実的に同時にできる内容（例：「散歩しながら音楽を聴く」など）は構いません。
   - 複合行動（例：筋トレしながら英語を聞く、ストレッチと筋トレなど）は避けてください。
8. 「映画鑑賞」は特別なアクティビティとして扱い、提案の頻度を下げてください。
 
9. 同じ種類の行動ばかりを繰り返さず、多様なジャンルの提案を出してください。
8. 出力順は上から「短い→長い」順に並べること。
9. 各提案には「タイトル（15文字以内）」を含めること。
   - タイトルには時間（例：「15分」「30分」など）を**絶対に含めないでください**。
10. **reason** は、やる気が出るような明るいトーンで行動の説明をしてください。
11. 出力形式は、JSON形式で：
[
  { "title": "提案タイトル", "reason": "短い説明分", "time": "〇分", "difficulty": "低/中/高" }
]
  `.trim();
}


// - タイプ: ${userProfile?.typeMorning || "未設定"}
// - 自由時間: ${userProfile?.freeTime || "未設定"}

  // - 映画以外の行動（学習、運動、リラックスなど）を優先してください。