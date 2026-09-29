"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Settings2,
  ChevronDown,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Swal from "sweetalert2";
import OwnerForm from "@/components/owner-registration/OwnerForm";
import VehicleForm from "@/components/owner-registration/VehicleForm";
import useReduxUIState from "@/hooks/useReduxUIState";

import {
  fetchOwners,
  registerOwner,
  updateOwner,
  sendOwnerPasswordRecovery,
  deleteOwner,
  openAddVehicle,
  openEditVehicle,
  deleteVehicleApi,
  updateVehicleStatusApi,
  startEditOwner,
  resetOwnerForm,
  setOwnerFormField,
  setOwnerSearch,
  setOwnerSort,
  selectOwners,
  selectOwnerForm,
  selectEditingOwnerId,
  selectOwnerError,
  selectSubmittingOwner,
  selectOwnerSearch,
  selectOwnerSort,
  selectShowVehicleForm,
} from "@/store/slices/ownerRegistrationSlice";
import { BackWard } from "@/utilites/backFunc";

/* =========================================================
   ENGLISH -> ARABIC-INDIC DIGITS

   Plate numbers are stored in the backend as plain English
   digits (e.g. "1234"), but should always be DISPLAYED as
   Arabic-Indic digits in the UI. Convert at render time only
   -- never mutate the stored value.
========================================================= */

const ARABIC_DIGITS = "١٢٣٤٥٦٧٨٩";

function toArabicDigits(value) {
  return String(value || "").replace(
    /[1-9]/g,
    (digit) => ARABIC_DIGITS[Number(digit) - 1],
  );
}

export default function OwnerRegistration() {
  const dispatch = useDispatch();
  const columnMenuRef = useRef(null);

  const owners = useSelector(selectOwners);
  const form = useSelector(selectOwnerForm);
  const editingOwnerId = useSelector(selectEditingOwnerId);
  const error = useSelector(selectOwnerError);
  const submittingOwner = useSelector(selectSubmittingOwner);
  const sendingPasswordRecovery = useSelector(
    (state) => Boolean(state.ownerRegistration?.sendingPasswordRecovery),
  );
  const search = useSelector(selectOwnerSearch);
  const sortConfig = useSelector(selectOwnerSort);
  const showVehicleForm = useSelector(selectShowVehicleForm);

  const [showForm, setShowForm] = useReduxUIState(
    "adminOwnerRegistration.showForm",
    false,
  );
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    firstName: true,
    lastName: true,
    unitCode: true,
    phone: true,
    email: true,
    username: true,
    vehicles: true,
    actions: true,
  });

  useEffect(() => {
    dispatch(fetchOwners());
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        columnMenuRef.current &&
        !columnMenuRef.current.contains(event.target)
      ) {
        setIsColumnMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function setForm(updater) {
    const previousForm = form || {};
    const nextForm =
      typeof updater === "function" ? updater(previousForm) : updater;

    if (!nextForm) return;

    Object.keys(nextForm).forEach((key) => {
      if (nextForm[key] !== previousForm[key]) {
        dispatch(
          setOwnerFormField({
            name: key,
            value: nextForm[key],
          }),
        );
      }
    });
  }

  function handleEditOwner(owner) {
    if (!owner?.id) {
      console.error("Cannot edit owner:", owner);
      return;
    }

    dispatch(startEditOwner(owner));
    setShowForm(true);
  }

  function handleCancel() {
    dispatch(resetOwnerForm());
    setShowForm(false);
  }

  async function handlePasswordRecovery() {
    if (!editingOwnerId || sendingPasswordRecovery) return;

    try {
      await dispatch(sendOwnerPasswordRecovery(editingOwnerId)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Recovery message sent",
        text: "A one-time password setup message has been sent to the owner&apos;s saved email address.",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (recoveryError) {
      Swal.fire({
        icon: "error",
        title: "Unable to send recovery message",
        text:
          typeof recoveryError === "string"
            ? recoveryError
            : "Failed to send the password recovery message.",
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submittingOwner) return;

    if (editingOwnerId) {
      const updateForm = {
        firstName: form?.firstName || "",
        lastName: form?.lastName || "",
        phone: form?.phone || "",
        email: form?.email || "",
        vehicleLimit: form?.vehicleLimit || 1,
      };

      const result = await dispatch(
        updateOwner({
          id: editingOwnerId,
          form: updateForm,
        }),
      );

      if (updateOwner.fulfilled.match(result)) {
        setShowForm(false);
      }

      return;
    }

    const result = await dispatch(registerOwner(form));

    if (registerOwner.fulfilled.match(result)) {
      setShowForm(false);

      if (result.payload?.passwordRecoverySent === false) {
        Swal.fire({
          icon: "warning",
          title: "Owner created",
          text: "The owner was created, but the password recovery message could not be sent. Please resend it from the owner form.",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Owner created",
          text: "The owner was created and a password setup message was sent to the saved email address.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    }
  }

  function handleSearch(e) {
    dispatch(setOwnerSearch(e.target.value));
  }

  function handleSort(column) {
    dispatch(setOwnerSort(column));
  }

  function handleAddVehicle(owner) {
    if (!owner?.id) return;
    dispatch(openAddVehicle(owner.id));
  }

  function handleEditVehicle(owner, vehicle) {
    if (!owner?.id || !vehicle?.id) return;
    dispatch(openEditVehicle({ ownerId: owner.id, vehicle }));
  }

  async function handleDeleteVehicle(owner, vehicle) {
    if (!owner?.id || !vehicle?.id) return;

    const label =
      vehicle.brand?.trim() ||
      vehicle.plateNumbers ||
      "this vehicle";

    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${label}${vehicle.plateNumbers
        ? ` (${toArabicDigits(vehicle.plateNumbers)})`
        : ""
        }.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmation.isConfirmed) return;

    const result = await dispatch(
      deleteVehicleApi({ ownerId: owner.id, vehicleId: vehicle.id }),
    );

    if (deleteVehicleApi.rejected.match(result)) {
      Swal.fire({
        title: "Failed to delete vehicle",
        text: result.payload || "Something went wrong.",
        icon: "error",
      });
    }
  }

  async function handleVehicleStatusChange(vehicle, newStatus) {
    if (!vehicle?.id) return;

    const statusLabels = {
      PENDING: "Pending",
      APPROVED: "Approved",
      REJECTED: "Rejected",
    };

    const confirmation = await Swal.fire({
      title: `Change status to ${statusLabels[newStatus] || newStatus}?`,
      text: `Vehicle: ${vehicle.brand || "Unknown"}${vehicle.plateNumbers
        ? ` (${toArabicDigits(vehicle.plateNumbers)})`
        : ""
        }`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
    });

    if (!confirmation.isConfirmed) return;

    const result = await dispatch(
      updateVehicleStatusApi({
        vehicleId: vehicle.id,
        status: newStatus,
      }),
    );

    if (updateVehicleStatusApi.fulfilled.match(result)) {
      Swal.fire({
        title: "Success",
        text: `Vehicle status updated to ${statusLabels[newStatus] || newStatus}.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Failed to update status",
        text: result.payload || "Something went wrong.",
        icon: "error",
      });
    }
  }

  function toggleColumn(column) {
    setColumnVisibility((previous) => ({
      ...previous,
      [column]: !previous[column],
    }));
  }

  function resetColumns() {
    setColumnVisibility({
      firstName: true,
      lastName: true,
      unitCode: true,
      phone: true,
      email: true,
      vehicles: true,
      actions: true,
    });
  }

  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;

  const filteredOwners = [...owners]
    .filter((owner) => {
      const value = search.trim().toLowerCase();
      if (!value) return true;

      return [
        owner.firstName,
        owner.lastName,
        owner.email,
        owner.username,
        owner.phone,
        owner.unitCode,
        owner.unit?.unitCode,
      ]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(value));
    })
    .sort((a, b) => {
      if (!sortConfig?.key) {
        return 0;
      }

      const key = sortConfig.key;

      let first = a[key] ?? "";
      let second = b[key] ?? "";

      if (key === "unitCode") {
        first = a.unitCode || a.unit?.unitCode || "";
        second = b.unitCode || b.unit?.unitCode || "";
      }

      if (key === "vehicleLimit") {
        first = a.vehicleLimit ?? a.maxVehicles ?? 0;
        second = b.vehicleLimit ?? b.maxVehicles ?? 0;

        first = Number(first);
        second = Number(second);
      } else {
        first = String(first).toLowerCase();
        second = String(second).toLowerCase();
      }

      if (first < second) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }

      if (first > second) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }

      return 0;
    });

  function getSortIcon(column) {
    if (sortConfig?.key !== column) {
      return <ArrowUpDown size={15} className="text-gray-400" />;
    }

    if (sortConfig.direction === "asc") {
      return <ArrowUp size={15} className="text-blue-600 dark:text-blue-400" />;
    }

    return <ArrowDown size={15} className="text-blue-600 dark:text-blue-400" />;
  }

  function getStatusIcon(status) {
    switch (String(status || "").toUpperCase()) {
      case "APPROVED":
        return <CheckCircle size={14} className="text-green-600" />;
      case "REJECTED":
        return <XCircle size={14} className="text-red-600" />;
      case "PENDING":
      default:
        return <Clock size={14} className="text-yellow-600" />;
    }
  }

  function getStatusBadgeClass(status) {
    switch (String(status || "").toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-5">
      <button
        type="button"
        onClick={BackWard}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Owner Registration
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage compound owners and their vehicles.
          </p>
        </div>
      </div>

      <OwnerForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onPasswordRecovery={handlePasswordRecovery}
        passwordRecoveryLoading={sendingPasswordRecovery}
        error={error}
        editing={Boolean(editingOwnerId)}
        submitting={submittingOwner}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex w-full items-center rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
          <Search size={18} className="shrink-0 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search owners..."
            className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
          />
        </div>

        <div className="relative shrink-0" ref={columnMenuRef}>
          <button
            type="button"
            onClick={() => setIsColumnMenuOpen((previous) => !previous)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle column visibility"
            aria-expanded={isColumnMenuOpen}
          >
            <Settings2 size={18} />
            Columns
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {visibleColumnCount}
            </span>
            <ChevronDown
              size={15}
              className={`transition-transform ${isColumnMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isColumnMenuOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-2xl sm:right-0 sm:left-auto dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-2 flex items-center justify-between gap-3 border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Show / Hide Columns
                </span>

                <button
                  type="button"
                  onClick={resetColumns}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-1">
                {[
                  ["firstName", "First Name"],
                  ["lastName", "Last Name"],
                  ["unitCode", "Unit Number"],
                  ["phone", "Phone"],
                  ["email", "Email"],
                  ["username", "Username"],
                  ["vehicles", "Vehicles"],
                  ["actions", "Actions"],
                ].map(([key, label]) => {
                  const isVisible = Boolean(columnVisibility[key]);

                  return (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleColumn(key)}
                        className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-300">
                        {label}
                      </span>
                      {isVisible ? (
                        <Eye size={14} className="shrink-0 text-gray-400" />
                      ) : (
                        <EyeOff size={14} className="shrink-0 text-gray-400" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-237.5">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                {columnVisibility.firstName && (
                  <th className="px-4 py-4 text-left text-sm">
                    <button
                      type="button"
                      onClick={() => handleSort("firstName")}
                      className="inline-flex items-center gap-2 font-semibold text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                      First Name
                      {getSortIcon("firstName")}
                    </button>
                  </th>
                )}

                {columnVisibility.lastName && (
                  <th className="px-4 py-4 text-left text-sm">
                    <button
                      type="button"
                      onClick={() => handleSort("lastName")}
                      className="inline-flex items-center gap-2 font-semibold text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                      Last Name
                      {getSortIcon("lastName")}
                    </button>
                  </th>
                )}

                {columnVisibility.unitCode && (
                  <th className="px-4 py-4 text-left text-sm">
                    <button
                      type="button"
                      onClick={() => handleSort("unitCode")}
                      className="inline-flex items-center gap-2 font-semibold text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                      Unit Number
                      {getSortIcon("unitCode")}
                    </button>
                  </th>
                )}

                {columnVisibility.phone && (
                  <th className="px-4 py-4 text-left text-sm">
                    <button
                      type="button"
                      onClick={() => handleSort("phone")}
                      className="inline-flex items-center gap-2 font-semibold text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                      Phone
                      {getSortIcon("phone")}
                    </button>
                  </th>
                )}

                {columnVisibility.email && (
                  <th className="px-4 py-4 text-left text-sm">
                    <button
                      type="button"
                      onClick={() => handleSort("email")}
                      className="inline-flex items-center gap-2 font-semibold text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                      Email
                      {getSortIcon("email")}
                    </button>
                  </th>
                )}

                {columnVisibility.username && (
                  <th className="px-4 py-4 text-left text-sm">
                    <button
                      type="button"
                      onClick={() => handleSort("username")}
                      className="inline-flex items-center gap-2 font-semibold text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                      Username
                      {getSortIcon("username")}
                    </button>
                  </th>
                )}

                {columnVisibility.vehicles && (
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Vehicles
                  </th>
                )}

                {columnVisibility.actions && (
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOwners.map((owner) => {
                const unitCode = owner.unitCode || owner.unit?.unitCode || "-";
                const vehicleCount = owner.vehicles?.length || 0;
                const maxVehicles = owner.maxVehicles || owner.vehicleLimit || 1;

                return (
                  <tr
                    key={owner.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {columnVisibility.firstName && (
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {owner.firstName || "-"}
                      </td>
                    )}

                    {columnVisibility.lastName && (
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {owner.lastName || "-"}
                      </td>
                    )}

                    {columnVisibility.unitCode && (
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {unitCode}
                      </td>
                    )}

                    {columnVisibility.phone && (
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {owner.phone || "-"}
                      </td>
                    )}

                    {columnVisibility.email && (
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {owner.email || "-"}
                      </td>
                    )}

                    {columnVisibility.username && (
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {owner.username || "-"}
                      </td>
                    )}

                    {columnVisibility.vehicles && (
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex min-w-52 flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {vehicleCount} / {maxVehicles}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleAddVehicle(owner)}
                              disabled={vehicleCount >= maxVehicles}
                              title={
                                vehicleCount >= maxVehicles
                                  ? "Vehicle limit reached"
                                  : "Add vehicle"
                              }
                              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Add Vehicle
                            </button>
                          </div>

                          {vehicleCount > 0 && (
                            <ul className="flex flex-col gap-1.5">
                              {owner.vehicles.map((vehicle) => (
                                <li
                                  key={vehicle.id}
                                  className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2 dark:border-gray-800 dark:bg-gray-800/50"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                                        {vehicle.brand || "Unknown brand"}
                                      </p>
                                      <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                                        {Array.isArray(vehicle.plateLetters)
                                          ? [...vehicle.plateLetters].reverse().join(" ")
                                          : ""}
                                        {vehicle.plateNumbers ? toArabicDigits(vehicle.plateNumbers) : "-"}
                                      </p>
                                    </div>

                                    <span
                                      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(vehicle.status)}`}
                                    >
                                      {getStatusIcon(vehicle.status)}
                                      {String(vehicle.status || "PENDING").toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEditVehicle(owner, vehicle)
                                      }
                                      title="Edit vehicle"
                                      aria-label="Edit vehicle"
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                                    >
                                      <Pencil size={14} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteVehicle(owner, vehicle)
                                      }
                                      title="Delete vehicle"
                                      aria-label="Delete vehicle"
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                    >
                                      <Trash2 size={14} />
                                    </button>

                                    {String(vehicle.status || "").toUpperCase() !== "APPROVED" && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleVehicleStatusChange(vehicle, "APPROVED")
                                        }
                                        title="Approve vehicle"
                                        aria-label="Approve vehicle"
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-green-600 transition hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950/40 dark:hover:text-green-300"
                                      >
                                        <CheckCircle size={14} />
                                      </button>
                                    )}

                                    {String(vehicle.status || "").toUpperCase() !== "REJECTED" && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleVehicleStatusChange(vehicle, "REJECTED")
                                        }
                                        title="Reject vehicle"
                                        aria-label="Reject vehicle"
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-yellow-600 transition hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-950/40 dark:hover:text-yellow-300"
                                      >
                                        <XCircle size={14} />
                                      </button>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </td>
                    )}

                    {columnVisibility.actions && (
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditOwner(owner)}
                            title="Edit owner"
                            aria-label="Edit owner"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              Swal.fire({
                                title: "Are you sure?",
                                text: `You are about to delete ${owner.firstName || ""} ${owner.lastName || ""}.`,
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "Yes, delete it",
                                cancelButtonText: "Cancel",
                                confirmButtonColor: "#dc2626",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  dispatch(deleteOwner(owner.id));
                                }
                              });
                            }}
                            title="Delete owner"
                            aria-label="Delete owner"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredOwners.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumnCount || 1}
                    className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No owners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showVehicleForm && <VehicleForm />}
    </div>
  );
}