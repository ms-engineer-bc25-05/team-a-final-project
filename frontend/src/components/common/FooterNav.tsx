"use client";

import { Home, BarChart3, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

/**
 * FooterNav
 *
 * NOTE:
 * - スクロールしても常に画面下に固定。
 * - 背景に軽い透過＋ぼかしを追加してアプリ感を演出。
 * - 現在のページに応じてアイコンカラーを強調。
 */
export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { icon: Home, label: "ホーム", path: "/mood" },
    { icon: BarChart3, label: "記録", path: "/records/daily" },
    { icon: Settings, label: "設定", path: "/settings" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[#DCE9EE]
                 flex justify-around items-center py-2.5 z-50"
    >
      {items.map(({ icon: Icon, label, path }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => router.push(path)}
            className={`flex flex-col items-center transition ${
              active ? "text-[#2C4D63]" : "text-[#9AB6C3] hover:text-[#5D8398]"
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-0.5 ${
                active ? "stroke-[2.5]" : "stroke-[1.8]"
              }`}
            />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
