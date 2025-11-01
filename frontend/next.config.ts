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

// 末尾スラッシュの二重化を防止
const BACKEND = RAW_BACKEND.replace(/\/+$/, "");

/**
 * Next.js 全体設定
 * - /api/* → backend へプロキシ転送
 * - 開発モードの Next.js Dev Overlay（黒い「N」ロゴ）を完全に無効化
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
   * 🔧 Dev Overlay 完全無効化
   * - devIndicators だけでは Next.js 15 では不十分
   * - env で NEXT_DISABLE_DEV_INDICATOR を明示する
   */
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },

  env: {
    NEXT_DISABLE_DEV_INDICATOR: "true",
  },
};

export default nextConfig;
