"use client";

import { useEffect, useMemo, useState } from "react";
import useReduxUIState from "@/hooks/useReduxUIState";
import api from "@/Services/api";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Settings2,
  LogIn,
  LogOut,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { BackWard } from "@/utilites/backFunc";

const convertToHindiNumbers = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value).replace(
    /[0-9]/g,
    (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)],
  );
};

const formatDate = (timestamp) => {
  if (!timestamp) return "-";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (timestamp) => {
  if (!timestamp) return "-";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const formatAction = (action) => {
  if (!action) return "-";

  return String(action)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatEntity = (entity) => {
  if (!entity) return "-";

  return String(entity)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDetails = (details) => {
  if (details === null || details === undefined || details === "") {
    return "-";
  }

  if (typeof details === "object") {
    try {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    } catch {
      return JSON.stringify(details);
    }
  }

  return String(details);
};

const normalizeAuditLog = (log, index) => {
  const timestamp =
    log?.createdAt ??
    log?.created_at ??
    log?.timestamp ??
    null;

  const firstName = log?.user?.firstName ?? "";
  const lastName = log?.user?.lastName ?? "";

  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: log?.id ?? log?._id ?? `audit-log-${index}`,

    user:
      fullName ||
      log?.user?.username ||
      log?.userName ||
      log?.name ||
      "-",

    username: log?.user?.username ?? "-",

    role:
      log?.user?.role ??
      log?.role ??
      "-",

    action: formatAction(log?.action),

    entity: formatEntity(log?.entity),

    details: formatDetails(log?.details),

    ip: log?.ip ?? "-",

    userAgent: log?.userAgent ?? "-",

    date: formatDate(timestamp),

    time: formatTime(timestamp),

    createdAt: timestamp,
  };
};

const getActionIcon = (action) => {
  const normalizedAction = String(action || "").toUpperCase();

  if (normalizedAction === "LOGIN") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
        <LogIn size={16} />
      </span>
    );
  }

  if (normalizedAction === "LOGOUT") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        <LogOut size={16} />
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
      <Activity size={16} />
    </span>
  );
};

export default function UserLogs() {
  // =========================================================
  // LOGS DATA
  // =========================================================

  const [logs, setLogs] = useState([]);

  // =========================================================
  // SEARCH
  // =========================================================

  const [search, setSearch] = useReduxUIState(
    "userLogs.search",
    "",
  );

  // =========================================================
  // SORT
  // =========================================================

  const [sortConfig, setSortConfig] = useReduxUIState(
    "userLogs.sortConfig",
    {
      key: null,
      direction: "asc",
    },
  );

  // =========================================================
  // COLUMN VISIBILITY
  // =========================================================

  const [visibleColumns, setVisibleColumns] = useReduxUIState(
    "userLogs.visibleColumns",
    {
      number: true,
      user: true,
      role: true,
      action: true,
      entity: true,
      date: true,
      time: true,
      details: true,
    },
  );

  const [showColumnMenu, setShowColumnMenu] = useReduxUIState(
    "userLogs.showColumnMenu",
    false,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // COLUMN DEFINITIONS
  // =========================================================

  const columnDefinitions = [
    {
      key: "user",
      label: "User",
    },
    {
      key: "role",
      label: "Role",
    },
    {
      key: "action",
      label: "Action",
    },
    {
      key: "entity",
      label: "Entity",
    },
    {
      key: "date",
      label: "Date",
    },
    {
      key: "time",
      label: "Time",
    },
    {
      key: "details",
      label: "Details",
    },
  ];

  // =========================================================
  // SORT
  // =========================================================

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev?.key === key && prev?.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // =========================================================
  // SORT VALUE
  // =========================================================

  const getSortValue = (log, key) => {
    switch (key) {
      case "user":
        return log.user || "";

      case "role":
        return log.role || "";

      case "action":
        return log.action || "";

      case "entity":
        return log.entity || "";

      case "date":
        return log.date || "";

      case "time":
        return log.time || "";

      case "details":
        return log.details || "";

      default:
        return "";
    }
  };

  // =========================================================
  // SORT ICON
  // =========================================================

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) {
      return (
        <ChevronsUpDown
          size={16}
          className="text-gray-400"
        />
      );
    }

    return sortConfig.direction === "asc" ? (
      <ChevronUp
        size={16}
        className="text-blue-600"
      />
    ) : (
      <ChevronDown
        size={16}
        className="text-blue-600"
      />
    );
  };

  // =========================================================
  // SEARCH + SORT
  // =========================================================

  const displayedLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = logs.filter((log) => {
      if (!query) {
        return true;
      }

      const searchableValues = [
        log.user,
        log.username,
        log.role,
        log.action,
        log.entity,
        log.details,
        log.ip,
        log.userAgent,
        log.date,
        log.time,
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    });

    if (!sortConfig?.key) {
      return result;
    }

    return [...result].sort((a, b) => {
      const aValue = String(
        getSortValue(a, sortConfig.key),
      )
        .trim()
        .toLowerCase();

      const bValue = String(
        getSortValue(b, sortConfig.key),
      )
        .trim()
        .toLowerCase();

      const comparison = aValue.localeCompare(
        bValue,
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      );

      return sortConfig.direction === "asc"
        ? comparison
        : -comparison;
    });
  }, [logs, search, sortConfig]);

  // =========================================================
  // COLUMN VISIBILITY
  // =========================================================

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // =========================================================
  // FETCH AUDIT LOGS
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(
          "/audit-logs?page=1&limit=20",
          {
            headers: {
              "Cache-Control":
                "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          },
        );

        const apiLogs =
          response?.data?.data?.logs ?? [];

        const normalizedLogs = Array.isArray(apiLogs)
          ? apiLogs.map((log, index) =>
              normalizeAuditLog(log, index),
            )
          : [];

        if (isMounted) {
          setLogs(normalizedLogs);
        }
      } catch (err) {
        console.error(
          "Failed to fetch audit logs:",
          err,
        );

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load audit logs.",
          );

          setLogs([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLogs();

    // Refresh every 1 minute
    const intervalId = setInterval(() => {
      fetchLogs();
    }, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const visibleColumnCount =
    Object.values(visibleColumns).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-200 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={BackWard}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Activity size={21} />
            </div>

            <h1 className="text-3xl font-bold text-gray-800">
              Audit Logs
            </h1>
          </div>

          <p className="text-sm text-gray-500 sm:text-base">
            View user authentication and system activity
            recorded by the backend.
          </p>
        </div>

        {/* =====================================================
            LOGS TABLE
        ===================================================== */}

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          {error && (
            <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* ===================================================
              TABLE HEADER
          =================================================== */}

          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  System Activity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {displayedLogs.length} of {logs.length} log
                  {logs.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search users, actions, entities..."
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-80"
                  />
                </div>

                {/* =================================================
                    COLUMNS
                ================================================= */}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowColumnMenu(
                        (prev) => !prev,
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
                  >
                    <Settings2 size={17} />

                    Columns

                    <ChevronDown
                      size={16}
                      className={
                        showColumnMenu
                          ? "rotate-180 transition-transform"
                          : "transition-transform"
                      }
                    />
                  </button>

                  {showColumnMenu && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                      <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                        Show / Hide Columns
                      </p>

                      {columnDefinitions.map(
                        (column) => (
                          <label
                            key={column.key}
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={
                                visibleColumns[
                                  column.key
                                ]
                              }
                              onChange={() =>
                                toggleColumn(
                                  column.key,
                                )
                              }
                              className="h-4 w-4 accent-blue-600"
                            />

                            <span className="text-sm font-medium text-gray-700">
                              {column.label}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              TABLE
          =================================================== */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-50">
                <tr>
                  {/* # */}

                  {visibleColumns.number && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      #
                    </th>
                  )}

                  {/* USER */}

                  {visibleColumns.user && (
                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort("user")
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
                      >
                        User
                        {getSortIcon("user")}
                      </button>
                    </th>
                  )}

                  {/* ROLE */}

                  {visibleColumns.role && (
                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort("role")
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
                      >
                        Role
                        {getSortIcon("role")}
                      </button>
                    </th>
                  )}

                  {/* ACTION */}

                  {visibleColumns.action && (
                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort("action")
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
                      >
                        Action
                        {getSortIcon("action")}
                      </button>
                    </th>
                  )}

                  {/* ENTITY */}

                  {visibleColumns.entity && (
                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort("entity")
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
                      >
                        Entity
                        {getSortIcon("entity")}
                      </button>
                    </th>
                  )}

                  {/* DATE */}

                  {visibleColumns.date && (
                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort("date")
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
                      >
                        Date
                        {getSortIcon("date")}
                      </button>
                    </th>
                  )}

                  {/* TIME */}

                  {visibleColumns.time && (
                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort("time")
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
                      >
                        Time
                        {getSortIcon("time")}
                      </button>
                    </th>
                  )}

                  {/* DETAILS */}

                  {visibleColumns.details && (
                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort("details")
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
                      >
                        Details
                        {getSortIcon("details")}
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {/* =================================================
                    LOADING
                ================================================= */}

                {isLoading ? (
                  <tr>
                    <td
                      colSpan={Math.max(
                        visibleColumnCount,
                        1,
                      )}
                      className="px-6 py-16 text-center text-sm font-medium text-gray-500"
                    >
                      Loading audit logs...
                    </td>
                  </tr>
                ) : displayedLogs.length === 0 ? (
                  /* =================================================
                     EMPTY STATE
                  ================================================= */

                  <tr>
                    <td
                      colSpan={Math.max(
                        visibleColumnCount,
                        1,
                      )}
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <Search
                            size={22}
                            className="text-gray-400"
                          />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-gray-600">
                          {search
                            ? "No logs found"
                            : "No audit logs available"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {search
                            ? "Try another search term."
                            : "System activity will appear here when logs are available."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* =================================================
                     LOG ROWS
                  ================================================= */

                  displayedLogs.map(
                    (log, index) => (
                      <tr
                        key={log.id}
                        className="transition hover:bg-blue-50/40"
                      >
                        {/* # */}

                        {visibleColumns.number && (
                          <td className="px-6 py-5 font-semibold text-gray-500">
                            {index + 1}
                          </td>
                        )}

                        {/* USER */}

                        {visibleColumns.user && (
                          <td className="px-6 py-5">
                            <div className="font-semibold text-gray-800">
                              {log.user}
                            </div>

                            {log.username &&
                              log.username !==
                                "-" && (
                                <div className="mt-1 text-xs text-gray-400">
                                  @{log.username}
                                </div>
                              )}
                          </td>
                        )}

                        {/* ROLE */}

                        {visibleColumns.role && (
                          <td className="px-6 py-5">
                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                              {log.role}
                            </span>
                          </td>
                        )}

                        {/* ACTION */}

                        {visibleColumns.action && (
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-2">
                              {getActionIcon(
                                log.action,
                              )}

                              <span className="text-sm font-semibold text-gray-700">
                                {log.action}
                              </span>
                            </span>
                          </td>
                        )}

                        {/* ENTITY */}

                        {visibleColumns.entity && (
                          <td className="px-6 py-5">
                            {log.entity !== "-" ? (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                {log.entity}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                -
                              </span>
                            )}
                          </td>
                        )}

                        {/* DATE */}

                        {visibleColumns.date && (
                          <td className="px-6 py-5 text-gray-600">
                            {log.date}
                          </td>
                        )}

                        {/* TIME */}

                        {visibleColumns.time && (
                          <td className="px-6 py-5 text-gray-600">
                            {log.time}
                          </td>
                        )}

                        {/* DETAILS */}

                        {visibleColumns.details && (
                          <td className="max-w-[320px] px-6 py-5">
                            <span
                              className="block truncate text-sm text-gray-600"
                              title={log.details}
                            >
                              {log.details}
                            </span>
                          </td>
                        )}
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}