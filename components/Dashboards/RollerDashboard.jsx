"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck } from "lucide-react";

import ReusableDataTable from "@/components/tables/ReusableDataTable";
import DashboardHeader from "@/components/DashboardHeader";

import {
  GATE_LOG_COLUMNS,
  renderGateLogCell,
} from "@/components/tables/gateLogTableConfig";

import { MANAGEMENT_BUTTONS } from "@/data/rollerData";
import Profile from "@/components/Profile";
import useCurrentUser from "@/hooks/useCurrentUser";

import {
  fetchAccessLogs,
  setSelectedGate,
} from "@/store/slices/accessLogsSlice";

/* =========================================================
   CONVERT ENGLISH NUMBERS TO HINDI / ARABIC-INDIC NUMBERS
========================================================= */

const convertToHindiNumbers = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value).replace(
    /[0-9]/g,
    (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)],
  );
};

/* =========================================================
   PLATE NUMBER
========================================================= */

const getPlateNumber = (log) => {
  if (!log) {
    return "-";
  }

  let plateLetters = "";
  let plateNumbers = "";

  /* -------------------------------------------------------
     REGISTERED VEHICLE
  ------------------------------------------------------- */

  if (
    log.vehicle &&
    typeof log.vehicle === "object"
  ) {
    plateLetters =
      log.vehicle.plateLetters ??
      log.vehicle.plateLettersNormalized ??
      log.plateLetters ??
      log.plateLettersNormalized ??
      "";

    plateNumbers =
      log.vehicle.plateNumbers ??
      log.vehicle.plateNumbersNormalized ??
      log.plateNumbers ??
      log.plateNumbersNormalized ??
      "";
  }

  /* -------------------------------------------------------
     DIRECT ACCESS LOG FIELDS
  ------------------------------------------------------- */

  if (!plateLetters) {
    plateLetters =
      log.plateLetters ??
      log.plateLettersNormalized ??
      "";
  }

  if (!plateNumbers) {
    plateNumbers =
      log.plateNumbers ??
      log.plateNumbersNormalized ??
      "";
  }

  /* -------------------------------------------------------
     DENIED LOG
  ------------------------------------------------------- */

  if (
    !plateLetters &&
    !plateNumbers &&
    log.plateNumber
  ) {
    return convertToHindiNumbers(
      log.plateNumber,
    );
  }

  const formattedNumbers =
    convertToHindiNumbers(
      plateNumbers,
    );

  if (
    plateLetters &&
    formattedNumbers
  ) {
    return `${plateLetters} ${formattedNumbers}`;
  }

  if (plateLetters) {
    return plateLetters;
  }

  if (formattedNumbers) {
    return formattedNumbers;
  }

  if (log.plateNumber) {
    return convertToHindiNumbers(
      log.plateNumber,
    );
  }

  return "-";
};

/* =========================================================
   GATE ID
========================================================= */

const getGateId = (log) => {
  if (!log) {
    return "";
  }

  if (
    log.gateId !== null &&
    log.gateId !== undefined &&
    String(log.gateId).trim() !== ""
  ) {
    return String(log.gateId);
  }

  if (
    log.gate &&
    typeof log.gate === "object"
  ) {
    return log.gate.id
      ? String(log.gate.id)
      : "";
  }

  return "";
};

/* =========================================================
   GATE NAME
========================================================= */

const getGateName = (log) => {
  if (!log) {
    return "";
  }

  /* Direct gateName */

  if (
    log.gateName !== null &&
    log.gateName !== undefined &&
    String(log.gateName).trim() !== ""
  ) {
    return String(log.gateName).trim();
  }

  /* Nested gate */

  if (
    log.gate &&
    typeof log.gate === "object"
  ) {
    if (
      log.gate.gateName !== null &&
      log.gate.gateName !== undefined &&
      String(log.gate.gateName).trim() !== ""
    ) {
      return String(
        log.gate.gateName,
      ).trim();
    }

    if (
      log.gate.name !== null &&
      log.gate.name !== undefined &&
      String(log.gate.name).trim() !== ""
    ) {
      return String(
        log.gate.name,
      ).trim();
    }

    if (
      log.gate.code !== null &&
      log.gate.code !== undefined &&
      String(log.gate.code).trim() !== ""
    ) {
      return String(
        log.gate.code,
      ).trim();
    }
  }

  /* Gate string */

  if (
    typeof log.gate === "string" &&
    log.gate.trim() !== ""
  ) {
    return log.gate.trim();
  }

  /* Raw gate */

  if (
    typeof log.gateRaw === "string" &&
    log.gateRaw.trim() !== ""
  ) {
    return log.gateRaw.trim();
  }

  return "";
};

/* =========================================================
   GATE DISPLAY VALUE
========================================================= */

const getGateNumber = (log) => {
  return getGateName(log) || "-";
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (timestamp) => {
  if (!timestamp) {
    return "-";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
};

/* =========================================================
   TIME
========================================================= */

const formatTime = (timestamp) => {
  if (!timestamp) {
    return "-";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    },
  );
};

/* =========================================================
   BRAND
========================================================= */

const getBrand = (log) => {
  if (!log) {
    return "-";
  }

  if (
    log.vehicle &&
    typeof log.vehicle === "object"
  ) {
    if (
      log.vehicle.brand !== null &&
      log.vehicle.brand !== undefined &&
      String(
        log.vehicle.brand,
      ).trim() !== ""
    ) {
      return log.vehicle.brand;
    }
  }

  if (
    log.brand !== null &&
    log.brand !== undefined &&
    String(log.brand).trim() !== ""
  ) {
    return log.brand;
  }

  return "-";
};

/* =========================================================
   COLOR
========================================================= */

const getColor = (log) => {
  if (!log) {
    return "-";
  }

  if (
    log.vehicle &&
    typeof log.vehicle === "object"
  ) {
    if (
      log.vehicle.color !== null &&
      log.vehicle.color !== undefined &&
      String(
        log.vehicle.color,
      ).trim() !== ""
    ) {
      return log.vehicle.color;
    }
  }

  if (
    log.color !== null &&
    log.color !== undefined &&
    String(log.color).trim() !== ""
  ) {
    return log.color;
  }

  return "-";
};

/* =========================================================
   OWNER NAME
========================================================= */

const getOwnerName = (log) => {
  if (!log) {
    return "-";
  }

  /* Direct string owner */

  if (
    typeof log.owner === "string" &&
    log.owner.trim() !== ""
  ) {
    return log.owner.trim();
  }

  /* Owner object */

  if (
    log.owner &&
    typeof log.owner === "object" &&
    !Array.isArray(log.owner)
  ) {
    if (
      typeof log.owner.name === "string" &&
      log.owner.name.trim()
    ) {
      return log.owner.name.trim();
    }

    if (
      typeof log.owner.fullName === "string" &&
      log.owner.fullName.trim()
    ) {
      return log.owner.fullName.trim();
    }

    const firstName =
      typeof log.owner.firstName ===
      "string"
        ? log.owner.firstName.trim()
        : "";

    const lastName =
      typeof log.owner.lastName ===
      "string"
        ? log.owner.lastName.trim()
        : "";

    const fullName =
      `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }
  }

  /* Vehicle owner */

  if (
    log.vehicle &&
    typeof log.vehicle === "object"
  ) {
    if (
      typeof log.vehicle.owner ===
        "string" &&
      log.vehicle.owner.trim()
    ) {
      return log.vehicle.owner.trim();
    }

    if (
      log.vehicle.owner &&
      typeof log.vehicle.owner ===
        "object" &&
      !Array.isArray(
        log.vehicle.owner,
      )
    ) {
      const vehicleOwner =
        log.vehicle.owner;

      if (
        typeof vehicleOwner.name ===
          "string" &&
        vehicleOwner.name.trim()
      ) {
        return vehicleOwner.name.trim();
      }

      if (
        typeof vehicleOwner.fullName ===
          "string" &&
        vehicleOwner.fullName.trim()
      ) {
        return vehicleOwner.fullName.trim();
      }

      const firstName =
        typeof vehicleOwner.firstName ===
        "string"
          ? vehicleOwner.firstName.trim()
          : "";

      const lastName =
        typeof vehicleOwner.lastName ===
        "string"
          ? vehicleOwner.lastName.trim()
          : "";

      const fullName =
        `${firstName} ${lastName}`.trim();

      if (fullName) {
        return fullName;
      }
    }
  }

  if (
    typeof log.employeeName ===
      "string" &&
    log.employeeName.trim()
  ) {
    return log.employeeName.trim();
  }

  if (
    typeof log.ownerName ===
      "string" &&
    log.ownerName.trim()
  ) {
    return log.ownerName.trim();
  }

  return "-";
};

/* =========================================================
   UNIT NUMBER
========================================================= */

const getUnitNumber = (log) => {
  if (!log) {
    return "-";
  }

  if (
    log.vehicle &&
    typeof log.vehicle === "object"
  ) {
    const owner =
      log.vehicle.owner;

    if (
      owner &&
      typeof owner === "object"
    ) {
      const unit =
        owner.unit;

      if (
        unit &&
        typeof unit === "object"
      ) {
        return (
          unit.unitCode ||
          unit.code ||
          unit.number ||
          "-"
        );
      }

      if (
        typeof unit === "string" &&
        unit.trim()
      ) {
        return unit;
      }
    }
  }

  if (
    log.unitNumber !== null &&
    log.unitNumber !== undefined &&
    String(log.unitNumber).trim() !== ""
  ) {
    return log.unitNumber;
  }

  if (
    log.unit &&
    typeof log.unit === "object"
  ) {
    return (
      log.unit.unitCode ||
      log.unit.code ||
      log.unit.number ||
      "-"
    );
  }

  if (
    typeof log.unit === "string" &&
    log.unit.trim()
  ) {
    return log.unit;
  }

  return "-";
};

/* =========================================================
   DIRECTION
========================================================= */

const getDirection = (action) => {
  if (!action) {
    return "-";
  }

  switch (
    String(action).toUpperCase()
  ) {
    case "ENTRY":
      return "Gate In";

    case "EXIT":
      return "Gate Out";

    case "DENIED":
      return "Access Denied";

    default:
      return action;
  }
};

/* =========================================================
   FORMAT ACCESS LOG
========================================================= */

const formatAccessLog = (
  log,
  index,
) => {
  const timestamp =
    log.createdAt ||
    log.timestamp ||
    log.updatedAt ||
    null;

  const plateNumber =
    getPlateNumber(log);

  const owner =
    getOwnerName(log);

  const unitNumber =
    getUnitNumber(log);

  const brand =
    getBrand(log);

  const color =
    getColor(log);

  const gate =
    getGateNumber(log);

  const gateId =
    getGateId(log);

  const gateName =
    getGateName(log);

  const direction =
    getDirection(log.action);

  return {
    ...log,

    id:
      log.id ||
      `log-${index}`,

    gateId,

    gateName,

    gate,

    plateNumber,

    plateNumbers:
      plateNumber,

    brand,

    color,

    owner,

    ownerName:
      owner,

    unitNumber,

    unit:
      unitNumber,

    direction,

    date:
      formatDate(timestamp),

    time:
      formatTime(timestamp),

    timestamp,
  };
};

/* =========================================================
   NORMALIZE GATE VALUE
========================================================= */

const normalizeGateValue = (
  value,
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
};

/* =========================================================
   CHECK WHETHER LOG MATCHES GATE
========================================================= */

const logMatchesGate = (
  log,
  selectedGate,
) => {
  /*
   * No selected gate means
   * show all logs.
   */
  if (
    selectedGate === null ||
    selectedGate === undefined ||
    selectedGate === "" ||
    selectedGate === "all" ||
    selectedGate === "ALL"
  ) {
    return true;
  }

  const selected =
    normalizeGateValue(
      selectedGate,
    );

  if (!selected) {
    return true;
  }

  const gateId =
    normalizeGateValue(
      getGateId(log),
    );

  const gateName =
    normalizeGateValue(
      getGateName(log),
    );

  const gate =
    normalizeGateValue(
      getGateNumber(log),
    );

  /*
   * Match by:
   * - Gate ID
   * - Gate name
   * - Displayed gate value
   */
  return (
    selected === gateId ||
    selected === gateName ||
    selected === gate
  );
};

/* =========================================================
   ROLLER DASHBOARD
========================================================= */

export default function RollerDashboard() {
  const router =
    useRouter();

  const dispatch =
    useDispatch();

  /* =======================================================
     CURRENT USER
  ======================================================= */

  const {
    user,
    rawUser,
    loading: isLoadingUser,
    refetch: refetchUser,
  } = useCurrentUser();

  const [
    isProfileOpen,
    setIsProfileOpen,
  ] = useState(false);

  /* =======================================================
     REDUX ACCESS LOGS
  ======================================================= */

  const {
    accessLogs:
      reduxAccessLogs = [],

    isLoadingLogs = false,

    logsError = "",

    selectedGate = "all",
  } = useSelector(
    (state) =>
      state.accessLogs || {
        accessLogs: [],
        isLoadingLogs: false,
        logsError: "",
        selectedGate: "all",
      },
  );

  /* =======================================================
     FORMAT LOGS
  ======================================================= */

  const accessLogs =
    useMemo(() => {
      if (
        !Array.isArray(
          reduxAccessLogs,
        )
      ) {
        return [];
      }

      return reduxAccessLogs.map(
        (log, index) =>
          log?.direction &&
          log?.date &&
          log?.time &&
          log?.plateNumber !==
            undefined
            ? log
            : formatAccessLog(
                log,
                index,
              ),
      );
    }, [reduxAccessLogs]);

  /* =======================================================
     FETCH ACCESS LOGS
  ======================================================= */

  useEffect(() => {
    dispatch(
      fetchAccessLogs(),
    );
  }, [dispatch]);

  /* =======================================================
     GATE OPTIONS
     
     These values are supplied to ReusableDataTable
     through the gate-filter API.
  ======================================================= */

  const gateOptions =
    useMemo(() => {
      const gates =
        accessLogs
          .map(
            (log) =>
              log.gate,
          )
          .filter(
            (gate) =>
              gate &&
              gate !== "-" &&
              String(gate).trim() !== "",
          );

      return [
        "all",
        ...Array.from(
          new Set(gates),
        ),
      ];
    }, [accessLogs]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    setIsProfileOpen(false);

    router.push("/login");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-200">

      {/* =================================================
          SHARED HEADER
      ================================================= */}

      <DashboardHeader
        user={user}
        isLoadingUser={
          isLoadingUser
        }
        fallbackName="Roller"
        subtitle="Roller Dashboard"
        onProfileClick={() =>
          setIsProfileOpen(true)
        }
        ariaLabel="Open roller profile"
      />

      {/* =================================================
          PROFILE PANEL
      ================================================= */}

      {isProfileOpen && (
        <Profile
          dashboardType="roller"

          onClose={() =>
            setIsProfileOpen(false)
          }

          onLogout={
            handleLogout
          }

          currentUser={
            user
          }

          currentUserRaw={
            rawUser
          }

          currentUserLoading={
            isLoadingUser
          }

          onUserUpdated={
            refetchUser
          }
        />
      )}

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* =================================================
            ROLLER MANAGEMENT
        ================================================= */}

        <div className="mb-8 rounded-3xl bg-white p-6 shadow-lg">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <ShieldCheck className="text-blue-600" />

                Roller Management
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage employees and vehicles under your
                authority.
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              Extended management permissions
            </div>

          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">

            {MANAGEMENT_BUTTONS.map(
              (btn) => {
                const Icon =
                  btn.icon;

                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() =>
                      router.push(
                        btn.route,
                      )
                    }
                    className={`flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left transition ${btn.hoverBorder} ${btn.hoverBg}`}
                  >
                    <div
                      className={`rounded-xl ${btn.bgColor} p-3 ${btn.iconColor}`}
                    >
                      <Icon size={23} />
                    </div>

                    <div>
                      <p className="font-bold text-gray-800">
                        {btn.label}
                      </p>

                      <p className="text-sm text-gray-500">
                        {btn.description}
                      </p>
                    </div>
                  </button>
                );
              },
            )}

          </div>

        </div>

        {/* =================================================
            ACCESS LOG TABLE
             
            IMPORTANT:
            Gate filter is NOT rendered outside the table.

            ReusableDataTable receives the exact same
            gate-filter props used by SupervisorDashboard.

            Therefore the table controls its position:
            
            SEARCH
              ↓
            GATE FILTER
              ↓
            SHOW / HIDE COLUMNS
        ================================================= */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">

          {/* =================================================
              API ERROR
          ================================================= */}

          {logsError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {logsError}
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {isLoadingLogs ? (
            <div className="flex min-h-62.5 items-center justify-center">

              <div className="text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

                <p className="mt-3 text-sm font-medium text-gray-500">
                  Loading access logs...
                </p>

              </div>

            </div>
          ) : (

            /* =================================================
               DATA TABLE
            ================================================= */

            <ReusableDataTable
              data={
                accessLogs
              }

              columns={
                GATE_LOG_COLUMNS
              }

              renderCell={
                renderGateLogCell
              }

              initialSortField="timestamp"

              initialSortDirection="asc"

              searchPlaceholder="Search date, time, plate, brand, color, owner, unit, gate or direction..."

              emptyMessage="Selected gate not found."

              minWidth="min-w-[1100px]"

              title="Access Records"

              titleIcon={
                ShieldCheck
              }

              showSearch

              showSort

              showColumnVisibility

              showResultCount

              resultCountLabel="record"

              /* =================================================
                 SAME GATE FILTER API AS SUPERVISOR DASHBOARD
              ================================================= */

              showGateFilter

              gateFilterId="roller-gate-select"

              gateFilterLabel="Gate Selection"

              gateFilterAllLabel="All Gates"

              /*
               * Gate options generated from Roller access logs.
               */
              gateFilterOptions={
                gateOptions
              }

              /*
               * Redux selected gate.
               *
               * ReusableDataTable should use this value for
               * the currently selected gate.
               */
              selectedGate={
                selectedGate
              }

              /*
               * Redux connection.
               *
               * Whenever the user changes the gate,
               * update accessLogsSlice.
               */
              onGateChange={(
                value,
              ) =>
                dispatch(
                  setSelectedGate(
                    value,
                  ),
                )
              }

              /* =================================================
                 ACTUAL GATE FILTERING
                 
                 ReusableDataTable passes the selected gate
                 as the second argument exactly like the
                 Supervisor Dashboard.
              ================================================= */

              externalFilter={(
                log,
                selectedGateFromTable,
              ) =>
                logMatchesGate(
                  log,
                  selectedGateFromTable ??
                    selectedGate,
                )
              }
            />

          )}

        </div>

      </div>

    </div>
  );
}

