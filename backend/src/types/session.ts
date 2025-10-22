/**
 * NOTE:
 * Firestoreに行動情報を保存するための型定義
 * 各APIルート（/api/sessionsなど）で共通して利用される想定です。
 * 変更時は必ず、関連するルート（routes/sessions.ts）側も確認してください。
 */

// NOTE: ユーザーに提案された行動の情報
export interface Suggestion  {
    id: string;
    title: string;
    description?: string;
    category?: string;
}

// NOTE: 一時停止、再開の履歴を記録
export interface PauseRecord {
    pausedAt?: string;  // 一時停止した日時
    resmedAt?: string;  // 再開した日時
}


// NOTE: ユーザーが実際に提案を選択して行動を開始した記録
export interface SessionData  {
    userId: string;
    startTime: string;
    endTime?: string;
    status: "active" | "paused" | "completed";
    activityType?: string;
    suggestion?: Suggestion;
    pauseHistory?: PauseRecord[];  // 停止／再開の履歴
}