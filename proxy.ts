import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const protectedPaths = ["/dashboard", "/bill", "/settings", "/roommates"]

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const guestCookie = request.cookies.get("guest")?.value === "1"
  const { pathname } = request.nextUrl

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (!sessionCookie && !guestCookie && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (sessionCookie && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bill/:path*",
    "/settings/:path*",
    "/roommates/:path*",
    "/login",
    "/signup",
  ],
}
