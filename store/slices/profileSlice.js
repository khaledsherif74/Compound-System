import { createSlice } from "@reduxjs/toolkit";

const createDefaultUserData = () => ({
  name: "",
  email: "",
  phone: "",
  unit: "",
  role: "",
});

const initialState = {
  formData: createDefaultUserData(),
  originalData: createDefaultUserData(),
  profileUser: null,

  isEditing: false,
  saving: false,

  message: "",
  messageType: "",

  session: {
    token: null,
    active: false,
    rememberMe: false,
  },
};

const profileSlice = createSlice({
  name: "profile",

  initialState,

  reducers: {
    initializeProfile(
      state,
      action,
    ) {
      const payload =
        action.payload || {};

      const user =
        payload.user ||
        createDefaultUserData();

      state.formData = {
        ...createDefaultUserData(),
        ...user,
      };

      state.originalData = {
        ...createDefaultUserData(),
        ...user,
      };

      state.profileUser =
        payload.rawUser ||
        payload.user ||
        null;

      state.message = "";
      state.messageType = "";
      state.isEditing = false;
      state.saving = false;
    },

    setProfileField(
      state,
      action,
    ) {
      const {
        name,
        value,
      } = action.payload || {};

      if (name) {
        state.formData[name] =
          value;
      }
    },

    setProfileFormData(
      state,
      action,
    ) {
      state.formData = {
        ...createDefaultUserData(),
        ...(action.payload || {}),
      };
    },

    setOriginalProfileData(
      state,
      action,
    ) {
      state.originalData = {
        ...createDefaultUserData(),
        ...(action.payload || {}),
      };
    },

    setProfileUser(
      state,
      action,
    ) {
      state.profileUser =
        action.payload || null;
    },

    setProfileEditing(
      state,
      action,
    ) {
      state.isEditing =
        Boolean(action.payload);
    },

    setProfileSaving(
      state,
      action,
    ) {
      state.saving =
        Boolean(action.payload);
    },

    setProfileMessage(
      state,
      action,
    ) {
      state.message =
        action.payload || "";
    },

    setProfileMessageType(
      state,
      action,
    ) {
      state.messageType =
        action.payload || "";
    },

    clearProfileMessage(
      state,
    ) {
      state.message = "";
      state.messageType = "";
    },

    startSession(
      state,
      action,
    ) {
      const payload =
        action.payload || {};

      state.session = {
        token:
          payload.token || null,

        active:
          Boolean(payload.token),

        rememberMe:
          Boolean(
            payload.rememberMe,
          ),
      };

      if (payload.user) {
        state.profileUser =
          payload.user;
      }
    },

    endSession(state) {
      state.session = {
        token: null,
        active: false,
        rememberMe: false,
      };

      state.profileUser = null;
      state.isEditing = false;
      state.saving = false;
    },
  },
});

export const {
  initializeProfile,
  setProfileField,
  setProfileFormData,
  setOriginalProfileData,
  setProfileUser,
  setProfileEditing,
  setProfileSaving,
  setProfileMessage,
  setProfileMessageType,
  clearProfileMessage,
  startSession,
  endSession,
} = profileSlice.actions;

export const DEFAULT_USER_DATA =
  createDefaultUserData();

export default profileSlice.reducer;