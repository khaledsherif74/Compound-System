// app/(puplic)/login/page.jsx

import { Suspense } from "react";
import LoginFormGlassCard from "@/components/LoginForm_GlassCard";

export const metadata = {
  title: "Login | Elhelb Smart Solutions",
};

function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0b08]">
      <div className="text-sm tracking-[0.15em] text-[#d0a14b]">
        Loading...
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginFormGlassCard />
    </Suspense>
  );
}