"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/Services/api";
import useReduxUIState from "@/hooks/useReduxUIState";
import useReduxCollection from "@/hooks/useReduxCollection";

import {
  Plus,
  Trash2,
  Check,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Settings2,
  Pencil,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

import { BackWard } from "@/utilites/backFunc";

/* =========================================================
   NORMALIZE DIRECTION
========================================================= */

const normalizeDirection = (gate) => {
  if (!gate) {
    return [];
  }

  /*
   * Preferred API format:
   *
   * direction: ["In", "Out"]
   */

  if (Array.isArray(gate.direction)) {
    return gate.direction
      .map((item) => String(item).trim())
      .filter(Boolean)
      .map((item) => {
        const lower = item.toLowerCase();

        if (lower === "in") {
          return "In";
        }

        if (lower === "out") {
          return "Out";
        }

        return item;
      });
  }

  /*
   * Handle possible string responses:
   *
   * direction: "In"
   * direction: "Out"
   */

  if (
    typeof gate.direction === "string" &&
    gate.direction.trim()
  ) {
    const value = gate.direction.trim();
    const lower = value.toLowerCase();

    if (lower === "in") {
      return ["In"];
    }

    if (lower === "out") {
      return ["Out"];
    }

    return [value];
  }

  /*
   * Fallback for older API shapes.
   */

  const directions = [];

  if (
    gate?.in === true ||
    gate?.isIn === true ||
    gate?.gateIn === true
  ) {
    directions.push("In");
  }

  if (
    gate?.out === true ||
    gate?.isOut === true ||
    gate?.gateOut === true
  ) {
    directions.push("Out");
  }

  return directions;
};

/* =========================================================
   NORMALIZE GATE
========================================================= */

const normalizeGate = (gate) => {
  if (!gate) {
    return null;
  }

  const rawCode =
    gate?.gateCode ??
    gate?.code ??
    gate?.gateNumber ??
    gate?.gate_number ??
    gate?.number ??
    "";

  const direction = normalizeDirection(gate);

  const rawActive =
    gate?.isActive ??
    gate?.active ??
    gate?.status;

  const isActive =
    typeof rawActive === "string"
      ? !["disabled", "inactive", "false", "0"].includes(
        rawActive.toLowerCase(),
      )
      : Boolean(rawActive ?? true);

  return {
    ...gate,

    id:
      gate?.id ??
      gate?._id ??
      gate?.gateId ??
      gate?.gateID,

    name:
      gate?.gateName ??
      gate?.name ??
      "",

    number:
      rawCode === null ||
        rawCode === undefined
        ? ""
        : rawCode,

    gateCode:
      rawCode === null ||
        rawCode === undefined
        ? ""
        : rawCode,

    direction,

    in: direction.some(
      (item) => item.toLowerCase() === "in",
    ),

    out: direction.some(
      (item) => item.toLowerCase() === "out",
    ),

    active: isActive,

    isActive,
  };
};

/* =========================================================
   EXTRACT GATES
========================================================= */

const extractGates = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  /*
   * Common:
   *
   * {
   *   data: [...]
   * }
   */

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  /*
   * Common paginated response:
   *
   * {
   *   data: {
   *     gates: [...]
   *   }
   * }
   */

  if (Array.isArray(data?.data?.gates)) {
    return data.data.gates;
  }

  if (Array.isArray(data?.data?.items)) {
    return data.data.items;
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results;
  }

  if (Array.isArray(data?.gates)) {
    return data.gates;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

/* =========================================================
   API ERROR
========================================================= */

const getApiError = (
  error,
  fallback = "Something went wrong.",
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.response?.data?.errors?.[0] ||
    error?.message ||
    fallback
  );
};

/* =========================================================
   GATE IDENTIFIER
========================================================= */

const getGateIdentifier = (gate) =>
  gate?.id ??
  gate?._id ??
  gate?.gateId ??
  gate?.gateID ??
  "";

/* =========================================================
   DIRECTIONS
========================================================= */

const getDirectionArray = (gateIn, gateOut) => {
  const direction = [];

  if (gateIn) {
    direction.push("In");
  }

  if (gateOut) {
    direction.push("Out");
  }

  return direction;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function GateManagement() {
  /* =========================================================
     ADD GATE FORM
  ========================================================= */

  const [gateName, setGateName] = useReduxUIState(
    "gateManagement.gateName",
    "",
  );

  const [gateNumber, setGateNumber] = useReduxUIState(
    "gateManagement.gateNumber",
    "",
  );

  const [gateIn, setGateIn] = useReduxUIState(
    "gateManagement.gateIn",
    false,
  );

  const [gateOut, setGateOut] = useReduxUIState(
    "gateManagement.gateOut",
    false,
  );

  const [isLoadingGates, setIsLoadingGates] =
    useState(false);

  const [isSubmittingGate, setIsSubmittingGate] =
    useState(false);

  const [isSavingEdit, setIsSavingEdit] =
    useState(false);

  const [isChangingStatus, setIsChangingStatus] =
    useState(false);

  const [isDeletingGate, setIsDeletingGate] =
    useState(false);

  const [gatesError, setGatesError] =
    useState("");

  /* =========================================================
     REDUX GATES
  ========================================================= */

  const {
    items: gates,
    setItems: setGates,
  } = useReduxCollection("gates", []);

  /* =========================================================
     FETCH GATES
  ========================================================= */

  const fetchGates = async () => {
    setIsLoadingGates(true);
    setGatesError("");

    try {
      /*
       * API:
       *
       * GET /gates?page=1&limit=20
       */

      const response = await api.get(
        "/gates?page=1&limit=20",
      );

      const gateList = extractGates(response.data)
        .map(normalizeGate)
        .filter(Boolean);

      setGates(gateList);
    } catch (error) {
      setGatesError(
        getApiError(
          error,
          "Failed to load gates.",
        ),
      );
    } finally {
      setIsLoadingGates(false);
    }
  };

  useEffect(() => {
    fetchGates();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const [search, setSearch] = useReduxUIState(
    "gateManagement.search",
    "",
  );

  /* =========================================================
     SORT
  ========================================================= */

  const [sortConfig, setSortConfig] =
    useReduxUIState(
      "gateManagement.sortConfig",
      {
        key: null,
        direction: "asc",
      },
    );

  /* =========================================================
     COLUMN VISIBILITY
  ========================================================= */

  const [visibleColumns, setVisibleColumns] =
    useReduxUIState(
      "gateManagement.visibleColumns",
      {
        number: true,
        name: true,
        gateNumber: true,
        in: true,
        out: true,
        status: true,
        actions: true,
      },
    );

  const [showColumnMenu, setShowColumnMenu] =
    useReduxUIState(
      "gateManagement.showColumnMenu",
      false,
    );

  /* =========================================================
     MODALS
  ========================================================= */

  const [modal, setModal] = useReduxUIState(
    "gateManagement.modal",
    null,
  );

  const [selectedGate, setSelectedGate] =
    useReduxUIState(
      "gateManagement.selectedGate",
      null,
    );

  /* =========================================================
     EDIT FORM
  ========================================================= */

  const [editForm, setEditForm] =
    useReduxUIState(
      "gateManagement.editForm",
      {
        name: "",
        number: "",
        in: false,
        out: false,
      },
    );

  /* =========================================================
     ADD GATE
  ========================================================= */

  const handleAddGate = async (e) => {
    e.preventDefault();

    if (isSubmittingGate) {
      return;
    }

    setGatesError("");

    const trimmedName = gateName.trim();
    const trimmedCode = gateNumber.trim();

    if (!trimmedName) {
      setGatesError("Gate name is required.");
      return;
    }

    if (!trimmedCode) {
      setGatesError("Gate Number is required.");
      return;
    }

    /*
     * The API accepts:
     *
     * direction: ["In", "Out"]
     *
     * Therefore both can be selected.
     */

    const direction = getDirectionArray(
      gateIn,
      gateOut,
    );

    if (direction.length === 0) {
      setGatesError(
        "Please select at least one gate direction.",
      );
      return;
    }

    setIsSubmittingGate(true);

    try {
      /*
       * POST /gates
       *
       * {
       *   "gateName": "Main Gate",
       *   "gateCode": "G1",
       *   "direction": ["In", "Out"]
       * }
       */

      const payload = {
        gateName: trimmedName,
        gateCode: trimmedCode,
        direction,
      };

      const response = await api.post(
        "/gates",
        payload,
      );

      const createdGate = normalizeGate(
        response.data?.data?.gate ??
        response.data?.gate ??
        response.data?.data ??
        response.data,
      );

      if (createdGate) {
        setGates((prev) => [
          ...prev,
          createdGate,
        ]);
      } else {
        /*
         * If the POST response does not contain
         * the created gate, reload the collection.
         */

        await fetchGates();
      }

      setGateName("");
      setGateNumber("");
      setGateIn(false);
      setGateOut(false);
    } catch (error) {
      setGatesError(
        getApiError(
          error,
          "Failed to create gate.",
        ),
      );
    } finally {
      setIsSubmittingGate(false);
    }
  };

  /* =========================================================
     SORT
  ========================================================= */

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev?.key === key &&
          prev?.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  /* =========================================================
     SORT VALUE
  ========================================================= */

  const getSortValue = (gate, key) => {
    switch (key) {
      case "name":
        return gate.name || "";

      case "gateNumber":
        return gate.number ?? "";

      case "in":
        return gate.in ? "Yes" : "No";

      case "out":
        return gate.out ? "Yes" : "No";

      case "status":
        return gate.active
          ? "Active"
          : "Disabled";

      default:
        return "";
    }
  };

  /* =========================================================
     SORT ICON
  ========================================================= */

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) {
      return (
        <ChevronsUpDown
          size={16}
          className="text-slate-400"
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

  /* =========================================================
     SEARCH + SORT
  ========================================================= */

  const displayedGates = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = gates.filter((gate) => {
      if (!query) {
        return true;
      }

      const searchableValues = [
        gate.name,
        gate.number,
        ...(Array.isArray(gate.direction)
          ? gate.direction
          : []),
        gate.in ? "in" : "",
        gate.out ? "out" : "",
        gate.active ? "active" : "disabled",
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
        getSortValue(
          a,
          sortConfig.key,
        ),
      )
        .trim()
        .toLowerCase();

      const bValue = String(
        getSortValue(
          b,
          sortConfig.key,
        ),
      )
        .trim()
        .toLowerCase();

      const comparison =
        aValue.localeCompare(
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
  }, [
    gates,
    search,
    sortConfig,
  ]);

  /* =========================================================
     COLUMN VISIBILITY
  ========================================================= */

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const columnDefinitions = [
    {
      key: "name",
      label: "Gate Name",
    },
    {
      key: "gateNumber",
      label: "Gate Number",
    },
    {
      key: "in",
      label: "In",
    },
    {
      key: "out",
      label: "Out",
    },
    {
      key: "status",
      label: "Status",
    },
  ];

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const openEditModal = (gate) => {
    const direction = Array.isArray(
      gate.direction,
    )
      ? gate.direction
      : [];

    setSelectedGate(gate);

    setEditForm({
      name: gate.name || "",
      number: String(
        gate.number ?? "",
      ),
      in: direction.includes("In"),
      out: direction.includes("Out"),
    });

    setModal("edit");
  };

  /* =========================================================
     SAVE EDIT
  ========================================================= */

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (isSavingEdit) {
      return;
    }

    setGatesError("");

    const gateIdentifier =
      getGateIdentifier(selectedGate);

    if (!gateIdentifier) {
      setGatesError(
        "Unable to identify the selected gate.",
      );
      return;
    }

    const trimmedName =
      editForm.name.trim();

    const trimmedCode =
      editForm.number.trim();

    if (!trimmedName) {
      setGatesError(
        "Gate name is required.",
      );
      return;
    }

    if (!trimmedCode) {
      setGatesError(
        "Gate Number is required.",
      );
      return;
    }

    const direction =
      getDirectionArray(
        editForm.in,
        editForm.out,
      );

    if (direction.length === 0) {
      setGatesError(
        "Please select at least one gate direction.",
      );
      return;
    }

    setIsSavingEdit(true);

    try {
      /*
       * PATCH /gates/:gateId
       *
       * {
       *   "gateName": "Main Gate Renamed",
       *   "gateCode": "G1",
       *   "direction": ["Out"],
       *   "isActive": true
       * }
       */

      const payload = {
        gateName: trimmedName,
        gateCode: trimmedCode,
        direction,
        isActive: Boolean(
          selectedGate?.isActive ??
          selectedGate?.active ??
          true,
        ),
      };

      const response = await api.patch(
        `/gates/${encodeURIComponent(
          gateIdentifier,
        )}`,
        payload,
      );

      const updatedGate = normalizeGate(
        response.data?.data?.gate ??
        response.data?.gate ??
        response.data?.data ??
        response.data,
      );

      if (updatedGate) {
        setGates((prev) =>
          prev.map((gate) =>
            String(
              getGateIdentifier(gate),
            ) ===
              String(gateIdentifier)
              ? updatedGate
              : gate,
          ),
        );
      } else {
        /*
         * Some APIs return only a success message.
         * Reload to get the actual updated record.
         */

        await fetchGates();
      }

      closeModal();
    } catch (error) {
      setGatesError(
        getApiError(
          error,
          "Failed to update gate.",
        ),
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  /* =========================================================
     OPEN STATUS MODAL
  ========================================================= */

  const openStatusModal = (gate) => {
    setSelectedGate(gate);
    setModal("status");
  };

  /* =========================================================
     CONFIRM STATUS CHANGE
  ========================================================= */

  const confirmStatusChange = async () => {
    if (isChangingStatus) {
      return;
    }

    const gateIdentifier =
      getGateIdentifier(selectedGate);

    if (!gateIdentifier) {
      setGatesError(
        "Unable to identify the selected gate.",
      );
      return;
    }

    const currentIsActive = Boolean(
      selectedGate?.isActive ??
      selectedGate?.active ??
      false,
    );

    const nextIsActive =
      !currentIsActive;

    setGatesError("");
    setIsChangingStatus(true);

    try {
      /*
       * PATCH /gates/:gateId/disable
       *
       * {
       *   "isActive": false
       * }
       *
       * The same endpoint is used for both
       * disabling and enabling.
       */

      const response = await api.patch(
        `/gates/${encodeURIComponent(
          gateIdentifier,
        )}/disable`,
        {
          isActive: nextIsActive,
        },
      );

      const updatedGate = normalizeGate(
        response.data?.data?.gate ??
        response.data?.gate ??
        response.data?.data ??
        response.data,
      );

      if (updatedGate) {
        setGates((prev) =>
          prev.map((gate) =>
            String(
              getGateIdentifier(gate),
            ) ===
              String(gateIdentifier)
              ? updatedGate
              : gate,
          ),
        );
      } else {
        /*
         * If the API doesn't return the updated
         * gate, update Redux locally.
         */

        setGates((prev) =>
          prev.map((gate) =>
            String(
              getGateIdentifier(gate),
            ) ===
              String(gateIdentifier)
              ? {
                ...gate,
                active: nextIsActive,
                isActive: nextIsActive,
              }
              : gate,
          ),
        );
      }

      closeModal();
    } catch (error) {
      setGatesError(
        getApiError(
          error,
          `Failed to ${nextIsActive
            ? "enable"
            : "disable"
          } gate.`,
        ),
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  /* =========================================================
     OPEN DELETE MODAL
  ========================================================= */

  const openDeleteModal = (gate) => {
    setSelectedGate(gate);
    setModal("delete");
  };

  /* =========================================================
     CONFIRM DELETE
  ========================================================= */

  const confirmDelete = async () => {
    if (isDeletingGate) {
      return;
    }

    const gateIdentifier =
      getGateIdentifier(selectedGate);

    if (!gateIdentifier) {
      setGatesError(
        "Unable to identify the selected gate.",
      );
      return;
    }

    setGatesError("");
    setIsDeletingGate(true);

    try {
      await api.delete(
        `/gates/${encodeURIComponent(
          gateIdentifier,
        )}`,
      );

      setGates((prev) =>
        prev.filter(
          (gate) =>
            String(
              getGateIdentifier(gate),
            ) !==
            String(gateIdentifier),
        ),
      );

      closeModal();
    } catch (error) {
      setGatesError(
        getApiError(
          error,
          "Failed to delete gate.",
        ),
      );
    } finally {
      setIsDeletingGate(false);
    }
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    setModal(null);
    setSelectedGate(null);

    setEditForm({
      name: "",
      number: "",
      in: false,
      out: false,
    });
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-indigo-100 to-purple-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* =====================================================
            BACK BUTTON
        ===================================================== */}

        <button
          onClick={BackWard}
          className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-all duration-200 hover:text-indigo-600"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-blue-100 transition-all group-hover:bg-linear-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white">
            <ArrowLeft size={17} />
          </span>

          Back to Dashboard
        </button>

        {/* =====================================================
            ADD GATE
        ===================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-900/5">

          <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600" />

          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-linear-to-br from-blue-400/15 via-indigo-400/10 to-violet-400/10 blur-2xl" />

          <div className="relative p-6 sm:p-8">

            <div className="mb-7">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                  <Plus size={21} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                    Add Gate
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a new compound gate.
                  </p>
                </div>

              </div>
            </div>

            <form onSubmit={handleAddGate}>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Gate Name */}

                <div>
                  <label
                    htmlFor="gateName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Gate Name
                  </label>

                  <input
                    id="gateName"
                    name="gateName"
                    type="text"
                    value={gateName}
                    onChange={(e) =>
                      setGateName(
                        e.target.value,
                      )
                    }
                    placeholder="Please Enter the Gate Name"
                    disabled={isSubmittingGate}
                    className="w-full rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-blue-50/40 px-4 py-3 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Gate Code */}

                <div>
                  <label
                    htmlFor="gateNumber"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Gate Number
                  </label>

                  <input
                    id="gateNumber"
                    name="gateCode"
                    type="text"
                    value={gateNumber}
                    onChange={(e) =>
                      setGateNumber(
                        e.target.value,
                      )
                    }
                    placeholder="Please Enter the Gate Number"
                    disabled={isSubmittingGate}
                    className="w-full rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-blue-50/40 px-4 py-3 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

              </div>

              {/* Directions */}

              <div className="mt-6">

                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Gate Direction
                </label>

                <div className="flex flex-wrap gap-4">

                  {/* IN */}

                  <label className="group flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-green-50 px-4 py-3 transition-all duration-200 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10">

                    <input
                      name="directionIn"
                      type="checkbox"
                      checked={gateIn}
                      onChange={(e) =>
                        setGateIn(
                          e.target.checked,
                        )
                      }
                      disabled={
                        isSubmittingGate
                      }
                      className="h-5 w-5 accent-emerald-600"
                    />

                    <span className="font-medium text-emerald-800">
                      Gate In
                    </span>

                  </label>

                  {/* OUT */}

                  <label className="group flex cursor-pointer items-center gap-2 rounded-xl border border-orange-100 bg-linear-to-br from-orange-50 to-amber-50 px-4 py-3 transition-all duration-200 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10">

                    <input
                      name="directionOut"
                      type="checkbox"
                      checked={gateOut}
                      onChange={(e) =>
                        setGateOut(
                          e.target.checked,
                        )
                      }
                      disabled={
                        isSubmittingGate
                      }
                      className="h-5 w-5 accent-orange-600"
                    />

                    <span className="font-medium text-orange-800">
                      Gate Out
                    </span>

                  </label>

                </div>

              </div>

              {/* Error */}

              {gatesError && (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-600">
                    {gatesError}
                  </p>
                </div>
              )}

              <div className="mt-7 flex justify-end">

                <button
                  type="submit"
                  disabled={
                    isSubmittingGate
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 hover:shadow-xl hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <Plus size={18} />

                  {isSubmittingGate
                    ? "Adding..."
                    : "Add Gate"}
                </button>

              </div>

            </form>
          </div>
        </section>

        {/* =====================================================
            GATE TABLE
        ===================================================== */}

        <section className="mt-8 overflow-visible rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-900/5">

          {/* Header */}

          <div className="relative overflow-visible border-b border-blue-100 bg-linear-to-r from-white via-blue-50/50 to-indigo-50/60 p-6">

            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-linear-to-br from-blue-400/10 to-violet-400/10 blur-2xl" />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="h-10 w-1 rounded-full bg-linear-to-b from-blue-600 via-indigo-600 to-violet-600" />

                  <div>

                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                      Registered Gates
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      View and manage all registered gates.
                    </p>

                  </div>

                </div>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                {/* Search */}

                <div className="relative">

                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value,
                      )
                    }
                    placeholder="Search gates..."
                    className="w-full rounded-xl border border-blue-100 bg-white px-4 py-2.5 pl-10 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-64"
                  />

                </div>

                {/* Columns */}

                <div className="relative">

                  <button
                    type="button"
                    onClick={() =>
                      setShowColumnMenu(
                        (prev) => !prev,
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 sm:w-auto"
                  >
                    <Settings2 size={17} />
                    Columns
                    <ChevronDown size={16} />
                  </button>

                  {showColumnMenu && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-blue-100 bg-white p-2 shadow-2xl shadow-blue-900/15">

                      <div className="mb-1 bg-linear-to-r from-blue-50 to-indigo-50 px-3 py-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                          Show / Hide Columns
                        </p>
                      </div>

                      {columnDefinitions.map(
                        (column) => (
                          <label
                            key={
                              column.key
                            }
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50"
                          >
                            <input
                              type="checkbox"
                              checked={
                                Boolean(
                                  visibleColumns[
                                  column.key
                                  ],
                                )
                              }
                              onChange={() =>
                                toggleColumn(
                                  column.key,
                                )
                              }
                              className="h-4 w-4 accent-blue-600"
                            />

                            <span className="text-sm font-medium text-slate-700">
                              {
                                column.label
                              }
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

          {/* Loading / Error */}

          {isLoadingGates && (
            <div className="border-b border-blue-100 px-6 py-3">
              <p className="text-sm font-medium text-slate-500">
                Loading gates from the server...
              </p>
            </div>
          )}

          {!isLoadingGates &&
            gatesError && (
              <div className="border-b border-red-100 bg-red-50 px-6 py-3">
                <p className="text-sm font-medium text-red-600">
                  {gatesError}
                </p>
              </div>
            )}

          {/* Table */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-250">

              <thead className="bg-linear-to-r from-slate-50 via-blue-50 to-indigo-50">

                <tr className="border-b border-blue-100">

                  {/* # */}

                  {visibleColumns.number && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      #
                    </th>
                  )}

                  {/* Name */}

                  {visibleColumns.name && (
                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "name",
                          )
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
                      >
                        Gate Name
                        {getSortIcon(
                          "name",
                        )}
                      </button>
                    </th>
                  )}

                  {/* Code */}

                  {visibleColumns.gateNumber && (
                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "gateNumber",
                          )
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
                      >
                        Gate Number
                        {getSortIcon(
                          "gateNumber",
                        )}
                      </button>
                    </th>
                  )}

                  {/* In */}

                  {visibleColumns.in && (
                    <th className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort("in")
                        }
                        className="mx-auto flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
                      >
                        In
                        {getSortIcon("in")}
                      </button>
                    </th>
                  )}

                  {/* Out */}

                  {visibleColumns.out && (
                    <th className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort("out")
                        }
                        className="mx-auto flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
                      >
                        Out
                        {getSortIcon("out")}
                      </button>
                    </th>
                  )}

                  {/* Status */}

                  {visibleColumns.status && (
                    <th className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "status",
                          )
                        }
                        className="mx-auto flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
                      >
                        Status
                        {getSortIcon(
                          "status",
                        )}
                      </button>
                    </th>
                  )}

                  {/* Actions */}

                  {visibleColumns.actions && (
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                      Action
                    </th>
                  )}

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {isLoadingGates ? (
                  <tr>
                    <td
                      colSpan={
                        Math.max(
                          1,
                          Object.values(
                            visibleColumns,
                          ).filter(
                            Boolean,
                          ).length,
                        )
                      }
                      className="px-6 py-14 text-center"
                    >
                      <p className="text-sm font-semibold text-slate-600">
                        Loading gates...
                      </p>
                    </td>
                  </tr>
                ) : displayedGates.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={
                        Math.max(
                          1,
                          Object.values(
                            visibleColumns,
                          ).filter(
                            Boolean,
                          ).length,
                        )
                      }
                      className="px-6 py-14 text-center"
                    >
                      <div className="flex flex-col items-center">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-50 to-indigo-100 text-blue-500">
                          <Search size={20} />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                          {gatesError
                            ? "Unable to load gates"
                            : search
                              ? "No gates found"
                              : "No gates added yet"}
                        </p>

                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedGates.map(
                    (gate, index) => (
                      <tr
                        key={
                          getGateIdentifier(
                            gate,
                          ) ||
                          `${gate.number}-${index}`
                        }
                        className="transition-all duration-200 hover:bg-linear-to-r hover:from-blue-50/40 hover:via-indigo-50/30 hover:to-violet-50/30"
                      >

                        {/* # */}

                        {visibleColumns.number && (
                          <td className="px-6 py-5 font-semibold text-slate-400">
                            {index + 1}
                          </td>
                        )}

                        {/* Name */}

                        {visibleColumns.name && (
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">

                              <div className="h-2 w-2 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 shadow-sm shadow-blue-500/40" />

                              <span className="font-semibold text-slate-800">
                                {
                                  gate.name
                                }
                              </span>

                            </div>
                          </td>
                        )}

                        {/* Code */}

                        {visibleColumns.gateNumber && (
                          <td className="px-6 py-5 font-medium text-slate-600">
                            {
                              gate.number
                            }
                          </td>
                        )}

                        {/* In */}

                        {visibleColumns.in && (
                          <td className="px-6 py-5 text-center">
                            {gate.in ? (
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-green-600 text-white shadow-sm shadow-emerald-500/20">
                                <Check size={17} />
                              </span>
                            ) : (
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-slate-100 to-slate-200 text-slate-400">
                                <X size={17} />
                              </span>
                            )}
                          </td>
                        )}

                        {/* Out */}

                        {visibleColumns.out && (
                          <td className="px-6 py-5 text-center">
                            {gate.out ? (
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-amber-500 text-white shadow-sm shadow-orange-500/20">
                                <Check size={17} />
                              </span>
                            ) : (
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-slate-100 to-slate-200 text-slate-400">
                                <X size={17} />
                              </span>
                            )}
                          </td>
                        )}

                        {/* Status */}

                        {visibleColumns.status && (
                          <td className="px-6 py-5 text-center">

                            <button
                              type="button"
                              onClick={() =>
                                openStatusModal(
                                  gate,
                                )
                              }
                              title={
                                gate.isActive
                                  ? "Click to disable gate"
                                  : "Click to enable gate"
                              }
                              className={`inline-flex cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 ${gate.isActive
                                ? "bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/25"
                                : "bg-linear-to-r from-slate-400 to-slate-500 text-white shadow-sm"
                                }`}
                            >
                              {gate.isActive
                                ? "Active"
                                : "Disabled"}
                            </button>

                          </td>
                        )}

                        {/* Actions */}

                        {visibleColumns.actions && (
                          <td className="px-6 py-5">

                            <div className="flex items-center justify-center gap-2">

                              {/* Edit */}

                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    gate,
                                  )
                                }
                                title="Edit Gate"
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-50 to-indigo-100 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:shadow-md hover:shadow-blue-500/20"
                              >
                                <Pencil size={17} />
                              </button>

                              {/* Delete */}

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteModal(
                                    gate,
                                  )
                                }
                                title="Delete Gate"
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-red-50 to-rose-100 text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:from-red-500 hover:to-rose-600 hover:text-white hover:shadow-md hover:shadow-red-500/20"
                              >
                                <Trash2 size={17} />
                              </button>

                            </div>

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

        {/* =====================================================
            EDIT MODAL
        ===================================================== */}

        {modal === "edit" &&
          selectedGate && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-linear-to-br from-slate-950/60 via-blue-950/40 to-indigo-950/50 p-4 backdrop-blur-sm">

              <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-950/20">

                <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600" />

                <div className="p-6 sm:p-8">

                  <div className="mb-6 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                        <Pencil size={18} />
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                          Edit Gate
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Update gate information.
                        </p>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={
                        closeModal
                      }
                      disabled={
                        isSavingEdit
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-slate-50 to-blue-50 text-slate-500 transition hover:from-blue-100 hover:to-indigo-100 hover:text-blue-600"
                    >
                      <X size={19} />
                    </button>

                  </div>

                  <form
                    onSubmit={
                      handleSaveEdit
                    }
                  >

                    <div className="space-y-5">

                      {/* Name */}

                      <div>
                        <label
                          htmlFor="editGateName"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Gate Name
                        </label>

                        <input
                          id="editGateName"
                          type="text"
                          value={
                            editForm.name
                          }
                          onChange={(e) =>
                            setEditForm(
                              (prev) => ({
                                ...prev,
                                name: e
                                  .target
                                  .value,
                              }),
                            )
                          }
                          disabled={
                            isSavingEdit
                          }
                          className="w-full rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-blue-50/40 px-4 py-3 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                        />
                      </div>

                      {/* Code */}

                      <div>
                        <label
                          htmlFor="editGateCode"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Gate Number
                        </label>

                        <input
                          id="editGateCode"
                          type="text"
                          value={
                            editForm.number
                          }
                          onChange={(e) =>
                            setEditForm(
                              (prev) => ({
                                ...prev,
                                number:
                                  e
                                    .target
                                    .value,
                              }),
                            )
                          }
                          disabled={
                            isSavingEdit
                          }
                          className="w-full rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-blue-50/40 px-4 py-3 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                        />
                      </div>

                      {/* Direction */}

                      <div>
                        <label className="mb-3 block text-sm font-semibold text-slate-700">
                          Gate Direction
                        </label>

                        <div className="flex flex-wrap gap-4">

                          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={
                                editForm.in
                              }
                              onChange={(
                                e,
                              ) =>
                                setEditForm(
                                  (
                                    prev,
                                  ) => ({
                                    ...prev,
                                    in: e
                                      .target
                                      .checked,
                                  }),
                                )
                              }
                              disabled={
                                isSavingEdit
                              }
                              className="h-5 w-5 accent-emerald-600"
                            />

                            <span className="font-medium text-emerald-800">
                              Gate In
                            </span>
                          </label>

                          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={
                                editForm.out
                              }
                              onChange={(
                                e,
                              ) =>
                                setEditForm(
                                  (
                                    prev,
                                  ) => ({
                                    ...prev,
                                    out: e
                                      .target
                                      .checked,
                                  }),
                                )
                              }
                              disabled={
                                isSavingEdit
                              }
                              className="h-5 w-5 accent-orange-600"
                            />

                            <span className="font-medium text-orange-800">
                              Gate Out
                            </span>
                          </label>

                        </div>
                      </div>

                      {/* Error */}

                      {gatesError && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                          <p className="text-sm font-medium text-red-600">
                            {
                              gatesError
                            }
                          </p>
                        </div>
                      )}

                    </div>

                    <div className="mt-7 flex justify-end gap-3">

                      <button
                        type="button"
                        onClick={
                          closeModal
                        }
                        disabled={
                          isSavingEdit
                        }
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-linear-to-r hover:from-slate-50 hover:to-blue-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={
                          isSavingEdit
                        }
                        className="rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        {isSavingEdit
                          ? "Saving..."
                          : "Save Changes"}
                      </button>

                    </div>

                  </form>
                </div>
              </div>
            </div>
          )}

        {/* =====================================================
            STATUS MODAL
        ===================================================== */}

        {modal === "status" &&
          selectedGate && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-linear-to-br from-slate-950/60 via-blue-950/40 to-indigo-950/50 p-4 backdrop-blur-sm">

              <div className="w-full max-w-md overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-950/20">

                <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600" />

                <div className="p-6 sm:p-8">

                  <div className="flex flex-col items-center text-center">

                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg ${selectedGate.isActive
                        ? "bg-linear-to-br from-orange-400 to-amber-600 shadow-orange-500/20"
                        : "bg-linear-to-br from-emerald-400 to-green-600 shadow-emerald-500/20"
                        }`}
                    >
                      <AlertTriangle
                        size={27}
                      />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-800">
                      {selectedGate.isActive
                        ? "Disable Gate?"
                        : "Enable Gate?"}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Are you sure you
                      want to{" "}
                      {selectedGate.isActive
                        ? "disable"
                        : "enable"}{" "}
                      <strong className="text-slate-700">
                        {
                          selectedGate.name
                        }
                      </strong>
                      ?
                    </p>

                    <div className="mt-7 flex w-full gap-3">

                      <button
                        type="button"
                        onClick={
                          closeModal
                        }
                        disabled={
                          isChangingStatus
                        }
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-linear-to-r hover:from-slate-50 hover:to-blue-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          confirmStatusChange
                        }
                        disabled={
                          isChangingStatus
                        }
                        className={`flex-1 rounded-xl px-5 py-3 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${selectedGate.isActive
                          ? "bg-linear-to-r from-orange-500 to-amber-600 shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700"
                          : "bg-linear-to-r from-emerald-500 to-green-600 shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-700"
                          }`}
                      >
                        {isChangingStatus
                          ? "Updating..."
                          : "Confirm"}
                      </button>

                    </div>

                  </div>

                </div>
              </div>
            </div>
          )}

        {/* =====================================================
            DELETE MODAL
        ===================================================== */}

        {modal === "delete" &&
          selectedGate && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-linear-to-br from-slate-950/60 via-blue-950/40 to-indigo-950/50 p-4 backdrop-blur-sm">

              <div className="w-full max-w-md overflow-hidden rounded-3xl border border-red-100 bg-white shadow-2xl shadow-red-950/15">

                <div className="h-1.5 w-full bg-linear-to-r from-red-500 via-rose-500 to-red-600" />

                <div className="p-6 sm:p-8">

                  <div className="flex flex-col items-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20">
                      <AlertTriangle
                        size={27}
                      />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-800">
                      Delete Gate?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Are you sure you
                      want to delete{" "}
                      <strong className="text-slate-700">
                        {
                          selectedGate.name
                        }
                      </strong>
                      ? This action cannot
                      be undone.
                    </p>

                    {gatesError && (
                      <div className="mt-4 w-full rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                        <p className="text-sm font-medium text-red-600">
                          {
                            gatesError
                          }
                        </p>
                      </div>
                    )}

                    <div className="mt-7 flex w-full gap-3">

                      <button
                        type="button"
                        onClick={
                          closeModal
                        }
                        disabled={
                          isDeletingGate
                        }
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-linear-to-r hover:from-slate-50 hover:to-blue-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          confirmDelete
                        }
                        disabled={
                          isDeletingGate
                        }
                        className="flex-1 rounded-xl bg-linear-to-r from-red-500 via-rose-600 to-red-600 px-5 py-3 font-semibold text-white shadow-md shadow-red-500/20 transition-all hover:-translate-y-0.5 hover:from-red-600 hover:via-rose-700 hover:to-red-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        {isDeletingGate
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}