// authSlice.js
// No localStorage dependency — no change required.

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rawUser: null,
  user: {
    name: "",
    email: "",
    phone: "",
    unit: "",
    role: "",
  },
  loading: true,
  error: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoading(state) {
      state.loading = true;
      state.error = "";
    },
    userLoaded(state, action) {
      state.rawUser = action.payload.rawUser ?? null;
      state.user = action.payload.user;
      state.loading = false;
      state.error = "";
    },
    userLoadFailed(state, action) {
      state.loading = false;
      state.error = action.payload || "Failed to load profile.";
    },
    startSession(state, action) {
      state.rawUser = action.payload.rawUser ?? action.payload.user ?? null;
      state.user = action.payload.user;
      state.loading = false;
      state.error = "";
    },
    clearUser(state) {
      state.rawUser = null;
      state.user = initialState.user;
      state.loading = false;
      state.error = "";
    },
  },
});

export const {
  userLoading,
  userLoaded,
  userLoadFailed,
  startSession,
  clearUser,
} = authSlice.actions;

export default authSlice.reducer;