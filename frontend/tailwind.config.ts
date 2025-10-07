/**
 * tailwind.config.ts
 * 
 * Tailwind CSS のカスタム設定。
 * 
 * NOTE:
 * - 本アプリのカラーパレットは「くすみ水色 × 白」を基調に設計。
 * - 共通のカラー変数をここで管理し、デザイン統一を維持。
 * - 開発チーム全員が同じ色指定を使えるようにするため、直接HEX値は使わず
 *   Tailwindクラス（例：bg-mainButton, text-textMain）で統一。
 *
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 ベースカラー
        bgTop: "#D4EDF6",          // 背景グラデーション上部（淡い水色）
        bgBottom: "#BCD7E5",       // 背景グラデーション下部（落ち着いた水色）
        formBg: "#FFFFFF",         // フォーム背景（白）

        // 🩵 アクションカラー
        mainButton: "#B9DDEE",     // メインボタン
        mainButtonHover: "#A8D2E8",// ボタン hover 時

        // 🩶 枠線・テキストカラー
        borderLight: "#C8DBE4",    // 入力欄などの枠線色
        textMain: "#2C4D63",       // 見出し・本文
        textSub: "#5D7C8A",        // 補足テキスト
        link: "#4D90A6",           // リンクカラー
      },

      boxShadow: {
        soft: "0 2px 6px rgba(0, 0, 0, 0.08)", // 柔らかい影
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem", // 丸みのあるフォームデザインに合わせた設定
      },
    },
  },
  plugins: [],
};

export default config;
