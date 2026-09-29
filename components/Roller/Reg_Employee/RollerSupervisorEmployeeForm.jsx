"use client";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import RollerSupervisorEmployeeField from "./RollerSupervisorEmployeeField";

import {
  updateFormField,
  toggleShowPassword,
} from "@/store/slices/rollerSupervisorEmployeeSlice";

export default function RollerSupervisorEmployeeForm({
  onSubmit,
  onCancel,
}) {
  const dispatch = useDispatch();

  const {
    form,
    errors,
    editingId,
    successMessage,
    showPassword,
    submitting,
  } = useSelector(
    (state) =>
      state.rollerSupervisorEmployee
  );

  // =========================================================
  // CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    dispatch(
      updateFormField({
        name,
        value,
      })
    );
  };

  // =========================================================
  // TOGGLE PASSWORD
  // =========================================================

  const handleTogglePassword = () => {
    dispatch(toggleShowPassword());
  };

  return (
    <form
      id="employee-form"
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl bg-white p-6 shadow-lg"
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
            <ShieldCheck size={24} />
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            {editingId
              ? "Edit Employee"
              : "Add Supervisor Employee"}
          </h2>
        </div>

        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cancel editing"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ========================================================
          SUCCESS MESSAGE
      ======================================================== */}

      {successMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <CheckCircle2 size={18} />

          {successMessage}
        </div>
      )}

      {/* ========================================================
          FIELDS
      ======================================================== */}

      <div className="space-y-4">
        {/* ======================================================
            FIRST NAME
        ====================================================== */}

        <RollerSupervisorEmployeeField
          id="firstName"
          label="First Name"
          value={form.firstName}
          onChange={handleChange}
          error={errors.firstName}
          placeholder="Enter first name"
          autoComplete="given-name"
        />

        {/* ======================================================
            LAST NAME
        ====================================================== */}

        <RollerSupervisorEmployeeField
          id="lastName"
          label="Last Name"
          value={form.lastName}
          onChange={handleChange}
          error={errors.lastName}
          placeholder="Enter last name"
          autoComplete="family-name"
        />

        {/* ======================================================
            PHONE
        ====================================================== */}

        <RollerSupervisorEmployeeField
          id="phone"
          label="Phone"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="01XXXXXXXXX"
          type="tel"
          inputMode="numeric"
          maxLength={11}
          autoComplete="tel"
        />

        {/* ======================================================
            USERNAME
        ====================================================== */}

        <RollerSupervisorEmployeeField
          id="email"
          label="Username"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter username"
          type="text"
          autoComplete="username"
        />

        {/* ======================================================
            PASSWORD
        ====================================================== */}

        <div>
          <label
            htmlFor="password"
            className="mb-2 block font-semibold text-gray-700"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={
                editingId
                  ? "New Password (optional)"
                  : "Enter password"
              }
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              disabled={submitting}
              className={`w-full rounded-xl border px-4 py-3 pr-12 outline-none transition ${
                errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              } disabled:cursor-not-allowed disabled:bg-gray-100`}
            />

            <button
              type="button"
              onClick={handleTogglePassword}
              disabled={submitting}
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password}
            </p>
          )}

          {editingId &&
            !errors.password && (
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to keep the current password.
              </p>
            )}
        </div>

        {/* ======================================================
            ROLE
        ====================================================== */}

        <div>
          <label className="mb-2 block font-semibold text-gray-700">
            Role
          </label>

          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <span className="font-semibold text-blue-700">
              Supervisor
            </span>
          </div>
        </div>

        {/* ======================================================
            SUBMIT
        ====================================================== */}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

              {editingId
                ? "Updating..."
                : "Creating..."}
            </>
          ) : (
            <>
              <Plus size={19} />

              {editingId
                ? "Update Supervisor"
                : "Add Supervisor"}
            </>
          )}
        </button>

        {/* ======================================================
            CANCEL
        ====================================================== */}

        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}