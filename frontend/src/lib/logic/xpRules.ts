/**
 * タスク時間(durationMin)からXPを算出するルール
 *
 * 🎯 設計方針
 * - 15分未満のタスクは短すぎるため、XP対象外（0XP）
 * - 15〜29分 → 集中タスクとして 5XP
 * - 30分以上 → 充実タスクとして 10XP
 */
export function getXPByDuration(durationMin: number): number {
    const minutes = Number(durationMin) || 0;
  
    // 15分未満 → 対象外
    if (minutes < 15) return 0;
  
    // 15〜29分 → 5XP
    if (minutes < 30) return 5;
  
    // 30分以上 → 10XP
    return 10;
  }
  