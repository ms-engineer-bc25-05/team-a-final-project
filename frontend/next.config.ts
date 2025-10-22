// frontend/next.config.ts
import type { NextConfig } from "next";

/**
 * PR #33: /api/suggestions 接続確認（rewrite + テストページ）
 * 方針: OpenAIは使用せず、バックエンドの 429 フォールバック応答で接続だけ確認する。
 *
 * BACKEND_ORIGIN は以下の優先度で決定:
 * 1) NEXT_PUBLIC_BACKEND_ORIGIN
 * 2) BACKEND_ORIGIN
 * 3) 既定値 http://localhost:4000
 */
const RAW_BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ??
  process.env.BACKEND_ORIGIN ??
  "http://localhost:4000";

// 末尾スラッシュの二重化を防止（例: http://localhost:4000/ ではなく http://localhost:4000 に統一）
const BACKEND = RAW_BACKEND.replace(/\/+$/, "");

/**
 * /api/* を丸ごとバックエンドへプロキシ。
 * - クッキー/ヘッダもそのまま転送されるので CORS 設定不要。
 * - フロントからは常に /api/... を叩けばOK（実体は BACKEND 側の /api/... へ転送）。
 */
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND}/api/:path*`,
      },
    ];
  },
  /**
   * もし monorepo 等で “workspace root を誤推定” 警告が出る場合は、
   * outputFileTracingRoot を明示する（今回の構成では通常不要）。
   *
   * 例:
   * outputFileTracingRoot: require("path").join(__dirname, ".."),
   */
};

export default nextConfig;
