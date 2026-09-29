import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/login", "/forgot-password", "/reset-password"];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const frontendSession = request.cookies.get("frontend_session")?.value;
  const frontendRole = request.cookies.get("frontend_role")?.value;

  const isAuthenticated = frontendSession === "authenticated";

  if (isAuthenticated && isPublicRoute) {
    const redirectPath = getRoleRedirect(frontendRole);

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function getRoleRedirect(role) {
  switch (
    String(role || "")
      .trim()
      .toUpperCase()
  ) {
    case "ADMIN":
      return "/admin";

    case "OWNER":
    case "USER":
      return "/owner-dashboard";

    case "SECURITY":
    case "SUPERVISOR":
      return "/supervisor-dashboard";

    case "ROLLER":
      return "/roller";

    default:
      return "/admin";
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2)$).*)",
  ],
};
