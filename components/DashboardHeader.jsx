"use client";

import { User } from "lucide-react";
import { useSelector } from "react-redux";

export default function DashboardHeader({
  user,
  isLoadingUser = false,
  fallbackName = "User",
  subtitle,
  onProfileClick,
  ariaLabel = "Open user profile",
}) {
  const globalUser = useSelector((state) => state.dashboardHeader.user);
  const effectiveUser = globalUser || user;

  return (
    <div className="bg-linear-to-r from-blue-600 to-blue-800 px-4 py-4 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          {/* <p className="text-sm font-medium text-blue-100">
            Welcome back
          </p> */}

          <h1 className="mt-1 text-3xl font-bold">
            Hello, {isLoadingUser && !globalUser ? "..." : effectiveUser?.name || fallbackName}
          </h1>

          {subtitle && (
            <p className="mt-3 text-lg text-blue-100">
              {subtitle}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onProfileClick}
          aria-label={ariaLabel}
          className="relative z-10 flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white shadow-lg transition duration-200 hover:scale-105 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/30 touch-manipulation"
        >
          <User size={28} className="text-blue-700" />
        </button>
      </div>
    </div>
  );
}