import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  collections: {},
  initialized: {},
};

const registrySlice = createSlice({
  name: "registry",
  initialState,
  reducers: {
    initializeCollection(state, action) {
      const { key, items = [] } = action.payload;
      if (!key || state.initialized[key]) return;

      state.collections[key] = Array.isArray(items) ? items : [];
      state.initialized[key] = true;
    },

    setCollection(state, action) {
      const { key, items = [] } = action.payload;
      if (!key) return;

      state.collections[key] = Array.isArray(items) ? items : [];
      state.initialized[key] = true;
    },

    addItem(state, action) {
      const { key, item } = action.payload;
      if (!key || item == null) return;

      if (!state.collections[key]) {
        state.collections[key] = [];
      }

      state.collections[key].push(
        item?.id == null ? { ...item, id: nanoid() } : item,
      );
      state.initialized[key] = true;
    },

    updateItem(state, action) {
      const { key, id, changes } = action.payload;
      if (!key) return;

      const collection = state.collections[key] || [];
      const index = collection.findIndex(
        (item) => String(item?.id) === String(id),
      );

      if (index !== -1 && changes && typeof changes === "object") {
        collection[index] = {
          ...collection[index],
          ...changes,
        };
      }
    },

    removeItem(state, action) {
      const { key, id } = action.payload;
      if (!key) return;

      state.collections[key] = (state.collections[key] || []).filter(
        (item) => String(item?.id) !== String(id),
      );
    },

    clearCollection(state, action) {
      const { key } = action.payload;
      if (!key) return;

      state.collections[key] = [];
      state.initialized[key] = true;
    },
  },
});

export const {
  initializeCollection,
  setCollection,
  addItem,
  updateItem,
  removeItem,
  clearCollection,
} = registrySlice.actions;

export default registrySlice.reducer;
