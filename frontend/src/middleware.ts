// frontend/src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 認証ミドルウェア
 * - firebaseToken が無い場合は /login にリダイレクト
 * - 下記 publicPaths（および Next.js の内部アセット）は常に許可
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("firebaseToken")?.value;

  // 認証不要のプレフィックス（先頭一致）
  const publicPaths = [
    "/login",
    "/register",
    "/api",
    "/short-test",
    "/suggestions-test", // ← 追加（接続確認ページを公開）
    "/onboarding",
    "/rest-done",
    "/records",
    "/settings",
  ];

  // Next.js の内部リソースや favicon は常に許可
  const isAlwaysAllowed =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/icons") || // 必要なら追加
    pathname.startsWith("/images");  // 必要なら追加

  if (isAlwaysAllowed || publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 認証必須ルート：トークンなければ /login へ
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    // 直前の行き先を保持したい場合は以下を有効化
    // loginUrl.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// すべてのルートに適用しつつ、公開パスは除外
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images|login|register|api|short-test|suggestions-test|onboarding|rest-done|records|settings).*)",
  ],
};
