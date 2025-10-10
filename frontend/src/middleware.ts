import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NOTE: Middleware 本体
export function middleware(req: NextRequest) {
    const token = req.cookies.get("firebaseToken")?.value;

    // NOTE: ログイン不要なページの例外
    if (
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register") ||
      req.nextUrl.pathname.startsWith("/api")
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

// NOTE: 適用対象のルート設定
export const config = {
    matcher: ["/", "/onboarding/:path", "/dashboard/:path*"],
};