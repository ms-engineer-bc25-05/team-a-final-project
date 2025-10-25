import { randomUUID } from "crypto";

/** セッションIDを作成する再利用可能な関数
 * - Firestoreに保存する1つの「行動セッション」を一意に識別するためのIDを生成します。
 */

export function generateSessionId(): string {
    return randomUUID();
}