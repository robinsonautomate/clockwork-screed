import { NextResponse, type NextRequest } from "next/server";

/**
 * Password gate (Next.js 16 `proxy` convention). Self-contained — no module
 * imports beyond next/server — so it bundles cleanly. The cookie name and
 * token salt are kept in sync with src/lib/auth.ts, used by the login action.
 */

const SESSION_COOKIE = "cws_session";
const TOKEN_SALT = "clockwork-screed::";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const expected = await sha256Hex(
    `${TOKEN_SALT}${process.env.SITE_PASSWORD ?? ""}`,
  );
  const authed = !!token && token === expected;
  const isLogin = pathname === "/login";

  if (!authed && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?from=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (authed && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api/upload|favicon.ico|.*\\.(?:webp|png|jpe?g|gif|svg|ico)).*)",
  ],
};
