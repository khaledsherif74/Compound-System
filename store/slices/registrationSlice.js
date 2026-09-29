import { createSlice } from "@reduxjs/toolkit";

const createInitialState = () => ({
  isFormOpen: false,
  showLimitMessage: false,
  isSubmitting: false,

  brand: "",
  color: "",
  vehicleLicense: null,

  plateLetters: ["", "", ""],
  plateDigits: "",

  isColorOpen: false,
  colorSearch: "",
});

const initialState =
  createInitialState();

const registrationSlice = createSlice({
  name: "registration",

  initialState,

  reducers: {
    setRegistrationField(
      state,
      action,
    ) {
      const {
        field,
        value,
      } = action.payload || {};

      if (
        field &&
        Object.prototype.hasOwnProperty.call(
          state,
          field,
        )
      ) {
        state[field] = value;
      }
    },

    setPlateLetter(
      state,
      action,
    ) {
      const {
        index,
        value,
      } = action.payload || {};

      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < 3
      ) {
        state.plateLetters[index] =
          value || "";
      }
    },

    resetRegistrationForm(
      state,
    ) {
      Object.assign(
        state,
        createInitialState(),
      );
    },
  },
});

export const {
  setRegistrationField,
  setPlateLetter,
  resetRegistrationForm,
} = registrationSlice.actions;

export default registrationSlice.reducer;