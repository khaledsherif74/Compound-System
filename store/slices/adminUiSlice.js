import { createSlice } from "@reduxjs/toolkit";

const adminUiSlice = createSlice({
  name: "adminUi",
  initialState: {},
  reducers: {
    setField(state, action) {
      const { key, value } = action.payload || {};
      if (!key) return;
      state[key] = value;
    },
    clearField(state, action) {
      const { key } = action.payload || {};
      if (!key) return;
      delete state[key];
    },
    clearFields(state, action) {
      const keys = Array.isArray(action.payload) ? action.payload : [];
      keys.forEach((key) => delete state[key]);
    },
  },
});

export const { setField, clearField, clearFields } = adminUiSlice.actions;
export default adminUiSlice.reducer;
