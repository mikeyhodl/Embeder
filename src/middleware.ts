import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRoutes, protectedRoutes } from "@/shared/routes/routes";

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get("Authtoken")?.value;
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (typeof route === "string") {
      return request.nextUrl.pathname === route;
    } else {
      return route.test(request.nextUrl.pathname);
    }
  });

  if (isProtectedRoute && !currentUser) {
    request.cookies.delete("Authtoken");
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("Authtoken");
    return response;
  }

  if (authRoutes.includes(request.nextUrl.pathname) && currentUser) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
