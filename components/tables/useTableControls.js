// components/tables/useTableControls.js

"use client";

import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  initializeTable,
  setTableSearch,
  setTableFilterField,
  setTableFilterValue,
  setTableSortField,
  setTableSortDirection,
  handleTableHeaderSort as handleTableHeaderSortAction,
  setTableShowAllRows,
  toggleTableColumn,
  resetTableColumns,
  clearTableFilters,
} from "@/store/slices/tableLogsSlice";

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getSearchableText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(getSearchableText).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value)
      .map(getSearchableText)
      .join(" ");
  }

  return String(value);
};

const compareValues = (a, b) => {
  if (a === b) {
    return 0;
  }

  if (typeof a === "number" && typeof b === "number") {
    return a < b ? -1 : 1;
  }

  const aString = normalize(getSearchableText(a));
  const bString = normalize(getSearchableText(b));

  const aDate = Date.parse(aString);
  const bDate = Date.parse(bString);

  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
    if (aDate < bDate) {
      return -1;
    }

    if (aDate > bDate) {
      return 1;
    }

    return 0;
  }

  return aString.localeCompare(bString, undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

const createInitialVisibility = (columns = []) =>
  columns.reduce((visibility, column) => {
    if (column?.key) {
      visibility[column.key] = column.visible !== false;
    }

    return visibility;
  }, {});

/* =========================================================
   HOOK
========================================================= */

export default function useTableControls({
  data = [],
  columns = [],
  initialSortField = "",
  initialSortDirection = "asc",
  maxVisibleRows = 3,
  externalFilter,
  searchKeys,
  tableId = "default",
}) {
  const dispatch = useDispatch();

  const initializedRef = useRef(false);

  /* =======================================================
     NORMALIZED COLUMNS
  ======================================================= */

  const normalizedColumns = useMemo(
    () =>
      Array.isArray(columns)
        ? columns.filter(Boolean)
        : [],
    [columns],
  );

  /* =======================================================
     TABLE STATE
  ======================================================= */

  const tableState = useSelector(
    (state) =>
      state?.tableLogs?.tables?.[tableId],
  );

  /* =======================================================
     INITIALIZE TABLE
  ======================================================= */

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    if (tableState) {
      initializedRef.current = true;
      return;
    }

    dispatch(
      initializeTable({
        tableId,
        columns: normalizedColumns,
        initialSortField,
        initialSortDirection:
          initialSortDirection === "desc"
            ? "desc"
            : "asc",
      }),
    );

    initializedRef.current = true;
  }, [
    dispatch,
    tableId,
    normalizedColumns,
    initialSortField,
    initialSortDirection,
    tableState,
  ]);

  /* =======================================================
     FALLBACK STATE
  ======================================================= */

  const currentState =
    tableState || {
      search: "",
      filterField: "all",
      filterValue: "",
      sortField: initialSortField || "",
      sortDirection:
        initialSortDirection === "desc"
          ? "desc"
          : "asc",
      showAllRows: false,
      columnVisibility:
        createInitialVisibility(
          normalizedColumns,
        ),
    };

  const {
    search = "",
    filterField = "all",
    filterValue = "",
    sortField = "",
    sortDirection = "asc",
    showAllRows = false,
    columnVisibility = {},
  } = currentState;

  /* =======================================================
     SEARCHABLE COLUMNS
  ======================================================= */

  const searchableKeys = useMemo(() => {
    if (
      Array.isArray(searchKeys) &&
      searchKeys.length > 0
    ) {
      return searchKeys.filter(Boolean);
    }

    return normalizedColumns
      .filter(
        (column) =>
          column.searchable !== false,
      )
      .map((column) => column.key)
      .filter(Boolean);
  }, [
    normalizedColumns,
    searchKeys,
  ]);

  /* =======================================================
     FILTERABLE COLUMNS
  ======================================================= */

  const filterableColumns = useMemo(
    () =>
      normalizedColumns.filter(
        (column) =>
          column.filterable !== false &&
          column.key,
      ),
    [normalizedColumns],
  );

  /* =======================================================
     SORTABLE COLUMNS
  ======================================================= */

  const sortableColumns = useMemo(
    () =>
      normalizedColumns.filter(
        (column) =>
          column.sortable !== false &&
          column.key,
      ),
    [normalizedColumns],
  );

  /* =======================================================
     VISIBLE COLUMNS
  ======================================================= */

  const visibleColumns = useMemo(
    () =>
      normalizedColumns.filter(
        (column) =>
          columnVisibility?.[column.key] !==
          false,
      ),
    [
      normalizedColumns,
      columnVisibility,
    ],
  );

  /* =======================================================
     SAFE DATA
     IMPORTANT:
     NEVER LIMIT DATA HERE.
     
     Search, filtering and sorting MUST operate on
     the COMPLETE dataset.
  ======================================================= */

  const safeData = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  /* =======================================================
     FILTER + SORT
     
     IMPORTANT:
     This produces the COMPLETE filtered/sorted dataset.
     
     There is NO slice() here.
     Therefore if the API returns 20 records,
     filteredAndSortedData contains all 20 records.
  ======================================================= */

  const filteredAndSortedData = useMemo(() => {
    const normalizedSearch = normalize(search);
    const normalizedFilter = normalize(filterValue);

    const filtered = safeData.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        searchableKeys.some((key) =>
          normalize(
            getSearchableText(row?.[key]),
          ).includes(normalizedSearch),
        );

      const matchesColumnFilter =
        !normalizedFilter ||
        filterField === "all" ||
        normalize(
          getSearchableText(
            row?.[filterField],
          ),
        ).includes(normalizedFilter);

      const matchesExternalFilter =
        typeof externalFilter !== "function" ||
        externalFilter(row);

      return (
        matchesSearch &&
        matchesColumnFilter &&
        matchesExternalFilter
      );
    });

    if (!sortField) {
      return filtered;
    }

    return filtered
      .map((row, index) => ({
        row,
        index,
      }))
      .sort((a, b) => {
        const result = compareValues(
          a.row?.[sortField],
          b.row?.[sortField],
        );

        if (result !== 0) {
          return sortDirection === "asc"
            ? result
            : -result;
        }

        return a.index - b.index;
      })
      .map(({ row }) => row);
  }, [
    safeData,
    externalFilter,
    filterField,
    filterValue,
    search,
    searchableKeys,
    sortDirection,
    sortField,
  ]);

  /* =======================================================
     MAX VISIBLE ROWS
  ======================================================= */

  const safeMaxVisibleRows = useMemo(() => {
    const value = Number(maxVisibleRows);

    if (
      !Number.isFinite(value) ||
      value < 1
    ) {
      return 3;
    }

    return Math.floor(value);
  }, [maxVisibleRows]);

  /* =======================================================
     DISPLAYED DATA
     
     THIS IS THE ONLY PLACE WHERE THE 3-ROW LIMIT EXISTS.
     
     Collapsed:
       20 total -> first 3
    
     Expanded:
       20 total -> all 20
  ======================================================= */

  const displayedData = useMemo(() => {
    if (showAllRows) {
      return filteredAndSortedData;
    }

    return filteredAndSortedData.slice(
      0,
      safeMaxVisibleRows,
    );
  }, [
    filteredAndSortedData,
    safeMaxVisibleRows,
    showAllRows,
  ]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const setSearchAndCollapse = (value) => {
    dispatch(
      setTableSearch({
        tableId,
        value: String(value ?? ""),
      }),
    );
  };

  /* =======================================================
     FILTER FIELD
  ======================================================= */

  const setFilterFieldAndReset = (value) => {
    dispatch(
      setTableFilterField({
        tableId,
        value: value || "all",
      }),
    );
  };

  /* =======================================================
     FILTER VALUE
  ======================================================= */

  const setFilterValueAndCollapse = (value) => {
    dispatch(
      setTableFilterValue({
        tableId,
        value: String(value ?? ""),
      }),
    );
  };

  /* =======================================================
     SORT FIELD
  ======================================================= */

  const setSortFieldAndCollapse = (value) => {
    dispatch(
      setTableSortField({
        tableId,
        value: value || "",
      }),
    );
  };

  /* =======================================================
     SORT DIRECTION
  ======================================================= */

  const toggleSortDirection = () => {
    dispatch(
      setTableSortDirection({
        tableId,
        value:
          sortDirection === "asc"
            ? "desc"
            : "asc",
      }),
    );
  };

  /* =======================================================
     HEADER SORT
  ======================================================= */

  const handleHeaderSort = (columnKey) => {
    if (!columnKey) {
      return;
    }

    const wasExpanded = Boolean(showAllRows);

    dispatch(
      handleTableHeaderSortAction({
        tableId,
        columnKey,
      }),
    );

    /*
     * Preserve expanded/collapsed state after sorting.
     */
    dispatch(
      setTableShowAllRows({
        tableId,
        value: wasExpanded,
      }),
    );
  };

  /* =======================================================
     TOGGLE COLUMN
  ======================================================= */

  const toggleColumn = (columnKey) => {
    dispatch(
      toggleTableColumn({
        tableId,
        columnKey,
      }),
    );
  };

  /* =======================================================
     RESET COLUMNS
  ======================================================= */

  const resetColumns = () => {
    dispatch(
      resetTableColumns({
        tableId,
        columns: normalizedColumns,
      }),
    );
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    dispatch(
      clearTableFilters({
        tableId,
      }),
    );
  };

  /* =======================================================
     ACTIVE FILTERS
  ======================================================= */

  const hasActiveFilters =
    String(search).trim() !== "" ||
    filterField !== "all" ||
    String(filterValue).trim() !== "";

  /* =======================================================
     MORE ROWS
     
     IMPORTANT:
     Compare the COMPLETE filtered dataset against
     maxVisibleRows.
  ======================================================= */

  const hasMoreRows =
    filteredAndSortedData.length >
    safeMaxVisibleRows;

  /* =======================================================
     VISIBLE COUNT
  ======================================================= */

  const visibleCount =
    visibleColumns.length;

  /* =======================================================
     TOGGLE EXPANSION
  ======================================================= */

  const toggleShowAllRows = () => {
    dispatch(
      setTableShowAllRows({
        tableId,
        value: !Boolean(showAllRows),
      }),
    );
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return {
    search,
    setSearch: setSearchAndCollapse,

    filterField,
    setFilterField:
      setFilterFieldAndReset,

    filterValue,
    setFilterValue:
      setFilterValueAndCollapse,

    filterableColumns,

    sortField,
    setSortField:
      setSortFieldAndCollapse,

    sortDirection,
    toggleSortDirection,

    handleHeaderSort,

    sortableColumns,

    showAllRows,

    setShowAllRows: (value) => {
      dispatch(
        setTableShowAllRows({
          tableId,
          value: Boolean(value),
        }),
      );
    },

    toggleShowAllRows,

    /*
     * COMPLETE filtered/sorted dataset.
     * NEVER limited to 3.
     */
    filteredData:
      filteredAndSortedData,

    /*
     * Data actually rendered by the table.
     * 3 when collapsed, all when expanded.
     */
    displayedData,

    hasMoreRows,

    columnVisibility,

    visibleColumns,

    toggleColumn,

    resetColumns,

    visibleCount,

    clearFilters,

    hasActiveFilters,
  };
}

export { useTableControls };