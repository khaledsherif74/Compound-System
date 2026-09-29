import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  vehicles: [],
  isLoadingVehicles: true,
  vehiclesError: "",

  logsData: [],
  isLoadingLogs: true,
  logsError: "",

  isProfileOpen: false,
  showAllVehicles: false,
  isContactModalOpen: false,
};

const ownerDashboardSlice =
  createSlice({
    name: "ownerDashboard",

    initialState,

    reducers: {
      /* ======================================================
         VEHICLES
      ====================================================== */

      setVehicles(
        state,
        action,
      ) {
        state.vehicles =
          Array.isArray(
            action.payload,
          )
            ? action.payload
            : [];
      },

      addVehicle(
        state,
        action,
      ) {
        if (action.payload) {
          state.vehicles.push(
            action.payload,
          );
        }
      },

      setVehiclesLoading(
        state,
        action,
      ) {
        state.isLoadingVehicles =
          Boolean(
            action.payload,
          );
      },

      setVehiclesError(
        state,
        action,
      ) {
        state.vehiclesError =
          action.payload || "";
      },

      /* ======================================================
         OWNER ACCESS LOGS

         These logs come from:
         GET /access-logs/my?page=1&limit=20

         The backend is responsible for returning only
         logs belonging to the authenticated owner.
      ====================================================== */

      setLogsData(
        state,
        action,
      ) {
        state.logsData =
          Array.isArray(
            action.payload,
          )
            ? action.payload
            : [];
      },

      setLogsLoading(
        state,
        action,
      ) {
        state.isLoadingLogs =
          Boolean(
            action.payload,
          );
      },

      setLogsError(
        state,
        action,
      ) {
        state.logsError =
          action.payload || "";
      },

      /* ======================================================
         PROFILE
      ====================================================== */

      setProfileOpen(
        state,
        action,
      ) {
        state.isProfileOpen =
          Boolean(
            action.payload,
          );
      },

      /* ======================================================
         SHOW ALL VEHICLES
      ====================================================== */

      setShowAllVehicles(
        state,
        action,
      ) {
        state.showAllVehicles =
          Boolean(
            action.payload,
          );
      },

      toggleShowAllVehicles(
        state,
      ) {
        state.showAllVehicles =
          !state.showAllVehicles;
      },

      /* ======================================================
         CONTACT MODAL
      ====================================================== */

      setContactModalOpen(
        state,
        action,
      ) {
        state.isContactModalOpen =
          Boolean(
            action.payload,
          );
      },
    },
  });

export const {
  setVehicles,
  addVehicle,
  setVehiclesLoading,
  setVehiclesError,

  setLogsData,
  setLogsLoading,
  setLogsError,

  setProfileOpen,

  setShowAllVehicles,
  toggleShowAllVehicles,

  setContactModalOpen,
} =
  ownerDashboardSlice.actions;

export default ownerDashboardSlice.reducer;