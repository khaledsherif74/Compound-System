"use client";

import Link from "next/link";
import { ArrowRight, ScanLine, ShieldCheck } from "lucide-react";

export default function LandingPageAccessPass() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0E1420]">
      {/* Background Cover Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/gate-control-cover.png')",
        }}
      />

      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-[#050912]/85 via-[#050912]/35 to-transparent" />

      {/* Bottom dark fade */}
      <div className="absolute inset-x-0 bottom-0 h-52 bg-linear-to-t from-[#050912]/80 to-transparent" />

      {/* Subtle gold ambient glow */}
      <div className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-[#D5A43A]/10 blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Minimal Branding */}
        <header className="px-8 pt-8 md:px-14 md:pt-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D5A43A]/40 bg-black/30 backdrop-blur-md">
              <ShieldCheck
                size={22}
                className="text-[#D5A43A]"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-white">
                GATE CONTROL
              </p>

              <p className="text-[10px] font-medium tracking-[0.28em] text-[#D5A43A]">
                SYSTEM
              </p>
            </div>
          </div>
        </header>

        {/* Main Hero */}
        <section className="flex flex-1 items-center px-8 pb-28 md:px-14">
          <div className="max-w-xl">
            {/* ANPR indicator */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D5A43A] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D5A43A]" />
              </span>

              <span className="text-[10px] font-medium tracking-[0.2em] text-white/80">
                ANPR ACCESS TERMINAL
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl">
              Smart Access
              <br />
              <span className="text-[#D5A43A]">Safer Living</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-white/75 md:text-lg">
              Intelligent vehicle recognition and secure gate access designed
              for a seamless entry experience.
            </p>

            {/* Detection status */}
            <div className="mt-7 flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 backdrop-blur-md">
                <ScanLine size={16} className="text-[#D5A43A]" />

                <span className="text-xs text-white/80">
                  Plate Recognition Active
                </span>
              </div>

              <div className="hidden h-5 w-px bg-white/20 sm:block" />

              <span className="hidden text-xs text-white/50 sm:block">
                Secure • Fast • Contactless
              </span>
            </div>
          </div>
        </section>

        {/* Login Button */}
        <div className="absolute bottom-8 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 md:bottom-10">
          <Link
            href="/login"
            prefetch={false}
            className="group flex h-14 items-center justify-center gap-3 rounded-2xl border border-[#E2B84B]/40 bg-[#C99732]/95 px-8 text-base font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 hover:bg-[#D5A43A] hover:shadow-[0_16px_50px_rgba(201,151,50,0.25)]"
          >
            <span>Login</span>

            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Small security indicator */}
        <div className="absolute bottom-10 right-10 hidden items-center gap-2 text-[10px] tracking-[0.18em] text-white/40 lg:flex">
          <ShieldCheck size={14} />
          SECURE ACCESS
        </div>
      </div>
    </main>
  );
}