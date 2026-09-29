import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "idle",
  notifications: [],
  unreadNotifications: 0,
};

const dashboardHeaderSlice = createSlice({
  name: "dashboardHeader",

  initialState,

  reducers: {
    setHeaderUser(state, action) {
      state.user = action.payload || null;
    },

    setHeaderStatus(state, action) {
      state.status =
        action.payload || "idle";
    },

    setNotifications(state, action) {
      const notifications = Array.isArray(
        action.payload,
      )
        ? action.payload
        : [];

      state.notifications = notifications;

      state.unreadNotifications =
        notifications.filter(
          (notification) =>
            !notification?.read,
        ).length;
    },

    addNotification(state, action) {
      if (!action.payload) {
        return;
      }

      state.notifications.unshift(
        action.payload,
      );

      if (!action.payload?.read) {
        state.unreadNotifications += 1;
      }
    },

    markNotificationRead(state, action) {
      const notification =
        state.notifications.find(
          (item) =>
            item?.id === action.payload,
        );

      if (
        notification &&
        !notification.read
      ) {
        notification.read = true;

        state.unreadNotifications =
          Math.max(
            0,
            state.unreadNotifications - 1,
          );
      }
    },

    clearNotifications(state) {
      state.notifications = [];
      state.unreadNotifications = 0;
    },
  },
});

export const {
  setHeaderUser,
  setHeaderStatus,
  setNotifications,
  addNotification,
  markNotificationRead,
  clearNotifications,
} = dashboardHeaderSlice.actions;

export default dashboardHeaderSlice.reducer;