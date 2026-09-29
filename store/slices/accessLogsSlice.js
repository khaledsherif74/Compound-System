import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/Services/api";

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  accessLogs: [],

  isLoadingLogs: false,

  logsError: "",

  selectedGate: "all",

  currentPage: 1,

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
};

/* =========================================================
   FETCH ACCESS LOGS
========================================================= */

export const fetchAccessLogs = createAsyncThunk(
  "accessLogs/fetchAccessLogs",

  async (
    { page = 1, limit = 20 } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(
        `/access-logs?page=${page}&limit=${limit}`,
        {
          headers: {
            "Cache-Control":
              "no-cache, no-store, must-revalidate",

            Pragma: "no-cache",

            Expires: "0",
          },
        },
      );

      console.log(
        "Access Logs API response:",
        response.data,
      );

      const responseData = response?.data;

      /*
       * Support both:
       *
       * {
       *   data: {
       *     logs: [...]
       *   }
       * }
       *
       * and:
       *
       * {
       *   logs: [...]
       * }
       *
       * and:
       *
       * [...]
       */

      const data =
        responseData?.data ??
        responseData;

      const logs = Array.isArray(
        data?.logs,
      )
        ? data.logs
        : Array.isArray(data)
          ? data
          : [];

      const pagination = {
        page:
          Number(
            data?.page ??
              responseData?.page ??
              page,
          ) || page,

        limit:
          Number(
            data?.limit ??
              responseData?.limit ??
              limit,
          ) || limit,

        total:
          Number(
            data?.total ??
              responseData?.total ??
              logs.length,
          ) || 0,

        totalPages:
          Number(
            data?.totalPages ??
              responseData?.totalPages ??
              1,
          ) || 1,
      };

      return {
        logs,

        pagination,
      };
    } catch (error) {
      console.error(
        "Error fetching access logs:",
        error,
      );

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load access logs.",
      );
    }
  },
);

/* =========================================================
   SLICE
========================================================= */

const accessLogsSlice = createSlice({
  name: "accessLogs",

  initialState,

  reducers: {
    /* =====================================================
       SET ACCESS LOGS
    ===================================================== */

    setAccessLogs: (state, action) => {
      state.accessLogs = Array.isArray(
        action.payload,
      )
        ? action.payload
        : [];

      state.pagination.total =
        state.accessLogs.length;
    },

    /* =====================================================
       SET SELECTED GATE
    ===================================================== */

    setSelectedGate: (state, action) => {
      state.selectedGate =
        action.payload || "all";
    },

    /* =====================================================
       SET CURRENT PAGE
    ===================================================== */

    setCurrentPage: (state, action) => {
      const page =
        Number(action.payload);

      state.currentPage =
        Number.isFinite(page) &&
        page > 0
          ? Math.floor(page)
          : 1;
    },

    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    clearLogsError: (state) => {
      state.logsError = "";
    },

    /* =====================================================
       CLEAR LOGS
    ===================================================== */

    clearAccessLogs: (state) => {
      state.accessLogs = [];

      state.pagination = {
        ...state.pagination,
        total: 0,
        totalPages: 1,
      };
    },

    /* =====================================================
       RESET
    ===================================================== */

    resetAccessLogs: (state) => {
      state.accessLogs = [];

      state.isLoadingLogs = false;

      state.logsError = "";

      state.selectedGate = "all";

      state.currentPage = 1;

      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
      };
    },
  },

  /* =======================================================
     ASYNC THUNK REDUCERS
  ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       PENDING
    ===================================================== */

    builder.addCase(
      fetchAccessLogs.pending,
      (state) => {
        state.isLoadingLogs = true;

        state.logsError = "";
      },
    );

    /* =====================================================
       FULFILLED
    ===================================================== */

    builder.addCase(
      fetchAccessLogs.fulfilled,
      (state, action) => {
        state.isLoadingLogs = false;

        state.logsError = "";

        /*
         * IMPORTANT:
         *
         * Keep ALL records returned by the API.
         *
         * Do NOT slice to 3 here.
         *
         * The Show More / Show Less functionality belongs
         * to ReusableDataTable/useTableControls.
         */

        state.accessLogs =
          Array.isArray(
            action.payload?.logs,
          )
            ? action.payload.logs
            : [];

        state.pagination =
          action.payload?.pagination || {
            page: 1,
            limit: 20,
            total:
              state.accessLogs.length,
            totalPages: 1,
          };

        state.currentPage =
          Number(
            state.pagination?.page,
          ) || 1;
      },
    );

    /* =====================================================
       REJECTED
    ===================================================== */

    builder.addCase(
      fetchAccessLogs.rejected,
      (state, action) => {
        state.isLoadingLogs = false;

        state.logsError =
          action.payload ||
          action.error?.message ||
          "Failed to load access logs.";

        state.accessLogs = [];
      },
    );
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setAccessLogs,
  setSelectedGate,
  setCurrentPage,
  clearLogsError,
  clearAccessLogs,
  resetAccessLogs,
} = accessLogsSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default accessLogsSlice.reducer;