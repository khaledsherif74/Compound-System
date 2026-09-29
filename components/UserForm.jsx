"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useReduxUIState from "@/hooks/useReduxUIState";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Plus,
  UserRound,
  X,
  ArrowLeft,
} from "lucide-react";

import {
  registerUser,
  registerSubAdmin,
  clearUserError,
  clearUserSuccess,
  selectUserSubmitting,
  selectUserError,
  selectUserSuccess,
} from "@/store/slices/usersSlice";

import { BackWard } from "@/utilites/backFunc";

const STATUS_OPTIONS = ["active", "blocked"];

const ROLE_OPTIONS = [
  "Supervisor",
  "Roller",
  "Admin",
  "Sub Admin",
];

const SINGLE_VEHICLE_ROLES = [
  "Supervisor",
  "Roller",
  "Admin",
  "Sub Admin",
];

export default function UserForm({
  form = {},
  editingOwnerId,
  onSubmit,
  onCancel,
  style,
}) {
  const dispatch = useDispatch();

  const submitting = useSelector(selectUserSubmitting);
  const apiError = useSelector(selectUserError);
  const success = useSelector(selectUserSuccess);

  const [formData, setFormData] = useReduxUIState(
    `userForm.${editingOwnerId || "new"}.${JSON.stringify(form)}`,
    {
      username: form.username || "",
      role: form.role || "Supervisor",
      firstName: form.firstName || "",
      lastName: form.lastName || "",
      unitNumber: form.unitNumber || "",
      status: form.status || "active",
      phone: form.phone || "",
      email: form.email || "",
      vehicleLimit: form.vehicleLimit ?? 1,
      password: form.password || "",
    }
  );

  useEffect(() => {
    dispatch(clearUserSuccess());
    dispatch(clearUserError());

    return () => {
      dispatch(clearUserSuccess());
      dispatch(clearUserError());
    };
  }, [dispatch]);

  const isSingleVehicleRole =
    SINGLE_VEHICLE_ROLES.includes(formData.role);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;

    setFormData((previous) => ({
      ...previous,
      role: selectedRole,
      vehicleLimit: SINGLE_VEHICLE_ROLES.includes(selectedRole)
        ? 1
        : previous.vehicleLimit || 1,
    }));
  };

  const handlePhoneChange = (event) => {
    const phone = event.target.value.replace(/\D/g, "");

    setFormData((previous) => ({
      ...previous,
      phone,
    }));
  };

  const handleVehicleLimitChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setFormData((previous) => ({
        ...previous,
        vehicleLimit: "",
      }));

      return;
    }

    const numericValue = Number(value);

    if (!Number.isNaN(numericValue) && numericValue >= 1) {
      setFormData((previous) => ({
        ...previous,
        vehicleLimit: numericValue,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    dispatch(clearUserError());
    dispatch(clearUserSuccess());

    const vehicleLimit = SINGLE_VEHICLE_ROLES.includes(
      formData.role
    )
      ? 1
      : Number(formData.vehicleLimit);

    if (
      !SINGLE_VEHICLE_ROLES.includes(formData.role) &&
      (!Number.isInteger(vehicleLimit) || vehicleLimit < 1)
    ) {
      return;
    }

    const finalFormData = {
      ...formData,
      vehicleLimit,
    };

    const createThunk =
      formData.role === "Sub Admin"
        ? registerSubAdmin
        : registerUser;

    const result = await dispatch(
      createThunk(finalFormData)
    );

    if (createThunk.fulfilled.match(result)) {
      if (typeof onSubmit === "function") {
        onSubmit(result.payload);
      }

      if (!editingOwnerId) {
        setFormData((previous) => ({
          username: "",
          role: previous.role,
          firstName: "",
          lastName: "",
          unitNumber: "",
          status: "active",
          phone: "",
          email: "",
          vehicleLimit: SINGLE_VEHICLE_ROLES.includes(
            previous.role
          )
            ? 1
            : 1,
          password: "",
        }));
      }
    }
  };

  return (
    <div
      className={`w-full max-w-6xl mx-auto mb-8 rounded-3xl bg-white p-6 shadow-lg ${
        style || ""
      }`}
    >
      {/* Back Button */}
      <button
        type="button"
        onClick={BackWard}
        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
            <UserRound size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {editingOwnerId
                ? "Edit User"
                : "User Information"}
            </h2>

            <p className="text-xs text-gray-500">
              Enter user account information.
            </p>
          </div>
        </div>

        {editingOwnerId && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
            title="Cancel editing"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* API Feedback */}
      {apiError && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle size={19} />

          <span className="font-medium">
            {apiError}
          </span>
        </div>
      )}

      {success && !apiError && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          <CheckCircle2 size={19} />

          <span className="font-medium">
            User registered successfully.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          {/* Username */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>

            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Email / ID / Username"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              Can be an email address, an ID, or a plain username.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>

            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                required
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              First Name
            </label>

            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Last Name
            </label>

            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Unit Number */}
          {!isSingleVehicleRole && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Unit Number
              </label>

              <input
                name="unitNumber"
                type="text"
                value={formData.unitNumber}
                onChange={handleChange}
                placeholder="A-101"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>

            <div className="relative">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status.charAt(0).toUpperCase() +
                      status.slice(1)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>

            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="01XXXXXXXXX"
              required
              autoComplete="tel"
              inputMode="numeric"
              maxLength={11}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Max Number of Vehicles */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Max Number of Vehicles
            </label>

            {isSingleVehicleRole ? (
              <>
                <div className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-gray-100 px-4 py-3">
                  <span className="font-medium text-gray-600">
                    1 Vehicle
                  </span>

                  <span className="text-xs font-medium text-gray-400">
                    Fixed
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  {formData.role} users can register only 1 vehicle.
                </p>
              </>
            ) : (
              <>
                <input
                  name="vehicleLimit"
                  type="number"
                  value={formData.vehicleLimit}
                  onChange={handleVehicleLimitChange}
                  placeholder="Enter maximum number of vehicles"
                  min="1"
                  step="1"
                  required
                  inputMode="numeric"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Enter the maximum number of vehicles this user can register.
                </p>
              </>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>


            </div>

            <input
              name="password"
              type="text"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          {editingOwnerId && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              "Saving..."
            ) : editingOwnerId ? (
              <>
                <Check size={19} />
                Update User
              </>
            ) : (
              <>
                <Plus size={19} />
                Register User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

