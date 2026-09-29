import { createSlice } from "@reduxjs/toolkit";

const createTableState = () => ({
  search: "",
  filterField: "all",
  filterValue: "",
  sortField: "",
  sortDirection: "asc",
  showAllRows: false,
  columnVisibility: {},
});

const initialState = {
  tables: {},
};

const ensureTable = (
  state,
  tableId,
) => {
  const id =
    tableId || "default";

  if (!state.tables[id]) {
    state.tables[id] =
      createTableState();
  }

  return state.tables[id];
};

const tableLogsSlice =
  createSlice({
    name: "tableLogs",

    initialState,

    reducers: {
      initializeTable(
        state,
        action,
      ) {
        const {
          tableId = "default",
          columns = [],
          initialSortField = "",
          initialSortDirection = "asc",
        } =
          action.payload || {};

        const table =
          ensureTable(
            state,
            tableId,
          );

        if (
          Array.isArray(columns)
        ) {
          columns.forEach(
            (column) => {
              if (
                column?.key &&
                !Object.prototype.hasOwnProperty.call(
                  table.columnVisibility,
                  column.key,
                )
              ) {
                table.columnVisibility[
                  column.key
                ] =
                  column.visible !==
                  false;
              }
            },
          );
        }

        /*
         * Only initialize sorting if
         * this table has not already been
         * configured.
         */

        if (
          !table.sortField &&
          initialSortField
        ) {
          table.sortField =
            initialSortField;

          table.sortDirection =
            initialSortDirection ===
            "desc"
              ? "desc"
              : "asc";
        }
      },

      setTableSearch(
        state,
        action,
      ) {
        const {
          tableId = "default",
          value = "",
        } =
          action.payload || {};

        const table =
          ensureTable(
            state,
            tableId,
          );

        table.search =
          String(value);

        table.showAllRows =
          false;
      },

      setTableFilterField(
        state,
        action,
      ) {
        const {
          tableId = "default",
          value = "all",
        } =
          action.payload || {};

        const table =
          ensureTable(
            state,
            tableId,
          );

        table.filterField =
          value || "all";

        table.filterValue = "";
        table.showAllRows =
          false;
      },

      setTableFilterValue(
        state,
        action,
      ) {
        const {
          tableId = "default",
          value = "",
        } =
          action.payload || {};

        const table =
          ensureTable(
            state,
            tableId,
          );

        table.filterValue =
          String(value);

        table.showAllRows =
          false;
      },

      setTableSortField(
        state,
        action,
      ) {
        const {
          tableId = "default",
          value = "",
        } =
          action.payload || {};

        const table =
          ensureTable(
            state,
            tableId,
          );

        table.sortField =
          value || "";

        table.showAllRows =
          false;
      },

      setTableSortDirection(
        state,
        action,
      ) {
        const {
          tableId = "default",
          value = "asc",
        } =
          action.payload || {};

        const table =
          ensureTable(
            state,
            tableId,
          );

        table.sortDirection =
          value === "desc"
            ? "desc"
            : "asc";

        table.showAllRows =
          false;
      },

      handleTableHeaderSort(
        state,
        action,
      ) {
        const {
          tableId = "default",
          columnKey,
        } =
          action.payload || {};

        if (!columnKey) {
          return;
        }

        const table =
          ensureTable(
            state,
            tableId,
          );

        if (
          table.sortField ===
          columnKey
        ) {
          table.sortDirection =
            table.sortDirection ===
            "asc"
              ? "desc"
              : "asc";
        } else {
          table.sortField =
            columnKey;

          table.sortDirection =
            "asc";
        }

        table.showAllRows =
          false;
      },

      setTableShowAllRows(
        state,
        action,
      ) {
        const {
          tableId = "default",
          value,
        } =
          action.payload || {};

        const table =
          ensureTable(
            state,
            tableId,
          );

        table.showAllRows =
          Boolean(value);
      },

      toggleTableColumn(
        state,
        action,
      ) {
        const {
          tableId = "default",
          columnKey,
        } =
          action.payload || {};

        if (!columnKey) {
          return;
        }

        const table =
          ensureTable(
            state,
            tableId,
          );

        table.columnVisibility[
          columnKey
        ] =
          table.columnVisibility[
            columnKey
          ] === false;
      },

      resetTableColumns(
        state,
        action,
      ) {
        const {
          tableId = "default",
          columns = [],
        } =
          action.payload || {};

        const table =
          ensureTable(
            state,
            tableId,
          );

        table.columnVisibility =
          Array.isArray(columns)
            ? columns.reduce(
                (
                  result,
                  column,
                ) => {
                  if (
                    column?.key
                  ) {
                    result[
                      column.key
                    ] =
                      column.visible !==
                      false;
                  }

                  return result;
                },
                {},
              )
            : {};
      },

      clearTableFilters(
        state,
        action,
      ) {
        const {
          tableId = "default",
        } =
          action.payload || {};

        const table =
          ensureTable(
            state,
            tableId,
          );

        table.search = "";
        table.filterField =
          "all";
        table.filterValue = "";
        table.showAllRows =
          false;
      },
    },
  });

export const {
  initializeTable,
  setTableSearch,
  setTableFilterField,
  setTableFilterValue,
  setTableSortField,
  setTableSortDirection,
  handleTableHeaderSort,
  setTableShowAllRows,
  toggleTableColumn,
  resetTableColumns,
  clearTableFilters,
} =
  tableLogsSlice.actions;

export {
  createTableState,
};

export default tableLogsSlice.reducer;