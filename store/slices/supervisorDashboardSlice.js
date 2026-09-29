import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  /*
   * Kept for backward compatibility with
   * existing supervisor components.
   *
   * New access-log API state should use
   * accessLogsSlice.
   */
  accessLogs: [],
  isLoadingLogs: true,
  logsError: "",

  selectedGate: "all",

  isProfileOpen: false,

  refetchCurrentUser: 0,
};

const supervisorDashboardSlice =
  createSlice({
    name: "supervisorDashboard",

    initialState,

    reducers: {
      setAccessLogs(
        state,
        action,
      ) {
        state.accessLogs =
          Array.isArray(
            action.payload,
          )
            ? action.payload
            : [];
      },

      setLoadingLogs(
        state,
        action,
      ) {
        state.isLoadingLogs =
          Boolean(action.payload);
      },

      setLogsError(
        state,
        action,
      ) {
        state.logsError =
          action.payload || "";
      },

      setSelectedGate(
        state,
        action,
      ) {
        state.selectedGate =
          action.payload ||
          "all";
      },

      setProfileOpen(
        state,
        action,
      ) {
        state.isProfileOpen =
          Boolean(action.payload);
      },

      requestUserRefetch(
        state,
      ) {
        state.refetchCurrentUser += 1;
      },

      resetSupervisorDashboard(
        state,
      ) {
        state.accessLogs = [];
        state.isLoadingLogs = true;
        state.logsError = "";
        state.selectedGate = "all";
        state.isProfileOpen = false;
      },
    },
  });

export const {
  setAccessLogs,
  setLoadingLogs,
  setLogsError,
  setSelectedGate,
  setProfileOpen,
  requestUserRefetch,
  resetSupervisorDashboard,
} =
  supervisorDashboardSlice.actions;

export default supervisorDashboardSlice.reducer;