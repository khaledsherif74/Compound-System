"use client";

import { Mail } from "lucide-react";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  unitCode: "",
  phone: "",
  username: "",
  email: "",
  vehicleLimit: 2,
};

export default function OwnerForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  error = "",
  editing = false,
  onPasswordRecovery,
  passwordRecoveryLoading = false,
  submitting = false,
}) {

  const safeForm = {
    ...EMPTY_FORM,
    ...(form || {}),
  };

  function handleChange(e) {
    const {
      name,
      value,
    } = e.target;

    if (typeof setForm !== "function") {
      return;
    }

    setForm((previous) => ({
      ...EMPTY_FORM,
      ...(previous || {}),
      [name]:
        name === "phone"
          ? value.replace(/\D/g, "")
          : name === "vehicleLimit"
            ? value.replace(/\D/g, "")
            : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (typeof onSubmit === "function") {
      onSubmit(e);
    }
  }

  return (
    <div className="mb-6 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-700 dark:bg-gray-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
          {editing
            ? "Edit Owner"
            : "Register Owner"}
        </h2>
{/* 
        <button
          type="button"
          onClick={onCancel}
          title="Close"
          aria-label="Close"
          className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button> */}
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-5"
      >

        {/* ===================================================
            FIRST / LAST NAME
        =================================================== */}

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name
            </label>

            <input
              type="text"
              name="firstName"
              placeholder="Enter Your First Name"
              value={safeForm.firstName}
              onChange={handleChange}
              required
              className="box-border w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name
            </label>

            <input
              type="text"
              name="lastName"
              placeholder="Enter Your Last Name"
              value={safeForm.lastName}
              onChange={handleChange}
              required
              className="box-border w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

        </div>

        {/* ===================================================
            UNIT / PHONE
        =================================================== */}

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unit Number
            </label>

            <input
              type="text"
              name="unitCode"
              value={safeForm.unitCode}
              onChange={handleChange}
              required={!editing}
              readOnly={editing}
              placeholder="A-101"
              className={`box-border w-full min-w-0 rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                editing
                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              }`}
            />

            {editing && (
              <p className="mt-1.5 text-xs text-gray-400">
                Unit number cannot be changed while editing.
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>

            <input
              type="tel"
              name="phone"
              value={safeForm.phone}
              onChange={handleChange}
              required
              inputMode="numeric"
              maxLength={11}
              placeholder="XXXX......"
              className="box-border w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={safeForm.username}
              onChange={handleChange}
              required
              placeholder="Enter Your Username"
              className="box-border w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* ===================================================
              EMAIL
          =================================================== */}

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter Your Email"
              value={safeForm.email}
              onChange={handleChange}
              required
              className="box-border w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

        </div>

        {/* ===================================================
            PASSWORD / VEHICLE LIMIT
        =================================================== */}

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
          {/* PASSWORD RECOVERY */}
          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>

            {editing ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/80">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Password recovery
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      Send a one-time password setup message to the owner&apos;s saved email address.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onPasswordRecovery}
                    disabled={
                      !safeForm.email ||
                      passwordRecoveryLoading ||
                      submitting
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Mail size={16} />
                    {passwordRecoveryLoading ? "Sending..." : "Send recovery"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  {safeForm.email
                    ? `Message will be sent to ${safeForm.email}.`
                    : "An email address is required before recovery can be sent."}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  No password is entered here.
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
                  Clicking &quot;Register Owner&quot; creates the account and lets the backend send a one-time password setup message to the owner&apos;s email.
                </p>
              </div>
            )}
          </div>

          {/* VEHICLE LIMIT */}
          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vehicle Limit
            </label>

            <input
              type="number"
              name="vehicleLimit"
              value={safeForm.vehicleLimit}
              onChange={handleChange}
              min="1"
              step="1"
              required
              placeholder="Enter vehicle limit"
              className="box-border w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />

            <p className="mt-1.5 text-xs text-gray-400">
              Enter the maximum number of vehicles this owner can register.
            </p>
          </div>
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || (!editing && !safeForm.email)}
            className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {submitting
              ? (editing ? "Updating..." : "Registering...")
              : editing
                ? "Update Owner"
                : "Register Owner"}
          </button>

        </div>

      </form>
    </div>
  );
}