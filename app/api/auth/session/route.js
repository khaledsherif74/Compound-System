import { NextResponse } from "next/server";

// =========================================================
// POST /api/auth/session
// =========================================================
// Creates the small frontend-only session cookies used by
// middleware.js.
//
// IMPORTANT:
// The real authentication session/token is managed by the
// backend. These cookies only allow the Next.js middleware
// to know that the frontend is currently authenticated.
// =========================================================

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch (error) {
    console.error("[session] Failed to parse request body:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const { user, rememberMe } = body || {};

  if (!user) {
    console.error("[session] Missing 'user' in payload:", body);

    return NextResponse.json(
      {
        success: false,
        message: "Missing user in session payload.",
      },
      { status: 400 },
    );
  }

  if (!user.role) {
    console.error("[session] User has no 'role' field:", user);

    return NextResponse.json(
      {
        success: false,
        message: "Missing user.role in session payload.",
      },
      { status: 400 },
    );
  }

  try {
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(maxAge ? { maxAge } : {}),
    };

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(
      "frontend_session",
      "authenticated",
      cookieOptions,
    );

    response.cookies.set(
      "frontend_role",
      String(user.role),
      cookieOptions,
    );

    return response;
  } catch (error) {
    console.error("[session] Failed to set cookies:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create frontend session.",
      },
      { status: 500 },
    );
  }
}

// =========================================================
// DELETE /api/auth/session
// =========================================================
// Removes ONLY the frontend middleware cookies.
//
// The actual logout MUST be performed against the backend
// first using:
// POST /auth/logout
//
// This route is only responsible for removing the frontend
// session cookies after the backend logout has been handled.
// =========================================================

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set("frontend_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("frontend_role", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

// =========================================================
// GET /api/auth/session
// =========================================================

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "Session route is reachable. POST to create the frontend session and DELETE to clear it after backend logout.",
  });
}

