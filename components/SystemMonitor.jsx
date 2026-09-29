"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import ReusableDataTable from "@/components/tables/ReusableDataTable";

import {
  GATE_LOG_COLUMNS,
  renderGateLogCell,
} from "@/components/tables/gateLogTableConfig";

import api from "@/Services/api";

import { BackWard } from "@/utilites/backFunc";

import {
  setAccessLogs,
  setLoadingLogs,
  setLogsError,
  setSelectedGate,
} from "@/store/slices/supervisorDashboardSlice";

/* =========================================================
   CONVERT WESTERN NUMBERS TO ARABIC-INDIC NUMBERS
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

  /*
   * =======================================================
   * REGISTERED VEHICLE
   * =======================================================
   */

  if (
    log.vehicle &&
    typeof log.vehicle === "object"
  ) {
    const plateLetters =
      log.vehicle.plateLetters ||
      log.vehicle.plateLettersNormalized ||
      "";

    const plateNumbers =
      log.vehicle.plateNumbers ||
      log.vehicle.plateNumbersNormalized ||
      "";

    const formattedNumbers =
      convertToHindiNumbers(plateNumbers);

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
  }

  /*
   * =======================================================
   * DIRECT ACCESS LOG FIELDS
   * =======================================================
   */

  const plateLetters =
    log.plateLetters ||
    log.plateLettersNormalized ||
    "";

  const plateNumbers =
    log.plateNumbers ||
    log.plateNumbersNormalized ||
    "";

  const formattedNumbers =
    convertToHindiNumbers(plateNumbers);

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

  /*
   * =======================================================
   * DENIED ACCESS LOG
   * =======================================================
   */

  if (log.plateNumber) {
    return convertToHindiNumbers(
      log.plateNumber,
    );
  }

  return "-";
};

/* =========================================================
   GATE ID
   USED FOR FILTERING
========================================================= */

const getGateId = (log) => {
  if (!log) {
    return "";
  }

  if (
    log.gateId !== null &&
    log.gateId !== undefined
  ) {
    return String(log.gateId);
  }

  if (
    log.gate &&
    typeof log.gate === "object"
  ) {
    return String(
      log.gate.id ||
        log.gate.gateId ||
        "",
    );
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

  if (
    typeof log.gateName === "string" &&
    log.gateName.trim()
  ) {
    return log.gateName.trim();
  }

  if (
    log.gate &&
    typeof log.gate === "object"
  ) {
    return (
      log.gate.gateName ||
      log.gate.name ||
      log.gate.code ||
      log.gate.number ||
      ""
    );
  }

  if (
    typeof log.gate === "string" &&
    log.gate.trim()
  ) {
    return log.gate.trim();
  }

  if (
    typeof log.gateRaw === "string" &&
    log.gateRaw.trim()
  ) {
    return log.gateRaw.trim();
  }

  return "";
};

/* =========================================================
   GATE DISPLAY VALUE
========================================================= */

const getGateNumber = (log) => {
  if (!log) {
    return "-";
  }

  const gateName = getGateName(log);

  if (gateName) {
    return gateName;
  }

  const gateId = getGateId(log);

  if (gateId) {
    return gateId;
  }

  return "-";
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

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
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

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    },
  ).format(date);
};

/* =========================================================
   BRAND
========================================================= */

const getBrand = (log) => {
  if (!log) {
    return "-";
  }

  if (
    typeof log.brand === "string" &&
    log.brand.trim()
  ) {
    return log.brand.trim();
  }

  if (
    log.vehicle &&
    typeof log.vehicle === "object"
  ) {
    if (
      typeof log.vehicle.brand === "string" &&
      log.vehicle.brand.trim()
    ) {
      return log.vehicle.brand.trim();
    }
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
    typeof log.color === "string" &&
    log.color.trim()
  ) {
    return log.color.trim();
  }

  if (
    log.vehicle &&
    typeof log.vehicle === "object"
  ) {
    if (
      typeof log.vehicle.color === "string" &&
      log.vehicle.color.trim()
    ) {
      return log.vehicle.color.trim();
    }
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

  /*
   * =======================================================
   * DIRECT OWNER STRING
   * =======================================================
   */

  if (
    typeof log.owner === "string" &&
    log.owner.trim()
  ) {
    return log.owner.trim();
  }

  /*
   * =======================================================
   * DIRECT OWNER OBJECT
   * =======================================================
   */

  if (
    log.owner &&
    typeof log.owner === "object"
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
      typeof log.owner.firstName === "string"
        ? log.owner.firstName.trim()
        : "";

    const lastName =
      typeof log.owner.lastName === "string"
        ? log.owner.lastName.trim()
        : "";

    const fullName =
      `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }
  }

  /*
   * =======================================================
   * VEHICLE OWNER
   * =======================================================
   */

  if (
    log.vehicle &&
    typeof log.vehicle === "object"
  ) {
    const vehicleOwner =
      log.vehicle.owner;

    if (
      vehicleOwner &&
      typeof vehicleOwner === "object"
    ) {
      if (
        typeof vehicleOwner.name === "string" &&
        vehicleOwner.name.trim()
      ) {
        return vehicleOwner.name.trim();
      }

      if (
        typeof vehicleOwner.fullName === "string" &&
        vehicleOwner.fullName.trim()
      ) {
        return vehicleOwner.fullName.trim();
      }

      const firstName =
        typeof vehicleOwner.firstName === "string"
          ? vehicleOwner.firstName.trim()
          : "";

      const lastName =
        typeof vehicleOwner.lastName === "string"
          ? vehicleOwner.lastName.trim()
          : "";

      const fullName =
        `${firstName} ${lastName}`.trim();

      if (fullName) {
        return fullName;
      }
    }
  }

  /*
   * =======================================================
   * EMPLOYEE
   * =======================================================
   */

  if (
    typeof log.employeeName === "string" &&
    log.employeeName.trim()
  ) {
    return log.employeeName.trim();
  }

  /*
   * =======================================================
   * OWNER NAME
   * =======================================================
   */

  if (
    typeof log.ownerName === "string" &&
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

  /*
   * =======================================================
   * REGISTERED VEHICLE OWNER UNIT
   * =======================================================
   */

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
      const unit = owner.unit;

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
        return unit.trim();
      }
    }
  }

  /*
   * =======================================================
   * DIRECT UNIT NUMBER
   * =======================================================
   */

  if (
    log.unitNumber !== null &&
    log.unitNumber !== undefined &&
    String(log.unitNumber).trim()
  ) {
    return log.unitNumber;
  }

  /*
   * =======================================================
   * DIRECT UNIT OBJECT
   * =======================================================
   */

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

  /*
   * =======================================================
   * DIRECT UNIT STRING
   * =======================================================
   */

  if (
    typeof log.unit === "string" &&
    log.unit.trim()
  ) {
    return log.unit.trim();
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
    /*
     * Keep original API fields.
     */
    ...log,

    /*
     * ID
     */
    id:
      log.id ||
      `log-${index}`,

    /*
     * GATE
     */
    gateId,
    gateName,
    gate,

    /*
     * PLATE
     */
    plateNumber,
    plateNumbers:
      plateNumber,

    /*
     * VEHICLE
     */
    brand,
    color,

    /*
     * OWNER
     */
    owner,
    ownerName:
      owner,

    /*
     * UNIT
     */
    unitNumber,
    unit:
      unitNumber,

    /*
     * DIRECTION
     */
    direction,

    /*
     * DATE / TIME
     */
    date:
      formatDate(timestamp),

    time:
      formatTime(timestamp),

    timestamp,
  };
};

/* =========================================================
   SYSTEM MONITOR
========================================================= */

export default function SystemMonitor() {
  const dispatch =
    useDispatch();

  /* =======================================================
     REDUX STATE
  ======================================================= */

  const {
    accessLogs = [],
    isLoadingLogs = false,
    logsError = "",
    selectedGate = "all",
  } = useSelector(
    (state) =>
      state.supervisorDashboard || {
        accessLogs: [],
        isLoadingLogs: false,
        logsError: "",
        selectedGate: "all",
      },
  );

  /* =======================================================
     FETCH ACCESS LOGS
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchAccessLogs = async () => {
      try {
        dispatch(
          setLoadingLogs(true),
        );

        dispatch(
          setLogsError(""),
        );

        const response =
          await api.get(
            "/access-logs/",
          );

        console.log(
          "System Monitor Access Logs API response:",
          response.data,
        );

        const logs =
          response.data?.data?.logs;

        if (
          !Array.isArray(logs)
        ) {
          console.error(
            "Invalid access logs response:",
            response.data,
          );

          if (isMounted) {
            dispatch(
              setAccessLogs([]),
            );
          }

          return;
        }

        const formattedLogs =
          logs.map(
            (log, index) =>
              formatAccessLog(
                log,
                index,
              ),
          );

        console.log(
          "System Monitor formatted access logs:",
          formattedLogs,
        );

        if (isMounted) {
          dispatch(
            setAccessLogs(
              formattedLogs,
            ),
          );
        }
      } catch (error) {
        console.error(
          "Error fetching system monitor access logs:",
          error,
        );

        if (isMounted) {
          dispatch(
            setLogsError(
              error.response?.data
                ?.message ||
                "Failed to load access logs.",
            ),
          );

          dispatch(
            setAccessLogs([]),
          );
        }
      } finally {
        if (isMounted) {
          dispatch(
            setLoadingLogs(false),
          );
        }
      }
    };

    fetchAccessLogs();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  /* =======================================================
     GATE OPTIONS
  ======================================================= */

  const gateOptions =
    useMemo(() => {
      const values =
        accessLogs
          .map(
            (log) =>
              log.gateId ||
              log.gateName ||
              log.gate ||
              "",
          )
          .filter(Boolean)
          .map((value) =>
            String(value).trim(),
          );

      return [
        "all",
        ...Array.from(
          new Set(values),
        ),
      ];
    }, [accessLogs]);

  /* =======================================================
     GATE FILTER CHANGE
  ======================================================= */

  const handleGateChange = (
    value,
  ) => {
    dispatch(
      setSelectedGate(
        value || "all",
      ),
    );
  };

  /* =======================================================
     GATE FILTER
  ======================================================= */

  const filterByGate = (
    log,
  ) => {
    if (
      selectedGate ===
        "all" ||
      selectedGate === null ||
      selectedGate ===
        undefined
    ) {
      return true;
    }

    const selected =
      String(
        selectedGate,
      )
        .trim()
        .toLowerCase();

    const logGateId =
      String(
        log?.gateId ||
          "",
      )
        .trim()
        .toLowerCase();

    const logGateName =
      String(
        log?.gateName ||
          "",
      )
        .trim()
        .toLowerCase();

    const logGate =
      String(
        log?.gate ||
          "",
      )
        .trim()
        .toLowerCase();

    return (
      logGateId ===
        selected ||
      logGateName ===
        selected ||
      logGate ===
        selected
    );
  };

  /* =======================================================
     SELECTED GATE DISPLAY NAME
  ======================================================= */

  const selectedGateDisplayName =
    useMemo(() => {
      if (
        selectedGate ===
        "all"
      ) {
        return "All Gates";
      }

      const selected =
        String(
          selectedGate,
        )
          .trim()
          .toLowerCase();

      const matchingLog =
        accessLogs.find(
          (log) =>
            String(
              log?.gateId ||
                "",
            )
              .trim()
              .toLowerCase() ===
              selected ||
            String(
              log?.gateName ||
                "",
            )
              .trim()
              .toLowerCase() ===
              selected ||
            String(
              log?.gate ||
                "",
            )
              .trim()
              .toLowerCase() ===
              selected,
        );

      return (
        matchingLog?.gateName ||
        matchingLog?.gate ||
        selectedGate
      );
    }, [
      accessLogs,
      selectedGate,
    ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-200 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            BACK BUTTON ONLY
        ================================================= */}

        <button
          type="button"
          onClick={BackWard}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          <ArrowLeft
            size={18}
          />

          Back to Dashboard
        </button>

        {/* =================================================
            SYSTEM MONITOR TITLE
        ================================================= */}

        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <ShieldCheck
                size={21}
              />
            </div>

            <h1 className="text-3xl font-bold text-gray-800">
              System Monitor
            </h1>
          </div>

          <p className="text-sm text-gray-500 sm:text-base">
            Monitor gate activity,
            vehicle access, and
            entry and exit
            operations.
          </p>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">

          {/* =================================================
              ERROR
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
                  Loading access
                  logs...
                </p>
              </div>
            </div>
          ) : (
            <ReusableDataTable
              data={accessLogs}
              columns={
                GATE_LOG_COLUMNS
              }
              renderCell={
                renderGateLogCell
              }

              /* ===========================================
                 SORTING
              =========================================== */

              initialSortField="timestamp"
              initialSortDirection="asc"

              /* ===========================================
                 SEARCH
              =========================================== */

              searchPlaceholder="Search date, time, plate, brand, color, owner, unit, gate or direction..."

              /* ===========================================
                 EMPTY STATE
              =========================================== */

              emptyMessage="No records found for the selected gate and search criteria."

              /* ===========================================
                 TABLE WIDTH
              =========================================== */

              minWidth="min-w-[1100px]"

              /* ===========================================
                 TITLE
              =========================================== */

              title={`${selectedGateDisplayName} Records`}
              titleIcon={
                ShieldCheck
              }

              /* ===========================================
                 TOOLBAR
                 
                 Final order:
                 
                 Search
                 ↓
                 Gate Selection
                 ↓
                 Show / Hide Columns
              =========================================== */

              showSearch
              showSort
              showColumnVisibility
              showResultCount

              resultCountLabel="record"

              /* ===========================================
                 GATE FILTER
              =========================================== */

              showGateFilter

              gateFilterId="system-monitor-gate-select"

              gateFilterLabel="Gate Selection"

              gateFilterAllLabel="All Gates"

              gateFilterOptions={
                gateOptions
              }

              gateFilterValue={
                String(
                  selectedGate ||
                    "all",
                )
              }

              onGateFilterChange={
                handleGateChange
              }

              /* ===========================================
                 EXTERNAL FILTER
              =========================================== */

              externalFilter={
                filterByGate
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}
