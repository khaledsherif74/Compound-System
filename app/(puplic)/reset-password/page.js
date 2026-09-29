"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import api from "@/Services/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("This password recovery link is invalid or missing.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      setMessage("Your password has been updated successfully. Redirecting to login...");

      setTimeout(() => {
        router.replace("/login");
      }, 800);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to reset the password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0d0b08] px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-[#c29a48]/55 bg-black/55 p-7 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-9">
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full border border-[#c99d45]/35 bg-[#c99d45]/10 p-3">
              <ShieldCheck size={26} className="text-[#d2a94f]" />
            </div>
            <h1 className="text-xl font-semibold text-[#eee9dc]">
              Set your password
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#b9b4a9]">
              Use the one-time recovery link from your email to set a new password.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#d0c9b8]">
                New password
              </label>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#969187]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-11 pr-4 text-sm text-[#eee9dc] outline-none transition focus:border-[#c99d45]/70 focus:ring-1 focus:ring-[#c99d45]/25 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#d0c9b8]">
                Confirm password
              </label>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#969187]"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-11 pr-4 text-sm text-[#eee9dc] outline-none transition focus:border-[#c99d45]/70 focus:ring-1 focus:ring-[#c99d45]/25 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-xl bg-[#c99732] px-5 py-3 font-semibold text-white transition hover:bg-[#d5a43a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Updating..." : "Set password"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#9f9a8f]">
            <Link href="/login" className="font-medium text-[#d1aa57] hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
