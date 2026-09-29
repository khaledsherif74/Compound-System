export const GATE_LOG_COLUMNS = [
  {
    key: "timestamp",
    label: "Time Stamp",
    searchable: true,
    sortable: true,
    cellClassName:
      "px-4 py-4 whitespace-nowrap text-gray-600",
  },

  {
    key: "plateNumber",
    label: "Plate Number",
    searchable: true,
    sortable: true,
    cellClassName:
      "px-4 py-4 font-mono font-bold text-blue-700",
  },

  {
    key: "color",
    label: "Color",
    searchable: true,
    sortable: true,
  },

  {
    key: "brand",
    label: "Brand",
    searchable: true,
    sortable: true,
  },

  {
    key: "ownerName",
    label: "Owner",
    searchable: true,
    sortable: true,
    cellClassName:
      "px-4 py-4 font-semibold text-gray-800",
  },

  {
    key: "unitNumber",
    label: "Unit Number",
    searchable: true,
    sortable: true,
    cellClassName:
      "px-4 py-4 font-semibold text-gray-600",
  },

  {
    key: "gate",
    label: "Gate",
    searchable: true,
    sortable: true,
  },

  {
    key: "direction",
    label: "Direction",
    searchable: true,
    sortable: true,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getOwnerName(log) {
  if (log?.ownerName) {
    return log.ownerName;
  }

  if (log?.owner) {
    if (typeof log.owner === "string") {
      return log.owner;
    }

    const ownerName = [
      log.owner?.firstName,
      log.owner?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return ownerName || "—";
  }

  return "—";
}

function getTimestamp(log) {
  return (
    log?.timestamp ||
    log?.createdAt ||
    log?.dateTime ||
    log?.time ||
    "—"
  );
}

function getGate(log) {
  return (
    log?.gate ||
    log?.gateName ||
    log?.gateNumber ||
    log?.gateId ||
    "—"
  );
}

function getDirection(log) {
  return (
    log?.direction ||
    log?.action ||
    "—"
  );
}

function getUnitNumber(log) {
  return (
    log?.unitNumber ||
    log?.unit ||
    log?.owner?.unitNumber ||
    log?.owner?.unit ||
    "—"
  );
}

/* =========================================================
   CELL RENDERER
========================================================= */

export function renderGateLogCell(log, column) {
  switch (column.key) {
    case "timestamp":
      return (
        <span className="whitespace-nowrap text-gray-600">
          {getTimestamp(log)}
        </span>
      );

    case "plateNumber":
      return (
        <span className="font-mono font-bold text-blue-700">
          {log?.plateNumber || "—"}
        </span>
      );

    case "ownerName":
      return (
        <span className="font-semibold text-gray-800">
          {getOwnerName(log)}
        </span>
      );

    case "unitNumber":
      return (
        <span className="font-semibold text-gray-600">
          {getUnitNumber(log)}
        </span>
      );

    case "gate": {
      const gate = getGate(log);

      return (
        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {gate}
        </span>
      );
    }

    case "direction": {
      const direction = getDirection(log);

      const normalized = String(
        direction,
      )
        .trim()
        .toUpperCase()
        .replace(/_/g, " ");

      const action = String(
        log?.action || "",
      )
        .trim()
        .toUpperCase()
        .replace(/_/g, " ");

      const isEntry =
        normalized === "ENTRY" ||
        normalized === "IN" ||
        normalized === "GATE IN";

      const isExit =
        normalized === "EXIT" ||
        normalized === "OUT" ||
        normalized === "GATE OUT";

      const isDenied =
        action === "DENIED" ||
        normalized === "DENIED" ||
        normalized === "ACCESS DENIED";

      let className =
        "bg-gray-100 text-gray-700";

      if (isEntry) {
        className =
          "bg-green-100 text-green-700";
      }

      if (isExit) {
        className =
          "bg-orange-100 text-orange-700";
      }

      if (isDenied) {
        className =
          "bg-red-100 text-red-700";
      }

      return (
        <div className="flex flex-col items-start gap-1">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${className}`}
          >
            {normalized}
          </span>

          {action && action !== normalized && (
            <span className="text-xs font-medium text-red-600">
              {action}
            </span>
          )}
        </div>
      );
    }

    case "color":
      return (
        <span className="text-gray-600">
          {log?.color || "—"}
        </span>
      );

    case "brand":
      return (
        <span className="text-gray-600">
          {log?.brand || "—"}
        </span>
      );

    default:
      return (
        <span className="text-gray-600">
          {log?.[column.key] ?? "—"}
        </span>
      );
  }
}