// LoginForm_GlassCard.jsx

"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
  LockKeyhole,
  Settings2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import api from "@/Services/api";

// ------------------------------------------------------------
// IMPORTANT: this now points at the SAME authSlice.js that
// middleware/route.js were built around, not "profileSlice".
// If profileSlice really is a separate, intentional store, add
// a "startSession" reducer there too (same shape used below) —
// otherwise this import will silently be undefined again.
// ------------------------------------------------------------
import { startSession } from "@/store/slices/authSlice";

// ------------------------------------------------------------
// ROLE → REDIRECT
// Kept in sync with getRoleRedirect() in middleware.js so the
// client and the middleware never disagree about where a role
// belongs.
// ------------------------------------------------------------
const getRedirectPath = (role) => {
  switch (String(role || "").trim().toUpperCase()) {
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
      return null;
  }
};

export default function LoginFormGlassCard() {
  const searchParams = useSearchParams();

  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "identifier" ? value.trim() : value,
    }));
  };

  // --------------------------------------------------------
  // Only allow an internal ?redirect= target, and only if it
  // actually belongs to the logged-in user's role. Mirrors the
  // allowlist logic middleware.js already enforces server-side.
  // --------------------------------------------------------
  const getSafeRequestedRedirect = (role) => {
    const requested = searchParams?.get("redirect");

    if (
      !requested ||
      !requested.startsWith("/") ||
      requested.startsWith("//")
    ) {
      return null;
    }

    const roleHome = getRedirectPath(role);

    if (roleHome && (requested === roleHome || requested.startsWith(`${roleHome}/`))) {
      return requested;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!formData.identifier || !formData.password) {
      setMessage("Please enter your email and passcode.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      // ======================================================
      // STEP 1 — Log in against the backend
      // ======================================================
      const { data } = await api.post("/auth/login", formData);

      console.log("Login response:", data);

      const user = data?.data?.user;

      if (!user) {
        throw new Error("Login succeeded, but no user was returned.");
      }

      const role = user?.role;
      const roleRedirect = getRedirectPath(role);

      if (!roleRedirect) {
        throw new Error(`Unrecognized account role: ${role || "undefined"}`);
      }

      // ======================================================
      // STEP 2 — Put the user in Redux
      // ======================================================
      dispatch(startSession({ user, rememberMe }));

      // ======================================================
      // STEP 3 — Create the FRONTEND session cookie
      // ======================================================
      // This calls the Next.js route handler (route.js) directly
      // with a root-relative URL, so it always hits the local
      // /api/auth/session endpoint on localhost:3000 — never the
      // external backend — regardless of what baseURL the `api`
      // axios instance is configured with.
      //
      // That endpoint sets the httpOnly `frontend_session` and
      // `frontend_role` cookies that middleware.js actually reads.
      // Without this call, middleware never sees you as
      // authenticated and bounces every navigation back to
      // /login — which is exactly the redirect loop you're
      // hitting.
      // ======================================================
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, rememberMe }),
      });

      if (!sessionRes.ok) {
        throw new Error("Unable to create frontend session.");
      }

      // ======================================================
      // STEP 4 — Success message
      // ======================================================
      setMessage("Login successful. Redirecting...");
      setMessageType("success");

      // ======================================================
      // STEP 5 — Hard navigation (NOT router.push)
      // ======================================================
      // A hard navigation forces middleware to re-run against the
      // fresh cookie we just set. router.push() can run before the
      // Set-Cookie from step 3 is visible to the router, which is
      // what was sending you back to /login even after a
      // successful login.
      // ======================================================
      const finalRedirect = getSafeRequestedRedirect(role) || roleRedirect;

      window.location.replace(finalRedirect);
    } catch (err) {
      console.error("Login error:", err);

      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Invalid identifier or password.",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden ">
      {/* =========================================================
          BACKGROUND IMAGE
          NOTE: file must exist at /public/gate-control-cover.png
          (case-sensitive on Linux/Vercel deploys). backgroundSize/
          position/repeat set inline so they never depend on a
          Tailwind utility class being generated correctly.
      ========================================================= */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/gate-control-cover.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="absolute inset-0 bg-[#16130d]/20 mix-blend-multiply" />

        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-linear-to-t from-black/75 via-black/35 to-transparent" />

        <div className="absolute inset-y-0 left-0 w-[42%] bg-linear-to-r from-black/55 to-transparent" />

        <div className="absolute inset-y-0 right-0 w-[30%] bg-linear-to-l from-black/25 to-transparent" />
      </div>

      {/* =========================================================
          TOP GOLD LINE
      ========================================================= */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 h-px bg-linear-to-r from-transparent via-[#c69a3f]/70 to-transparent" />

      {/* =========================================================
          TOP LEFT BRAND
      ========================================================= */}
      <div className="absolute left-7 top-7 z-20 flex items-center gap-3 sm:left-12 sm:top-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#c99d45]/40 bg-black/35 shadow-[0_0_25px_rgba(201,157,69,0.08)] backdrop-blur-md">
          <ShieldCheck
            size={21}
            strokeWidth={1.4}
            className="text-[#d0a14b]"
          />
        </div>

        <div className="leading-none">
          <p className="text-[15px] font-semibold uppercase tracking-[0.14em] text-[#eee8d8] sm:text-[17px]">
            Elhelb Smart Solutions
          </p>

          <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.38em] text-[#b7944e] sm:text-[10px]">
            System
          </p>
        </div>
      </div>

      {/* =========================================================
          RIGHT FLOATING CONTROL
      ========================================================= */}
      <div className="absolute right-4 top-1/2 z-20 -translate-y-1/2 sm:right-5">
        <button
          type="button"
          aria-label="System settings"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 hover:border-[#c99d45]/50 hover:bg-black/70 hover:text-[#d5aa57]"
        >
          <Settings2 size={17} strokeWidth={1.5} />
        </button>
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-5 py-24 sm:px-8">
        <div className="flex w-full max-w-107.5 flex-col items-center">
          {/* =====================================================
              CENTER LOGO
          ===================================================== */}
          <div className="mb-4 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#c99d45]/15 blur-2xl" />

              <Image
                src="/elhelb_logo.jpeg"
                alt="Elhelb Smart Solutions"
                width={120}
                height={120}
                priority
                className="relative h-26.25 w-26.25 rounded-full object-contain drop-shadow-[0_0_25px_rgba(201,157,69,0.25)] sm:h-30 sm:w-30"
              />
            </div>
          </div>

          {/* =====================================================
              COMPANY TITLE
          ===================================================== */}
          <div className="mb-7 text-center">
            <h1 className="font-serif text-[23px] font-medium uppercase tracking-[0.03em] text-[#d4ad62] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-[25px]">
              Elhelb Smart Solutions
            </h1>

            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.32em] text-[#ddd8ca]/90 sm:text-[11px] sm:tracking-[0.38em]">
              Compound Gate Control
            </p>
          </div>

          {/* =====================================================
              GLASS LOGIN CARD
          ===================================================== */}
          <div className="w-full rounded-[15px] border border-[#c29a48]/55 bg-black/45 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45),0_0_35px_rgba(201,154,61,0.05)] backdrop-blur-[14px] sm:p-7">
            <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-[#c99d45]/45 to-transparent" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* =================================================
                  EMAIL
              ================================================= */}
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-2.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#d0c9b8]"
                >
                  Email
                </label>

                <div className="group relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#9c988c] transition-colors duration-200 group-focus-within:text-[#d2a94f]">
                    <UserRound size={16} strokeWidth={1.5} />
                  </div>

                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="owner@compound.eg"
                    required
                    autoComplete="username"
                    disabled={loading}
                    className="h-[2.6875rem] w-full rounded-md border border-white/15 bg-white/9 pl-11 pr-4 text-[12px] text-[#eee9dc] outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-[#a5a095]/65 hover:border-white/25 focus:border-[#c99d45]/70 focus:bg-white/12 focus:ring-1 focus:ring-[#c99d45]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* =================================================
                  PASSWORD
              ================================================= */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#d0c9b8]"
                >
                  Passcode
                </label>

                <div className="group relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#9c988c] transition-colors duration-200 group-focus-within:text-[#d2a94f]">
                    <LockKeyhole size={16} strokeWidth={1.5} />
                  </div>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="h-[2.6875rem] w-full rounded-md border border-white/15 bg-white/9 pl-11 pr-11 text-[12px] text-[#eee9dc] outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-[#a5a095]/65 hover:border-white/25 focus:border-[#c99d45]/70 focus:bg-white/12 focus:ring-1 focus:ring-[#c99d45]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-[#969187] transition-colors duration-200 hover:text-[#d2a94f] disabled:cursor-not-allowed"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={16} strokeWidth={1.5} />
                    ) : (
                      <Eye size={16} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* =================================================
                  REMEMBER + FORGOT
              ================================================= */}
              <div className="flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-[11px] text-[#d0ccc1]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="h-3 w-3 cursor-pointer rounded-sm border-white/30 bg-white/10 accent-[#c99d45]"
                  />

                  <span>Keep me signed in</span>
                </label>

                {/* 
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-[11px] font-medium text-[#d1aa57] transition-colors duration-200 hover:text-[#edc976] hover:underline"
                >
                  Reset passcode
                </button>
                */}
              </div>

              {/* =================================================
                  ERROR / SUCCESS
              ================================================= */}
              {message && (
                <div
                  className={`rounded-md border px-3.5 py-2.5 text-[11px] backdrop-blur-sm ${
                    messageType === "success"
                      ? "border-[#6f9b79]/50 bg-[#23402c]/60 text-[#b4d1bb]"
                      : "border-[#9a5e52]/50 bg-[#3a211d]/65 text-[#ddb0a6]"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* =================================================
                  SIGN IN BUTTON
              ================================================= */}
              <button
                type="submit"
                disabled={loading}
                className="relative h-[2.6875rem] w-full overflow-hidden rounded-md bg-gradient-to-r from-[#b98229] via-[#dda947] to-[#b98229] text-[13px] font-medium uppercase tracking-[0.18em] text-[#16130e] shadow-[0_5px_22px_rgba(201,154,61,0.22)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_7px_28px_rgba(201,154,61,0.32)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40" />

                <span className="relative">
                  {loading ? "Signing In..." : "Sign In"}
                </span>
              </button>

              {/* =================================================
                  SECURITY NOTE
              ================================================= */}
              <div className="flex items-center justify-center gap-2 pt-1 text-[10px] uppercase tracking-[0.08em] text-[#aaa59a]">
                <ShieldCheck
                  size={13}
                  strokeWidth={1.4}
                  className="text-[#a99362]"
                />

                <span>Your connection is secure</span>
              </div>
            </form>

            <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-[#c99d45]/25 to-transparent" />
          </div>

          {/* =====================================================
              BOTTOM TEXT
          ===================================================== */}
          <div className="mt-6 flex items-center gap-2 text-center">
            <ShieldCheck
              size={13}
              strokeWidth={1.4}
              className="text-[#aaa08a]"
            />

            <p className="text-[9px] uppercase tracking-[0.24em] text-[#b5afa2]/75">
              Secure Residential Access System
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM VIGNETTE
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_180px_rgba(0,0,0,0.35)]" />
    </main>
  );
}