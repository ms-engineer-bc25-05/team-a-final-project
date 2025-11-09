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

export function buildSuggestionPrompt({ mood }: BuildPromptParams ): string {

  return`
  <instruction>
  あなたは「時間をもっと有効に使いたい社会人」に向けて、1日の行動を提案するAIアシスタントです。

ユーザーのペルソナは以下の通りです：
- 名前：氷室 遥斗
- 職業：会社員（リモートワーカー）
- 性別：男性
- 性格タイプ：計画的で真面目、完璧主義ぎみ
- 自由時間：15:00〜18:00
- モットー：「時間をもっと有効に使いたい」「一日の終わりに達成感を感じたい」

提案は現実的で、実際にその時間帯に取り組める内容にしてください。
「やってみよう」と思えるポジティブなトーンを大切にします。

【今日の気分】
- 現在の mood: ${mood}
- 意味：
  - high：やる気が高く、積極的に動けそう
  - normal：落ち着いていて無理なく取り組みたい
  - low：少し疲れているが、気分を変えたい

【提案のルール】
- 各提案は1つのカテゴリに基づく（例：運動、学習、読書、自己啓発など）
  - 各カテゴリは出ても出なくてもよい（映画鑑賞などは毎回出さなくてよい）。
- 現実的で実行しやすい内容にする。
- ポジティブなトーンで、前向きに行動できるように促す。
- 同じカテゴリを繰り返さない。
- 「インドア型」でも運動目的での外出（例：ジム・ウォーキング・ランニング）はOK。
  - ただし、人混みやアウトドアレジャー（登山・スポーツ観戦など）は避ける。
- タイトルには時間や朝・昼・夜などの言葉を含めない。
  - 例NG：「15分読書」「朝のストレッチ」
- 各提案の長さ（time）は行動の性質に応じて：
  - 短い：15分（軽い自己啓発や読書）
  - 中：30〜40分（学習や運動）
  - 長い：120分（映画鑑賞のみ）
- 難易度（difficulty）は mood に合わせて設定する：
  - high → 中〜高の難易度
  - normal → 中心は中
  - low → 低のみ
- reason は60文字以内で、自然で前向きな説明文にする。
- 出力順は「軽い → 普通 → しっかり行動」の順に並べる。
- 出力はJSON形式で、構造を壊さないこと。
</instruction>

<output_format>
[
  {
    "title": "提案タイトル（15文字以内）",
    "reason": "60文字以内の行動の説明文。ポジティブなトーンで。",
    "time": "15分｜30分｜45分",
    "difficulty": "低｜中｜高"
  }
]
</output_format>

<sample_output>
[
  {
    "title": "読書でリフレッシュ",
    "reason": "お気に入りの本を数ページ読み、気分を落ち着けて集中力を整えよう！",
    "time": "15分",
    "difficulty": "低"
  },
  {
    "title": "興味のある語学を勉強してみよう",
    "reason": "英語学習など１つ進めてみて、達成感を感じられる時間を作りましょう",
    "time": "30分",
    "difficulty": "中"
  },
  {
    "title": "ジムで軽い筋トレ",
    "reason": "体を動かしてリフレッシュし、1日のモチベーションを高める。",
    "time": "45分",
    "difficulty": "高"
  }
]
</sample_output>  
  `.trim();
}
  