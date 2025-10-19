// frontend/src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 🔒 Middleware（認証保護）
 * - Cookie に firebaseToken がない場合は /login にリダイレクト
 * - /login, /register, /api, /_next, /short-test などは除外
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get("firebaseToken")?.value;
  const { pathname } = req.nextUrl;

  // 認証不要パス（/short-test を追加）
  const publicPaths = ["/login", "/register", "/api", "/short-test"];

  // 認証チェック対象外
  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // トークンなし → /login へ
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // トークンあり → 通過
  return NextResponse.next();
}

// すべてのルートに適用（/short-test を除外に追加）
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|register|api|short-test).*)"],
};
