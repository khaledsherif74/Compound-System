"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck } from "lucide-react";

import ReusableDataTable from "@/components/tables/ReusableDataTable";
import DashboardHeader from "@/components/DashboardHeader";

import {
GATE_LOG_COLUMNS,
renderGateLogCell,
} from "@/components/tables/gateLogTableConfig";

import Profile from "@/components/Profile";
import api from "@/Services/api";
import useCurrentUser from "@/hooks/useCurrentUser";

import {
setAccessLogs,
setLoadingLogs,
setLogsError,
setProfileOpen,
} from "@/store/slices/supervisorDashboardSlice";

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

if (plateLetters && formattedNumbers) {
  return `${plateLetters} ${formattedNumbers}`;
}

if (plateLetters) {
  return plateLetters;
}

if (formattedNumbers) {
  return formattedNumbers;
}


}

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

if (plateLetters && formattedNumbers) {
return `${plateLetters} ${formattedNumbers}`;
}

if (plateLetters) {
return plateLetters;
}

if (formattedNumbers) {
return formattedNumbers;
}

if (log.plateNumber) {
return convertToHindiNumbers(log.plateNumber);
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

if (
log.gateName !== null &&
log.gateName !== undefined &&
String(log.gateName).trim() !== ""
) {
return String(log.gateName).trim();
}

if (
log.gate &&
typeof log.gate === "object"
) {
if (
log.gate.gateName !== null &&
log.gate.gateName !== undefined &&
String(log.gate.gateName).trim() !== ""
) {
return String(log.gate.gateName).trim();
}


if (
  log.gate.name !== null &&
  log.gate.name !== undefined &&
  String(log.gate.name).trim() !== ""
) {
  return String(log.gate.name).trim();
}

if (
  log.gate.code !== null &&
  log.gate.code !== undefined &&
  String(log.gate.code).trim() !== ""
) {
  return String(log.gate.code).trim();
}


}

if (
typeof log.gate === "string" &&
log.gate.trim() !== ""
) {
return log.gate.trim();
}

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

return date.toLocaleDateString("en-GB", {
day: "2-digit",
month: "2-digit",
year: "numeric",
});
};

/* =========================================================
TIME - 12 HOUR
========================================================= */

const formatTime = (timestamp) => {
if (!timestamp) {
return "-";
}

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
String(log.vehicle.brand).trim() !== ""
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
String(log.vehicle.color).trim() !== ""
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

if (
typeof log.owner === "string" &&
log.owner.trim() !== ""
) {
return log.owner.trim();
}

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

if (
log.vehicle &&
typeof log.vehicle === "object"
) {
if (
typeof log.vehicle.owner === "string" &&
log.vehicle.owner.trim()
) {
return log.vehicle.owner.trim();
}


if (
  log.vehicle.owner &&
  typeof log.vehicle.owner === "object" &&
  !Array.isArray(log.vehicle.owner)
) {
  const vehicleOwner =
    log.vehicle.owner;

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

if (
typeof log.employeeName === "string" &&
log.employeeName.trim()
) {
return log.employeeName.trim();
}

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

if (
log.vehicle &&
typeof log.vehicle === "object"
) {
const owner = log.vehicle.owner;


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

switch (String(action).toUpperCase()) {
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

const formatAccessLog = (log, index) => {
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

const normalizeGateValue = (value) => {
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
CHECK WHETHER LOG BELONGS TO SELECTED GATE
========================================================= */

const logMatchesGate = (
log,
selectedGate,
) => {
/*

* No selected gate means:
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

* Match by gate ID, gate name,
* or displayed gate value.
  */
  return (
  selected === gateId ||
  selected === gateName ||
  selected === gate
  );
  };

/* =========================================================
SUPERVISOR DASHBOARD
========================================================= */

export default function SupervisorDashboard() {
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

/* =======================================================
REDUX STATE
======================================================= */

const {
accessLogs,
isLoadingLogs,
logsError,
isProfileOpen,
} = useSelector(
(state) =>
state.supervisorDashboard,
);

/* =======================================================
FETCH ACCESS LOGS
======================================================= */

useEffect(() => {
let mounted = true;


const fetchAccessLogs =
  async () => {
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
          {
            headers: {
              "Cache-Control":
                "no-cache, no-store, must-revalidate",

              Pragma:
                "no-cache",

              Expires:
                "0",
            },
          },
        );

      console.log(
        "Access Logs API response:",
        response.data,
      );

      const logs =
        response.data?.data?.logs;

      if (!Array.isArray(logs)) {
        console.error(
          "Invalid logs response:",
          response.data,
        );

        if (mounted) {
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
        "Formatted access logs:",
        formattedLogs,
      );

      if (mounted) {
        dispatch(
          setAccessLogs(
            formattedLogs,
          ),
        );
      }
    } catch (error) {
      console.error(
        "Error fetching access logs:",
        error,
      );

      if (mounted) {
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
      if (mounted) {
        dispatch(
          setLoadingLogs(false),
        );
      }
    }
  };

fetchAccessLogs();

return () => {
  mounted = false;
};


}, [dispatch]);

/* =======================================================
LOGOUT
======================================================= */

const handleLogout = () => {
dispatch(
setProfileOpen(false),
);


router.push("/login");


};

/* =======================================================
RENDER
======================================================= */

return ( <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-200">

  {/* =====================================================
      SHARED HEADER
  ===================================================== */}

  <DashboardHeader
    user={user}
    isLoadingUser={
      isLoadingUser
    }
    fallbackName="Supervisor"
    subtitle="Supervisor Dashboard"
    onProfileClick={() =>
      dispatch(
        setProfileOpen(true),
      )
    }
    ariaLabel="Open supervisor profile"
  />

  {/* =====================================================
      PROFILE PANEL
  ===================================================== */}

  {isProfileOpen && (
    <Profile
      dashboardType="supervisor"

      onClose={() =>
        dispatch(
          setProfileOpen(false),
        )
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

  {/* =====================================================
      MAIN CONTENT
  ===================================================== */}

  <div className="mx-auto max-w-7xl px-4 py-8">

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
          data={accessLogs}

          columns={
            GATE_LOG_COLUMNS
          }

          renderCell={
            renderGateLogCell
          }

          initialSortField="timestamp"

          initialSortDirection="asc"

          searchPlaceholder="Search date, time, plate, brand, color, owner, unit, gate or direction..."

          /*
           * This message will be displayed when the
           * selected gate has no matching records,
           * assuming ReusableDataTable uses its
           * emptyMessage for filtered results.
           */
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
             GATE FILTER
          ================================================= */

          showGateFilter

          gateFilterId="supervisor-gate-select"

          gateFilterLabel="Gate Selection"

          gateFilterAllLabel="All Gates"

          /* =================================================
             ACTUAL GATE FILTER
             
             IMPORTANT:
             The second argument must be the currently
             selected gate value from ReusableDataTable.
          ================================================= */

          externalFilter={(
            log,
            selectedGate,
          ) =>
            logMatchesGate(
              log,
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
