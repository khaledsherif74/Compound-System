"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Car,
  History,
  Phone,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import ReusableDataTable from "@/components/tables/ReusableDataTable";
import AddVehicleForm from "@/components/AddVehicleForm";
import Profile from "@/components/Profile";
import DashboardHeader from "@/components/DashboardHeader";

import {
  OWNER_VEHICLE_COLUMNS,
  OWNER_LOG_COLUMNS,
} from "@/data/ownerDataDashboard";

import api from "@/Services/api";
import useCurrentUser from "@/hooks/useCurrentUser";

import {
  setVehicles,
  setVehiclesLoading,
  setVehiclesError,
  setLogsData,
  setLogsLoading,
  setLogsError,
  setProfileOpen,
  setShowAllVehicles,
  setContactModalOpen,
} from "@/store/slices/ownerDashboardSlice";

/* ============================================================
   STATUS HELPERS
============================================================ */

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

/* ============================================================
   CONVERT ENGLISH NUMBERS TO HINDI / ARABIC-INDIC NUMBERS
============================================================ */

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

/* ============================================================
   FORMAT PLATE LETTERS FOR TABLE
============================================================ */

const formatPlateLettersForTable = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .reverse()
      .join(" ");
  }

  if (typeof value === "string") {
    return value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .reverse()
      .join(" ");
  }

  return "";
};

/* ============================================================
   FORMAT PLATE LETTERS IN ENTERED ORDER
============================================================ */

const formatPlateLettersInEnteredOrder = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .reverse()
      .join(" ");
  }

  if (typeof value === "string") {
    return value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .reverse()
      .join(" ");
  }

  return "";
};

/* ============================================================
   GET VEHICLE PLATE
============================================================ */

const getVehiclePlate = (vehicle) => {
  if (!vehicle) {
    return "-";
  }

  const plateLetters =
    vehicle.plateLetters ??
    vehicle.plateLettersNormalized ??
    "";

  const formattedPlateLetters =
    formatPlateLettersInEnteredOrder(
      plateLetters,
    );

  const plateNumbers =
    vehicle.plateNumbers ??
    vehicle.plateNumbersNormalized ??
    "";

  const convertedNumbers =
    convertToHindiNumbers(
      plateNumbers,
    );

  if (
    formattedPlateLetters &&
    convertedNumbers
  ) {
    return `${formattedPlateLetters} ${convertedNumbers}`;
  }

  if (formattedPlateLetters) {
    return formattedPlateLetters;
  }

  if (convertedNumbers) {
    return convertedNumbers;
  }

  if (vehicle.plateNumber) {
    return convertToHindiNumbers(
      vehicle.plateNumber,
    );
  }

  return "-";
};

/* ============================================================
   GET VEHICLE BRAND
============================================================ */

const getVehicleBrand = (vehicle) => {
  if (!vehicle) {
    return "-";
  }

  if (
    typeof vehicle.brand === "string" &&
    vehicle.brand.trim()
  ) {
    return vehicle.brand;
  }

  if (
    typeof vehicle.vehicleBrand === "string" &&
    vehicle.vehicleBrand.trim()
  ) {
    return vehicle.vehicleBrand;
  }

  if (
    vehicle.vehicle &&
    typeof vehicle.vehicle === "object" &&
    typeof vehicle.vehicle.brand === "string" &&
    vehicle.vehicle.brand.trim()
  ) {
    return vehicle.vehicle.brand;
  }

  return "-";
};

/* ============================================================
   GET VEHICLE COLOR
============================================================ */

const getVehicleColor = (vehicle) => {
  if (!vehicle) {
    return "-";
  }

  if (
    typeof vehicle.color === "string" &&
    vehicle.color.trim()
  ) {
    return vehicle.color;
  }

  if (
    vehicle.vehicle &&
    typeof vehicle.vehicle === "object" &&
    typeof vehicle.vehicle.color === "string" &&
    vehicle.vehicle.color.trim()
  ) {
    return vehicle.vehicle.color;
  }

  return "-";
};

/* ============================================================
   GET VEHICLE MODEL
============================================================ */

const getVehicleModel = (vehicle) => {
  if (!vehicle) {
    return "-";
  }

  if (
    typeof vehicle.model === "string" &&
    vehicle.model.trim()
  ) {
    return vehicle.model;
  }

  if (
    vehicle.vehicle &&
    typeof vehicle.vehicle === "object" &&
    typeof vehicle.vehicle.model === "string" &&
    vehicle.vehicle.model.trim()
  ) {
    return vehicle.vehicle.model;
  }

  return "-";
};

/* ============================================================
   GET GATE CODE
============================================================ */

const getGateCode = (log) => {
  if (!log) {
    return "-";
  }

  if (
    log.gate &&
    typeof log.gate === "object" &&
    !Array.isArray(log.gate)
  ) {
    return (
      log.gate.code ??
      log.gate.name ??
      "-"
    );
  }

  if (
    log.gateNum &&
    typeof log.gateNum === "object" &&
    !Array.isArray(log.gateNum)
  ) {
    return (
      log.gateNum.code ??
      log.gateNum.name ??
      "-"
    );
  }

  if (
    log.gateNumber &&
    typeof log.gateNumber === "object" &&
    !Array.isArray(log.gateNumber)
  ) {
    return (
      log.gateNumber.code ??
      log.gateNumber.name ??
      "-"
    );
  }

  if (
    typeof log.gateRaw === "string" &&
    log.gateRaw.trim()
  ) {
    return log.gateRaw;
  }

  if (
    typeof log.gateNum === "string" &&
    log.gateNum.trim()
  ) {
    return log.gateNum;
  }

  if (
    typeof log.gateNumber === "string" &&
    log.gateNumber.trim()
  ) {
    return log.gateNumber;
  }

  if (
    typeof log.gate === "string" &&
    log.gate.trim()
  ) {
    return log.gate;
  }

  return "-";
};

/* ============================================================
   GET COMPLETE PLATE FROM ACCESS LOG
============================================================ */

const getLogPlate = (log) => {
  if (!log) {
    return "-";
  }

  let plateLetters =
    log.plateLetters ?? "";

  let plateNumbers =
    log.plateNumbers ?? "";

  if (
    log.vehicle &&
    typeof log.vehicle === "object" &&
    !Array.isArray(log.vehicle)
  ) {
    if (!plateLetters) {
      plateLetters =
        log.vehicle.plateLetters ??
        log.vehicle.plateLettersNormalized ??
        "";
    }

    if (!plateNumbers) {
      plateNumbers =
        log.vehicle.plateNumbers ??
        log.vehicle.plateNumbersNormalized ??
        "";
    }
  }

  if (!plateNumbers) {
    plateNumbers =
      log.plateNumber ?? "";
  }

  const formattedPlateLetters =
    formatPlateLettersForTable(
      plateLetters,
    );

  const convertedNumbers =
    convertToHindiNumbers(
      plateNumbers,
    );

  if (
    formattedPlateLetters &&
    convertedNumbers
  ) {
    return `${formattedPlateLetters} ${convertedNumbers}`;
  }

  if (formattedPlateLetters) {
    return formattedPlateLetters;
  }

  if (convertedNumbers) {
    return convertedNumbers;
  }

  return "-";
};

/* ============================================================
   FORMAT DATE
============================================================ */

const formatLogDate = (timestamp) => {
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

/* ============================================================
   FORMAT TIME
============================================================ */

const formatLogTime = (timestamp) => {
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

/* ============================================================
   NORMALIZE VEHICLE LIST ITEM
============================================================ */

const normalizeOwnerVehicle = (vehicle) => {
  if (
    !vehicle ||
    typeof vehicle !== "object"
  ) {
    return null;
  }

  return {
    ...vehicle,

    id:
      vehicle.id ??
      vehicle._id ??
      vehicle.vehicleId,

    plateLetters:
      vehicle.plateLetters ??
      vehicle.plateLettersNormalized ??
      "",

    plateNumbers:
      vehicle.plateNumbers ??
      vehicle.plateNumbersNormalized ??
      "",

    brand:
      vehicle.brand ??
      vehicle.vehicleBrand ??
      "",

    color:
      vehicle.color ??
      vehicle.vehicleColor ??
      "",

    vehicleType:
      vehicle.vehicleType ??
      vehicle.type ??
      "OWNER",
  };
};

/* ============================================================
   EXTRACT OWNER VEHICLES
============================================================ */

const extractOwnerVehicles = (data) => {
  if (Array.isArray(data)) {
    return data
      .map(normalizeOwnerVehicle)
      .filter(Boolean);
  }

  if (
    Array.isArray(
      data?.data?.vehicles,
    )
  ) {
    return data.data.vehicles
      .map(normalizeOwnerVehicle)
      .filter(Boolean);
  }

  if (Array.isArray(data?.data)) {
    return data.data
      .map(normalizeOwnerVehicle)
      .filter(Boolean);
  }

  if (Array.isArray(data?.vehicles)) {
    return data.vehicles
      .map(normalizeOwnerVehicle)
      .filter(Boolean);
  }

  return [];
};

/* ============================================================
   EXTRACT OWNER LOGS
   IMPORTANT:
   /access-logs/my returns logs for the authenticated owner only.
============================================================ */

const extractOwnerLogs = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.data?.logs,
    )
  ) {
    return data.data.logs;
  }

  if (
    Array.isArray(
      data?.logs,
    )
  ) {
    return data.logs;
  }

  if (
    Array.isArray(
      data?.data,
    )
  ) {
    return data.data;
  }

  return [];
};

/* ============================================================
   VEHICLE TABLE CELL
============================================================ */

function renderOwnerVehicleCell(
  vehicle,
  column,
) {
  if (
    column.key === "plateNumber" ||
    column.key === "plateNumbers" ||
    column.key === "plate"
  ) {
    return (
      <span
        dir="rtl"
        className="whitespace-nowrap font-mono text-sm font-bold tracking-wide text-gray-800"
      >
        {getVehiclePlate(vehicle)}
      </span>
    );
  }

  if (
    column.key === "brand" ||
    column.key === "vehicleBrand"
  ) {
    return (
      <span className="font-semibold text-gray-800">
        {getVehicleBrand(vehicle)}
      </span>
    );
  }

  if (column.key === "color") {
    return (
      <span className="text-gray-600">
        {getVehicleColor(vehicle)}
      </span>
    );
  }

  if (column.key === "model") {
    return (
      <span className="text-gray-600">
        {getVehicleModel(vehicle)}
      </span>
    );
  }

  if (column.key === "status") {
    const status =
      vehicle.status || "approved";

    const style =
      STATUS_STYLES[status] ||
      STATUS_STYLES.pending;

    const label =
      STATUS_LABELS[status] ||
      status;

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}
      >
        {label}
      </span>
    );
  }

  const value =
    vehicle?.[column.key];

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return (
      <span className="text-gray-400">
        -
      </span>
    );
  }

  return (
    <span className="text-gray-600">
      {value ?? "-"}
    </span>
  );
}

/* ============================================================
   ACCESS LOG TABLE CELL
============================================================ */

function renderOwnerLogCell(
  log,
  column,
) {
  if (column.key === "action") {
    const action =
      String(
        log.action ?? "",
      ).toUpperCase();

    const isEntry =
      action === "ENTRY";

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isEntry
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {action || "-"}
      </span>
    );
  }

  if (
    column.key === "vehicle" ||
    column.key === "plateNumber" ||
    column.key === "plateNumbers"
  ) {
    return (
      <span
        dir="rtl"
        className="whitespace-nowrap font-mono font-bold text-gray-800"
      >
        {getLogPlate(log)}
      </span>
    );
  }

  if (
    column.key === "gateNum" ||
    column.key === "gateNumber" ||
    column.key === "gate" ||
    column.key === "gateName"
  ) {
    return (
      <span className="whitespace-nowrap font-mono font-bold text-blue-600">
        {getGateCode(log)}
      </span>
    );
  }

  if (column.key === "brand") {
    return (
      <span className="font-semibold text-gray-800">
        {log.brand ?? "-"}
      </span>
    );
  }

  if (column.key === "color") {
    return (
      <span className="text-gray-600">
        {log.color ?? "-"}
      </span>
    );
  }

  if (column.key === "model") {
    return (
      <span className="text-gray-600">
        {log.model ?? "-"}
      </span>
    );
  }

  if (column.key === "date") {
    return (
      <span className="whitespace-nowrap text-gray-700">
        {log.date ?? "-"}
      </span>
    );
  }

  if (column.key === "time") {
    return (
      <span className="whitespace-nowrap font-mono text-gray-700">
        {log.time ?? "-"}
      </span>
    );
  }

  if (column.key === "reason") {
    return (
      <span className="text-gray-600">
        {log.reason ?? "-"}
      </span>
    );
  }

  if (column.key === "confidence") {
    if (
      log.confidence === null ||
      log.confidence === undefined
    ) {
      return (
        <span className="text-gray-400">
          -
        </span>
      );
    }

    return (
      <span className="font-semibold text-gray-700">
        {(
          Number(log.confidence) * 100
        ).toFixed(0)}
        %
      </span>
    );
  }

  if (column.key === "timestamp") {
    return (
      <span className="whitespace-nowrap text-gray-600">
        {log.timestamp
          ? new Date(
              log.timestamp,
            ).toLocaleString()
          : "-"}
      </span>
    );
  }

  const value =
    log?.[column.key];

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return (
      <span className="text-gray-400">
        -
      </span>
    );
  }

  return (
    <span className="text-gray-600">
      {value ?? "-"}
    </span>
  );
}

/* ============================================================
   OWNER DASHBOARD
============================================================ */

export default function OwnerDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();

  /* ==========================================================
     CURRENT USER
  ========================================================== */

  const {
    user,
    rawUser,
    loading: isLoadingUser,
    refetch: refetchUser,
  } = useCurrentUser();

  /* ==========================================================
     REDUX STATE
  ========================================================== */

  const {
    vehicles,
    isLoadingVehicles,
    vehiclesError,
    logsData,
    isLoadingLogs,
    logsError,
    isProfileOpen,
    showAllVehicles,
    isContactModalOpen,
  } = useSelector(
    (state) => state.ownerDashboard,
  );

  /* ==========================================================
     REDUX HELPERS
  ========================================================== */

  const updateVehicles = (value) => {
    const nextValue =
      typeof value === "function"
        ? value(vehicles)
        : value;

    dispatch(setVehicles(nextValue));
  };

  const updateVehiclesLoading = (
    value,
  ) => {
    dispatch(
      setVehiclesLoading(value),
    );
  };

  const updateVehiclesError = (
    value,
  ) => {
    dispatch(
      setVehiclesError(value),
    );
  };

  const updateLogsData = (value) => {
    dispatch(setLogsData(value));
  };

  const updateLogsLoading = (
    value,
  ) => {
    dispatch(
      setLogsLoading(value),
    );
  };

  const updateLogsError = (
    value,
  ) => {
    dispatch(
      setLogsError(value),
    );
  };

  const updateProfileOpen = (
    value,
  ) => {
    const nextValue =
      typeof value === "function"
        ? value(isProfileOpen)
        : value;

    dispatch(
      setProfileOpen(nextValue),
    );
  };

  const updateShowAllVehicles = (
    value,
  ) => {
    const nextValue =
      typeof value === "function"
        ? value(showAllVehicles)
        : value;

    dispatch(
      setShowAllVehicles(
        nextValue,
      ),
    );
  };

  const updateContactModalOpen = (
    value,
  ) => {
    const nextValue =
      typeof value === "function"
        ? value(isContactModalOpen)
        : value;

    dispatch(
      setContactModalOpen(
        nextValue,
      ),
    );
  };

  /* ==========================================================
     FETCH OWNER VEHICLES
  ========================================================== */

  const fetchVehicles = async () => {
    try {
      updateVehiclesLoading(true);
      updateVehiclesError("");

      const response =
        await api.get(
          "/vehicles",
          {
            headers: {
              "Cache-Control":
                "no-cache",
            },
          },
        );

      console.log(
        "Owner Vehicles API response:",
        response.data,
      );

      updateVehicles(
        extractOwnerVehicles(
          response.data,
        ),
      );
    } catch (error) {
      console.error(
        "Error fetching owner vehicles:",
        error,
      );

      updateVehiclesError(
        error.response?.data
          ?.message ||
          "Failed to load vehicles.",
      );

      updateVehicles([]);
    } finally {
      updateVehiclesLoading(false);
    }
  };

  /* ==========================================================
     VEHICLE LIMIT
  ========================================================== */

  const vehicleLimit = Number(
    rawUser?.maxVehicles ??
      rawUser?.vehicleLimit ??
      2,
  );

  const vehiclesCount =
    Array.isArray(vehicles)
      ? vehicles.length
      : 0;

  /* ==========================================================
     ADD VEHICLE
  ========================================================== */

  const handleAddVehicle = async (
    vehicleData,
  ) => {
    try {
      await api.post(
        "/vehicles",
        {
          plateLetters:
            vehicleData.plateLetters,

          plateNumbers:
            vehicleData.plateNumbers,

          brand:
            vehicleData.brand,

          color:
            vehicleData.color,

          vehicleType:
            vehicleData.vehicleType ||
            "OWNER",
        },
      );

      await fetchVehicles();
    } catch (error) {
      console.error(
        "Error adding vehicle:",
        error,
      );

      throw new Error(
        error.response?.data
          ?.message ||
          "Failed to add vehicle.",
      );
    }
  };

  /* ==========================================================
     REQUEST VEHICLE LIMIT
  ========================================================== */

  const handleRequestIncrease =
    () => {
      updateContactModalOpen(true);
    };

  /* ==========================================================
     WHATSAPP
  ========================================================== */

  const handleSendWhatsApp = () => {
    const message =
      `Hello Administration, I would like to request an increase in the vehicle limit for my unit. Owner: ${user?.name || "-"}, Unit: ${user?.unit || "-"}, Phone: ${user?.phone || "-"}, Email: ${user?.email || "-"}.`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        message,
      )}`,
      "_blank",
    );

    updateContactModalOpen(false);
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "token",
    );

    localStorage.removeItem(
      "user",
    );

    updateProfileOpen(false);

    router.push("/login");
  };

  /* ==========================================================
     FETCH VEHICLES
  ========================================================== */

  useEffect(() => {
    fetchVehicles();
  }, []);

  /* ==========================================================
     FETCH OWNER ACCESS LOGS

     IMPORTANT:
     This endpoint returns logs belonging to the
     authenticated owner only.

     GET:
     /access-logs/my?page=1&limit=20
  ========================================================== */

  useEffect(() => {
    const fetchAccessLogs =
      async () => {
        try {
          updateLogsLoading(true);
          updateLogsError("");

          const response =
            await api.get(
              "/access-logs/my",
              {
                params: {
                  page: 1,
                  limit: 20,
                },

                headers: {
                  "Cache-Control":
                    "no-cache, no-store, must-revalidate",
                  Pragma: "no-cache",
                  Expires: "0",
                },
              },
            );

          console.log(
            "Owner Access Logs API response:",
            response.data,
          );

          /*
           * IMPORTANT:
           * Do NOT filter these logs by ownerId
           * on the frontend.
           *
           * /access-logs/my already returns
           * only the authenticated owner's logs.
           */

          const apiLogs =
            extractOwnerLogs(
              response.data,
            );

          if (!apiLogs.length) {
            updateLogsData([]);
            return;
          }

          /* ==================================================
             FORMAT OWNER LOGS
          ================================================== */

          const formattedLogs =
            apiLogs.map(
              (log, index) => {
                const plate =
                  getLogPlate(log);

                const gate =
                  getGateCode(log);

                const date =
                  formatLogDate(
                    log.timestamp,
                  );

                const time =
                  formatLogTime(
                    log.timestamp,
                  );

                /* BRAND FALLBACK */

                let brand =
                  log.brand ?? "";

                if (
                  !brand &&
                  log.vehicle &&
                  typeof log.vehicle ===
                    "object"
                ) {
                  brand =
                    log.vehicle.brand ??
                    "";
                }

                /* MODEL FALLBACK */

                let model =
                  log.model ?? "";

                if (
                  !model &&
                  log.vehicle &&
                  typeof log.vehicle ===
                    "object"
                ) {
                  model =
                    log.vehicle.model ??
                    "";
                }

                /* COLOR FALLBACK */

                let color =
                  log.color ?? "";

                if (
                  !color &&
                  log.vehicle &&
                  typeof log.vehicle ===
                    "object"
                ) {
                  color =
                    log.vehicle.color ??
                    "";
                }

                return {
                  ...log,

                  id:
                    log.id ??
                    log._id ??
                    `owner-log-${index}`,

                  vehicleId:
                    log.vehicleId ??
                    log.vehicle?.id ??
                    null,

                  action:
                    log.action ??
                    "-",

                  reason:
                    log.reason ??
                    "-",

                  confidence:
                    log.confidence ??
                    null,

                  /* COMPLETE PLATE */

                  vehicle:
                    plate,

                  plateNumber:
                    plate,

                  plateNumbers:
                    plate,

                  /* VEHICLE DATA */

                  brand:
                    brand || "-",

                  model:
                    model || "-",

                  color:
                    color || "-",

                  /* GATE */

                  gate,

                  gateNum:
                    gate,

                  gateNumber:
                    gate,

                  /* DATE / TIME */

                  date,

                  time,

                  timestamp:
                    log.timestamp ??
                    null,

                  updatedAt:
                    log.updatedAt ??
                    null,

                  imagePath:
                    log.imagePath ??
                    null,
                };
              },
            );

          console.log(
            "Formatted owner access logs:",
            formattedLogs,
          );

          updateLogsData(
            formattedLogs,
          );
        } catch (error) {
          console.error(
            "Error fetching owner access logs:",
            error,
          );

          updateLogsError(
            error.response?.data
              ?.message ||
              "Failed to load access logs.",
          );

          updateLogsData([]);
        } finally {
          updateLogsLoading(false);
        }
      };

    fetchAccessLogs();
  }, []);

  /* ==========================================================
     RETURN
  ========================================================== */

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-200">
      {/* ====================================================
          SHARED HEADER
      ===================================================== */}

      <DashboardHeader
        user={user}
        isLoadingUser={isLoadingUser}
        fallbackName="Owner"
        subtitle={
          <>
            Unit Number:{" "}
            <span className="font-semibold text-white">
              {isLoadingUser
                ? "..."
                : user?.unit || "-"}
            </span>
          </>
        }
        onProfileClick={() =>
          updateProfileOpen(true)
        }
        ariaLabel="Open user profile"
      />

      {/* ====================================================
          PROFILE PANEL
      ===================================================== */}

      {isProfileOpen && (
        <Profile
          dashboardType="owner"
          vehicles={vehicles}
          showAllVehicles={
            showAllVehicles
          }
          setShowAllVehicles={
            setShowAllVehicles
          }
          onClose={() =>
            updateProfileOpen(false)
          }
          onLogout={handleLogout}
          currentUser={user}
          currentUserRaw={rawUser}
          currentUserLoading={
            isLoadingUser
          }
          onUserUpdated={
            refetchUser
          }
        />
      )}

      {/* ====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* ==================================================
            VEHICLES TABLE
        =================================================== */}

        <div className="mb-8 rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                <Car className="text-blue-600" />
                Registered Vehicles
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {vehiclesCount} of{" "}
                {vehicleLimit}{" "}
                vehicles
                registered
              </p>
            </div>
          </div>

          {vehiclesError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {vehiclesError}
            </div>
          )}

          {isLoadingVehicles ? (
            <div className="rounded-2xl bg-gray-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-gray-500">
                Loading vehicles...
              </p>
            </div>
          ) : (
            <ReusableDataTable
  tableId="owner-vehicles"
  data={vehicles}
  columns={OWNER_VEHICLE_COLUMNS}
  renderCell={renderOwnerVehicleCell}
  rowKey="id"
  emptyMessage="No vehicles registered yet."
  minWidth="min-w-[700px]"
  showSearch={false}
  showSort={false}
  showColumnVisibility={false}
  showResultCount={false}
  showExpandButton={false}
  maxVisibleRows={vehicles.length}
/>
          )}

          {/* ADD VEHICLE */}

          <AddVehicleForm
            vehicles={vehicles}
            vehicleLimit={
              vehicleLimit
            }
            onAddVehicle={
              handleAddVehicle
            }
            onRequestIncrease={
              handleRequestIncrease
            }
          />

          {/* VIEW ALL */}

          {/* {vehiclesCount > 3 && (
            <button
              type="button"
              onClick={() =>
                updateShowAllVehicles(
                  !showAllVehicles,
                )
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              {showAllVehicles ? (
                <>
                  Show Less
                  <ChevronUp
                    size={18}
                  />
                </>
              ) : (
                <>
                  View All{" "}
                  {vehiclesCount}{" "}
                  Vehicles
                  <ChevronDown
                    size={18}
                  />
                </>
              )}
            </button>
          )} */}
        </div>

        {/* ==================================================
            ACCESS LOGS
        =================================================== */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              <History className="text-orange-500" />
              Logs
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Recent vehicle entry and
              exit activity
            </p>
          </div>

          {logsError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {logsError}
            </div>
          )}

          {isLoadingLogs ? (
            <div className="rounded-2xl bg-gray-50 px-4 py-10 text-center">
              <p className="text-sm font-medium text-gray-500">
                Loading access logs...
              </p>
            </div>
          ) : (
            <ReusableDataTable
              tableId="owner-access-logs"
              data={logsData}
              columns={
                OWNER_LOG_COLUMNS
              }
              renderCell={
                renderOwnerLogCell
              }
              rowKey="id"
              searchPlaceholder="Search vehicle, action, gate, brand, color, date or time..."
              emptyMessage="No logs available."
              minWidth="min-w-[900px]"
              showSearch
              showSort
              showColumnVisibility
              showResultCount
              resultCountLabel="log"
              showExpandButton
            />
          )}
        </div>
      </div>

      {/* ====================================================
          CONTACT MODAL
      ===================================================== */}

      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() =>
              updateContactModalOpen(
                false,
              )
            }
            className="absolute inset-0 h-full w-full bg-black/50 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Request Vehicle Increase
              </h3>

              <button
                type="button"
                onClick={() =>
                  updateContactModalOpen(
                    false,
                  )
                }
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Owner
                </p>

                <p className="font-semibold text-gray-800">
                  {user?.name || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Unit Number
                </p>

                <p className="font-semibold text-gray-800">
                  {user?.unit || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-sm text-blue-600">
                  Request
                </p>

                <p className="mt-1 text-sm text-blue-800">
                  I would like to
                  request an increase
                  in the vehicle limit
                  for my unit.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  updateContactModalOpen(
                    false,
                  )
                }
                className="flex-1 rounded-xl bg-gray-200 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSendWhatsApp
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                <Phone size={18} />
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}