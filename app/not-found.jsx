"use client";

import { useRouter } from "next/navigation";
import {
ArrowLeft,
ArrowRight,
Car,
Home,
MapPin,
Search,
} from "lucide-react";

export default function NotFound() {
const router = useRouter();

return ( <main className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-6 py-12"> <div className="w-full max-w-6xl"> <div className="relative overflow-hidden rounded-4xl bg-white shadow-[0_20px_70px_rgba(15,23,42,0.10)] border border-slate-100">

      {/* Decorative background elements */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-100/50 blur-3xl" />

      <div className="relative grid lg:grid-cols-2 min-h-155">
        
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-14">
          
          {/* Small badge */}
          <div className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-7">
            <MapPin className="w-4 h-4" />
            Page Not Found
          </div>

          {/* 404 */}
          <div className="mb-2">
            <h1 className="text-[110px] sm:text-[140px] leading-none font-black tracking-[-0.07em] text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600">
              404
            </h1>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            Looks like you took
            <span className="block text-blue-600">
              a wrong turn.
            </span>
          </h2>

          <p className="mt-5 max-w-lg text-slate-500 text-base sm:text-lg leading-7">
            The page you are looking for doesn&apos;t exist, has been moved,
            or may have been removed. Let&apos;s get you back on the right road.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-9">
            <button
              onClick={() => router.push("/")}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5" />
              Go Home
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Helpful text */}
          <div className="flex items-center gap-3 mt-8 text-sm text-slate-400">
            <Search className="w-4 h-4" />
            <span>Check the URL or return to the main page.</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex items-center justify-center px-8 py-14 lg:py-0 bg-linear-to-br from-[#eff6ff] via-[#eef2ff] to-[#f5f3ff]">
          
          {/* Road */}
          <div className="absolute bottom-0 left-0 right-0 h-[45%] overflow-hidden">
            <div className="absolute -bottom-45 left-1/2 -translate-x-1/2 w-225 h-125 bg-slate-800 rounded-[50%]" />
            
            {/* Road lines */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-28 bg-yellow-400 rounded-full" />
            <div className="absolute -bottom-25 left-1/2 -translate-x-1/2 w-3 h-28 bg-yellow-400 rounded-full" />
          </div>

          {/* Clouds */}
          <div className="absolute top-16 left-12 w-20 h-8 bg-white rounded-full opacity-80" />
          <div className="absolute top-12 left-20 w-12 h-12 bg-white rounded-full opacity-80" />

          <div className="absolute top-28 right-16 w-24 h-8 bg-white rounded-full opacity-70" />
          <div className="absolute top-24 right-24 w-12 h-12 bg-white rounded-full opacity-70" />

          {/* Car illustration */}
          <div className="relative z-10 w-full max-w-107.5">
            
            {/* Floating 404 circle */}
            <div className="absolute -top-10 right-4 sm:right-10 flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl border border-slate-100 rotate-6">
              <span className="text-lg font-black text-blue-600">
                404
              </span>
            </div>

            {/* Car shadow */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[320px] h-8 bg-slate-900/20 blur-xl rounded-full" />

            {/* Car body */}
            <div className="relative">
              {/* Main body */}
              <div className="relative h-40 sm:h-48 bg-linear-to-b from-blue-500 to-blue-700 rounded-[55px] rounded-b-[35px] shadow-2xl shadow-blue-900/30 border-b-8 border-blue-900/20">
                
                {/* Roof */}
                <div className="absolute -top-20 left-[18%] w-[64%] h-28 bg-linear-to-b from-blue-500 to-blue-600 rounded-t-[80px] rounded-b-[25px]" />

                {/* Windows */}
                <div className="absolute -top-14 left-[25%] w-[23%] h-16 bg-slate-800/90 rounded-t-[25px] rounded-bl-lg skew-x-[-8deg] border-4 border-blue-400/30" />

                <div className="absolute -top-14 right-[25%] w-[23%] h-16 bg-slate-800/90 rounded-t-[25px] rounded-br-lg skew-x-[8deg] border-4 border-blue-400/30" />

                {/* Headlights */}
                <div className="absolute top-14 left-5 w-14 h-8 bg-yellow-200 rounded-full shadow-[0_0_25px_rgba(253,224,71,0.8)]" />
                <div className="absolute top-14 right-5 w-14 h-8 bg-yellow-200 rounded-full shadow-[0_0_25px_rgba(253,224,71,0.8)]" />

                {/* Front grille */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-24 h-8 bg-slate-900/70 rounded-full border border-slate-700">
                  <div className="flex justify-center gap-1.5 pt-2">
                    <span className="w-2 h-1 bg-slate-500 rounded-full" />
                    <span className="w-2 h-1 bg-slate-500 rounded-full" />
                    <span className="w-2 h-1 bg-slate-500 rounded-full" />
                    <span className="w-2 h-1 bg-slate-500 rounded-full" />
                  </div>
                </div>

                {/* Plate */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white rounded-md shadow-md border border-slate-200">
                  <span className="text-xs font-black tracking-widest text-slate-800">
                    LOST
                  </span>
                </div>

                {/* Wheels */}
                <div className="absolute -bottom-9 left-12 sm:left-16 w-20 h-20 bg-slate-900 rounded-full border-10 border-slate-700 shadow-xl">
                  <div className="absolute inset-4 rounded-full bg-slate-400 border-4 border-slate-500" />
                  <div className="absolute inset-5.75 rounded-full bg-slate-700" />
                </div>

                <div className="absolute -bottom-9 right-12 sm:right-16 w-20 h-20 bg-slate-900 rounded-full border-10 border-slate-700 shadow-xl">
                  <div className="absolute inset-4 rounded-full bg-slate-400 border-4 border-slate-500" />
                  <div className="absolute inset-5.75 rounded-full bg-slate-700" />
                </div>
              </div>
            </div>

            {/* Road label */}
            <div className="relative mt-20 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur shadow-lg border border-white">
                <Car className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">
                  Navigation Error
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <p className="text-center text-sm text-slate-400 mt-6">
      Car Plate Management System
    </p>
  </div>
</main>
);
}
