// components/tables/ReusableDataTable.jsx

"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Search,
  Settings2,
  X,
} from "lucide-react";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import useTableControls from "./useTableControls";
import TableFilterSelect from "@/components/tables/TableFilterSelect";
import {
  setSelectedGate,
} from "@/store/slices/supervisorDashboardSlice";
import api from "@/Services/api";

export default function ReusableDataTable({
  data = [],
  columns = [],
  renderCell,
  rowKey = "id",
  externalFilter,
  searchKeys,
  initialSortField = "",
  initialSortDirection = "asc",
  maxVisibleRows = 3,
  searchPlaceholder = "Search...",
  emptyMessage = "No records found.",
  minWidth = "min-w-[250px]",
  title,
  titleIcon: TitleIcon,
  showResultCount = true,
  resultCountLabel = "record",
  showSearch = true,
  showSort = true,
  showColumnVisibility = true,
  showExpandButton = true,

  /* =========================================================
     GATE FILTER PROPS
  ========================================================= */

  showGateFilter = false,
  gateFilterId = "table-gate-select",
  gateFilterLabel = "Gate Selection",
  gateFilterAllLabel = "All Gates",
}) {
  const dispatch = useDispatch();

  const dropdownRef = useRef(null);

  const [
    isColumnMenuOpen,
    setIsColumnMenuOpen,
  ] = useState(false);

  const [gates, setGates] = useState([]);

  /* =========================================================
     SELECTED GATE
  ========================================================= */

  const selectedGate = useSelector(
    (state) =>
      state?.supervisorDashboard?.selectedGate ?? "all",
  );

  /* =========================================================
     SAFE DATA
  ========================================================= */

  const safeData = Array.isArray(data)
    ? data
    : [];

  const safeColumns = Array.isArray(columns)
    ? columns
    : [];

  /* =========================================================
     FETCH GATES
  ========================================================= */

  useEffect(() => {
    if (!showGateFilter) {
      return;
    }

    let isMounted = true;

    const fetchGates = async () => {
      try {
        const response = await api.get(
          "/gates?page=1&limit=20",
        );

        const responseData = response?.data;

        const gatesData = Array.isArray(
          responseData,
        )
          ? responseData
          : Array.isArray(
                responseData?.data,
              )
            ? responseData.data
            : Array.isArray(
                  responseData?.gates,
                )
              ? responseData.gates
              : Array.isArray(
                    responseData?.data?.gates,
                  )
                ? responseData.data.gates
                : [];

        if (isMounted) {
          setGates(gatesData);
        }
      } catch (error) {
        console.error(
          "Failed to fetch gates:",
          error,
        );

        if (isMounted) {
          setGates([]);
        }
      }
    };

    fetchGates();

    return () => {
      isMounted = false;
    };
  }, [showGateFilter]);

  /* =========================================================
     GATE OPTIONS

     The value stored in Redux is the gateName.
  ========================================================= */

  const gateOptions = useMemo(() => {
    if (!showGateFilter) {
      return ["all"];
    }

    const gateNames = gates
      .map((gate) => gate?.gateName)
      .filter(
        (gateName) =>
          gateName !== null &&
          gateName !== undefined &&
          String(gateName).trim() !== "",
      )
      .map((gateName) =>
        String(gateName).trim(),
      );

    return [
      "all",
      ...Array.from(new Set(gateNames)),
    ];
  }, [gates, showGateFilter]);

  /* =========================================================
     RESET INVALID GATE
  ========================================================= */

  useEffect(() => {
    if (!showGateFilter) {
      return;
    }

    if (
      selectedGate !== "all" &&
      gateOptions.length > 1 &&
      !gateOptions.includes(
        String(selectedGate),
      )
    ) {
      dispatch(setSelectedGate("all"));
    }
  }, [
    selectedGate,
    gateOptions,
    dispatch,
    showGateFilter,
  ]);

  /* =========================================================
     IMPORTANT FIX:
     
     ReusableDataTable receives externalFilter from
     SupervisorDashboard as:

       (log, selectedGate) => ...

     But useTableControls calls externalFilter(row)
     with only ONE argument.

     This wrapper connects the Redux selectedGate
     to the external filter before passing it to
     useTableControls.
  ========================================================= */

  const tableExternalFilter = useMemo(() => {
    if (typeof externalFilter !== "function") {
      return undefined;
    }

    return (row) =>
      externalFilter(
        row,
        selectedGate,
      );
  }, [
    externalFilter,
    selectedGate,
  ]);

  /* =========================================================
     TABLE CONTROLS
  ========================================================= */

  const {
    search,
    setSearch,

    sortField,
    sortDirection,
    handleHeaderSort,

    filteredData,
    displayedData,

    columnVisibility,
    visibleColumns,

    toggleColumn,
    resetColumns,

    clearFilters,
    hasActiveFilters,

    hasMoreRows,

    showAllRows,
    setShowAllRows,
  } = useTableControls({
    data: safeData,
    columns: safeColumns,

    /*
     * IMPORTANT:
     * Pass the connected wrapper, NOT the original
     * externalFilter.
     */
    externalFilter: tableExternalFilter,

    searchKeys,
    initialSortField,
    initialSortDirection,
    maxVisibleRows,
  });

  /* =========================================================
     SHOW MORE / SHOW LESS
  ========================================================= */

  const handleToggleShowAllRows = () => {
    setShowAllRows(!showAllRows);
  };

  /* =========================================================
     CLOSE COLUMN MENU OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target,
        )
      ) {
        setIsColumnMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /* =========================================================
     COLUMN LABEL
  ========================================================= */

  const getColumnLabel = (column) => {
    if (!column) {
      return "";
    }

    return (
      column.label ||
      column.title ||
      column.key ||
      ""
    );
  };

  /* =========================================================
     DEFAULT CELL RENDERER
  ========================================================= */

  const defaultRenderCell = (
    row,
    column,
  ) => {
    if (!row || !column) {
      return "—";
    }

    const value = row?.[column.key];

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
      if (value?.name) {
        return value.name;
      }

      if (value?.code) {
        return value.code;
      }

      if (value?.label) {
        return value.label;
      }

      if (value?.id) {
        return value.id;
      }

      return "—";
    }

    return value;
  };

  const cellRenderer =
    renderCell || defaultRenderCell;

  /* =========================================================
     ROW KEY
  ========================================================= */

  const getRowKey = (row, index) => {
    if (!row) {
      return `row-${index}`;
    }

    const value = row?.[rowKey];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }

    return `row-${index}`;
  };

  /* =========================================================
     GATE CHANGE
  ========================================================= */

  const handleGateChange = (value) => {
    dispatch(
      setSelectedGate(
        value || "all",
      ),
    );
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const handleClearFilters = () => {
    clearFilters();

    if (
      showGateFilter &&
      selectedGate !== "all"
    ) {
      dispatch(setSelectedGate("all"));
    }
  };

  const hasActiveGateFilter =
    showGateFilter &&
    selectedGate !== "all";

  const hasAnyActiveFilter =
    hasActiveFilters ||
    hasActiveGateFilter;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="w-full">
      {/* =====================================================
          HEADER
      ===================================================== */}

      {(title ||
        showSearch ||
        showColumnVisibility ||
        (showGateFilter &&
          gateOptions.length > 1)) && (
        <div className="mb-6">
          <div className="flex flex-col gap-4">
            {/* =================================================
                TITLE
            ================================================= */}

            {title && (
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                  {TitleIcon ? (
                    <TitleIcon className="text-blue-600" />
                  ) : null}

                  {title}
                </h2>

                {showResultCount && (
                  <p className="mt-1 text-sm text-gray-500">
                    {filteredData.length}{" "}
                    matching{" "}
                    {resultCountLabel}
                    {filteredData.length !== 1
                      ? "s"
                      : ""}
                  </p>
                )}
              </div>
            )}

            {/* =================================================
                CONTROLS
            ================================================= */}

            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-end">
              {/* =================================================
                  SEARCH
              ================================================= */}

              {showSearch && (
                <div className="relative min-w-0 flex-1">
                  <label
                    htmlFor="reusable-table-search"
                    className="mb-2 block text-sm font-semibold text-gray-600"
                  >
                    Search
                  </label>

                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="reusable-table-search"
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder={
                        searchPlaceholder
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch("")
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                        aria-label="Clear search"
                      >
                        <X size={17} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* =================================================
                  GATE FILTER

                  Search
                    ↓
                  Gate Selection
                    ↓
                  Show / Hide Columns
              ================================================= */}

              {showGateFilter &&
                gateOptions.length > 1 && (
                  <div className="w-full lg:w-64 lg:shrink-0">
                    <TableFilterSelect
                      id={gateFilterId}
                      label={gateFilterLabel}
                      value={String(
                        selectedGate ??
                          "all",
                      )}
                      options={gateOptions}
                      onChange={
                        handleGateChange
                      }
                      allValue="all"
                      allLabel={
                        gateFilterAllLabel
                      }
                    />
                  </div>
                )}

              {/* =================================================
                  COLUMN VISIBILITY
              ================================================= */}

              {showColumnVisibility && (
                <div
                  className="relative w-full lg:w-auto lg:shrink-0"
                  ref={dropdownRef}
                >
                  <label className="mb-2 block text-sm font-semibold text-transparent">
                    Columns
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setIsColumnMenuOpen(
                        (previous) =>
                          !previous,
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-auto"
                    aria-label="Toggle column visibility"
                    aria-expanded={
                      isColumnMenuOpen
                    }
                  >
                    <Settings2 size={18} />

                    <span>
                      Show / Hide Columns
                    </span>

                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {visibleColumns.length}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        isColumnMenuOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {isColumnMenuOpen && (
                    <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                      <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Columns
                        </span>

                        <button
                          type="button"
                          onClick={
                            resetColumns
                          }
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Reset
                        </button>
                      </div>

                      <div className="max-h-72 space-y-1 overflow-y-auto">
                        {safeColumns.map(
                          (column) => {
                            if (
                              !column?.key
                            ) {
                              return null;
                            }

                            const isVisible =
                              columnVisibility[
                                column.key
                              ] !== false;

                            return (
                              <label
                                key={
                                  column.key
                                }
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    isVisible
                                  }
                                  onChange={() =>
                                    toggleColumn(
                                      column.key,
                                    )
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                                  {getColumnLabel(
                                    column,
                                  )}
                                </span>

                                {isVisible ? (
                                  <Eye
                                    size={15}
                                    className="text-gray-400"
                                  />
                                ) : (
                                  <EyeOff
                                    size={15}
                                    className="text-gray-400"
                                  />
                                )}
                              </label>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                ACTIVE FILTERS
            ================================================= */}

            {hasAnyActiveFilter && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {search && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Search: {search}
                    </span>
                  )}

                  {hasActiveGateFilter && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Gate: {selectedGate}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    handleClearFilters
                  }
                  className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-x-auto">
        <table
          className={`w-full border-collapse ${minWidth}`}
        >
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              {visibleColumns.map(
                (column) => {
                  if (!column?.key) {
                    return null;
                  }

                  const isSortable =
                    showSort &&
                    column.sortable !==
                      false;

                  const isActive =
                    isSortable &&
                    sortField ===
                      column.key;

                  return (
                    <th
                      key={column.key}
                      onClick={
                        isSortable
                          ? () =>
                              handleHeaderSort(
                                column.key,
                              )
                          : undefined
                      }
                      aria-sort={
                        isActive
                          ? sortDirection ===
                            "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      className={`select-none whitespace-nowrap ${
                        column.headerClassName ||
                        "px-4 py-4 font-semibold text-gray-600"
                      } ${
                        isSortable
                          ? "group cursor-pointer transition-colors hover:bg-gray-100"
                          : ""
                      } ${
                        isActive
                          ? "bg-gray-100 text-blue-700"
                          : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {getColumnLabel(
                          column,
                        )}

                        {isSortable && (
                          <span
                            className={`inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[10px] font-bold tracking-wide ${
                              isActive
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-400 opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {isActive ? (
                              sortDirection ===
                              "asc" ? (
                                <>
                                  <ChevronUp
                                    size={13}
                                  />
                                  AC
                                </>
                              ) : (
                                <>
                                  <ChevronDown
                                    size={13}
                                  />
                                  DC
                                </>
                              )
                            ) : (
                              <ArrowUpDown
                                size={13}
                              />
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                },
              )}
            </tr>
          </thead>

          <tbody>
            {displayedData.length > 0 ? (
              displayedData.map(
                (row, index) => (
                  <tr
                    key={getRowKey(
                      row,
                      index,
                    )}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    {visibleColumns.map(
                      (column) => {
                        if (
                          !column?.key
                        ) {
                          return null;
                        }

                        return (
                          <td
                            key={
                              column.key
                            }
                            className={
                              column.cellClassName ||
                              "px-4 py-4 text-gray-600"
                            }
                          >
                            {cellRenderer(
                              row,
                              column,
                            )}
                          </td>
                        );
                      },
                    )}
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td
                  colSpan={
                    visibleColumns.length ||
                    1
                  }
                  className="px-4 py-10 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          SHOW MORE / SHOW LESS
      ===================================================== */}

      {showExpandButton &&
        hasMoreRows && (
          <button
            type="button"
            onClick={
              handleToggleShowAllRows
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            aria-expanded={showAllRows}
          >
            {showAllRows ? (
              <>
                Show Less
                <ChevronUp size={18} />
              </>
            ) : (
              <>
                View All{" "}
                {filteredData.length}{" "}
                Records
                <ChevronDown
                  size={18}
                />
              </>
            )}
          </button>
        )}
    </div>
  );
}