import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 🔒 Middleware（認証保護）
 * - Cookie に firebaseToken がない場合は /login にリダイレクト
 * - /login, /register, /api, /_next などは除外
 */
export function middleware(req: NextRequest) {
    const token = req.cookies.get("firebaseToken")?.value;
    const { pathname } = req.nextUrl;

    // NOTE: 認証不要
    const publicPaths = ["/login", "/register", "/api"];

    // ユーザー認証とは無関係なパスをmiddleware（認証チェック）の対象外とする
    if (
      publicPaths.some((path) => pathname.startsWith(path)) ||
      pathname.startsWith("/_next") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    // NOTE: トークンが存在にない場合、　/loginへリダイレクト
    if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // NOTE: トークンが存在する場合はそのまま通す
  return NextResponse.next();
}

// NOTE: すべてのルートに middleware を適用
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|login|register|api).*)"],
};