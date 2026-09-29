"use client";

import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Activity,
  Car,
  ChevronRight,
  DoorOpen,
  History,
  LogOut,
  UserCog,
  Users,
} from "lucide-react";
import api from "@/Services/api";
import { clearUser } from "@/store/slices/authSlice";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const [loggingOut, setLoggingOut] = useState(false);

  const managementCards = [
    {
      title: "All Users",
      description:
        "View and manage all registered users in the system.",
      icon: <Users size={30} />,
      color: "from-blue-600 to-indigo-700",
      href: "/admin/users",
      action: "Manage Users",
    },
    {
      title: "Add / Edit Owner",
      description:
        "Register a new owner and manage owner information.",
      icon: <UserCog size={30} />,
      color: "from-purple-600 to-fuchsia-700",
      href: "/admin/owner",
      action: "Add Owner",
    },
    {
      title: "Add / Edit Employee Car",
      description:
        "Manage cars assigned to roller and security employees.",
      icon: <Car size={30} />,
      color: "from-orange-500 to-red-600",
      href: "/admin/employee-cars",
      action: "Manage Cars",
    },
    {
      title: "Add / Edit Gate",
      description:
        "Create and manage compound entry and exit gates.",
      icon: <DoorOpen size={30} />,
      color: "from-emerald-500 to-teal-700",
      href: "/admin/gates",
      action: "Manage Gates",
    },
    {
      title: "Users Logs",
      description:
        "Monitor user login, logout, vehicle entry and exit activities.",
      icon: <History size={30} />,
      color: "from-cyan-600 to-blue-700",
      href: "/admin/logs",
      action: "View Logs",
    },
    {
      title: "System Monitor",
      description:
        "Monitor security operations and system activity.",
      icon: <Activity size={30} />,
      color: "from-slate-700 to-gray-900",
      href: "/admin/system-monitor",
      action: "Open Monitor",
    },
  ];

  /* =========================================================
     HANDLE LOGOUT
  =========================================================
     
     Logout flow:
     
     1. POST /auth/logout to the BACKEND.
     2. Clear the Next.js frontend middleware cookies.
     3. Clear Redux authentication state.
     4. Hard redirect to /login.
     
     Backend request:
     
     POST /auth/logout
     
     {
       "status": "success",
       "message": "Logged out"
     }
     
  ========================================================= */

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      /*
       * =======================================================
       * STEP 1 — BACKEND LOGOUT
       * =======================================================
       */

      const response = await api.post("/auth/logout", {
        status: "success",
        message: "Logged out",
      });

      console.log("BACKEND LOGOUT RESPONSE:");
      console.log(response.data);

      /*
       * =======================================================
       * STEP 2 — CLEAR FRONTEND MIDDLEWARE SESSION
       * =======================================================
       *
       * The backend has already performed the real logout.
       * This only removes the Next.js middleware cookies.
       */

      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "same-origin",
      });

      /*
       * =======================================================
       * STEP 3 — CLEAR REDUX
       * =======================================================
       */

      dispatch(clearUser());

      /*
       * =======================================================
       * STEP 4 — HARD REDIRECT
       * =======================================================
       */

      window.location.replace("/login");
    } catch (error) {
      console.error("BACKEND LOGOUT ERROR:");
      console.error(error);
      console.error("RESPONSE:");
      console.error(error.response?.data);

      /*
       * If the backend session is already expired/invalid,
       * still clean the local frontend state and redirect.
       */

      try {
        await fetch("/api/auth/session", {
          method: "DELETE",
          credentials: "same-origin",
        });
      } catch (frontendSessionError) {
        console.error(
          "Failed to clear frontend session:",
          frontendSessionError,
        );
      }

      dispatch(clearUser());

      window.location.replace("/login");
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
        <section>
          <div className="mb-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Log out"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-950 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={16} />

              <span className="hidden sm:inline">
                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </span>
            </button>

            <h1 className="text-xl font-extrabold uppercase tracking-wider text-blue-600 sm:text-2xl">
              Administration Page
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {managementCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`flex h-15 items-center justify-between bg-linear-to-r ${card.color} px-5 text-white`}
                >
                  <div>{card.icon}</div>

                  <ChevronRight
                    size={22}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 transition group-hover:text-blue-600">
                    {card.title}
                  </h3>

                  <p className="mt-1.5 min-h-10 text-sm leading-5 text-gray-500">
                    {card.description}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3.5 py-2 text-xs font-bold text-white transition group-hover:bg-blue-600">
                    {card.action}

                    <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
