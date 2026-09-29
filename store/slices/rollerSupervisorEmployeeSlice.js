import { createSlice } from "@reduxjs/toolkit";

const createInitialForm = () => ({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
});

const initialState = {
  employees: [],
  loadingEmployees: true,
  employeesError: "",

  form: createInitialForm(),

  errors: {},
  editingId: null,
  successMessage: "",
  showPassword: false,
  submitting: false,
};

const rollerSupervisorEmployeeSlice =
  createSlice({
    name: "rollerSupervisorEmployee",

    initialState,

    reducers: {
      /* ===================================================
         EMPLOYEES
      =================================================== */

      setEmployees(
        state,
        action,
      ) {
        state.employees =
          Array.isArray(
            action.payload,
          )
            ? action.payload
            : [];
      },

      setLoadingEmployees(
        state,
        action,
      ) {
        state.loadingEmployees =
          Boolean(action.payload);
      },

      setEmployeesError(
        state,
        action,
      ) {
        state.employeesError =
          action.payload || "";
      },

      updateEmployeeStatus(
        state,
        action,
      ) {
        const {
          id,
          isActive,
        } =
          action.payload || {};

        const employee =
          state.employees.find(
            (item) =>
              item.id === id,
          );

        if (employee) {
          employee.isActive =
            Boolean(isActive);
        }
      },

      /* ===================================================
         FORM
      =================================================== */

      setForm(
        state,
        action,
      ) {
        state.form = {
          ...createInitialForm(),
          ...(action.payload || {}),
        };
      },

      updateFormField(
        state,
        action,
      ) {
        const {
          name,
          value,
        } =
          action.payload || {};

        if (!name) {
          return;
        }

        state.form[name] =
          value;
      },

      setErrors(
        state,
        action,
      ) {
        state.errors =
          action.payload &&
          typeof action.payload ===
            "object"
            ? action.payload
            : {};
      },

      updateFieldError(
        state,
        action,
      ) {
        const {
          name,
          error,
        } =
          action.payload || {};

        if (!name) {
          return;
        }

        if (error) {
          state.errors[name] =
            error;
        } else {
          delete state.errors[name];
        }
      },

      setEditingId(
        state,
        action,
      ) {
        state.editingId =
          action.payload ?? null;
      },

      setSuccessMessage(
        state,
        action,
      ) {
        state.successMessage =
          action.payload || "";
      },

      setShowPassword(
        state,
        action,
      ) {
        state.showPassword =
          Boolean(action.payload);
      },

      toggleShowPassword(
        state,
      ) {
        state.showPassword =
          !state.showPassword;
      },

      setSubmitting(
        state,
        action,
      ) {
        state.submitting =
          Boolean(action.payload);
      },

      /* ===================================================
         RESET
      =================================================== */

      resetEmployeeForm(
        state,
      ) {
        state.form =
          createInitialForm();

        state.errors = {};
        state.editingId = null;
        state.showPassword = false;
        state.submitting = false;
      },

      clearSuccessMessage(
        state,
      ) {
        state.successMessage = "";
      },

      clearEmployeeError(
        state,
      ) {
        state.employeesError = "";
      },
    },
  });

export const {
  setEmployees,
  setLoadingEmployees,
  setEmployeesError,
  updateEmployeeStatus,

  setForm,
  updateFormField,
  setErrors,
  updateFieldError,

  setEditingId,
  setSuccessMessage,
  setShowPassword,
  toggleShowPassword,

  setSubmitting,

  resetEmployeeForm,
  clearSuccessMessage,
  clearEmployeeError,
} =
  rollerSupervisorEmployeeSlice.actions;

export default rollerSupervisorEmployeeSlice.reducer;