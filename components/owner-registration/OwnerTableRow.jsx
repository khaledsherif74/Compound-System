// components/owner-registration/OwnerTableRow.jsx

"use client";

import {
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";

import {
  deleteOwner,
  openAddVehicle,
  openEditVehicle,
  startEditOwner,
  deleteVehicleApi,
  updateVehicleStatusApi,
} from "@/store/slices/ownerRegistrationSlice";

import VehicleTable from "./VehicleTable";

export default function OwnerTableRow({
  owner,
  getPlateString,
}) {
  const dispatch = useDispatch();

  const vehicles = Array.isArray(owner?.vehicles)
    ? owner.vehicles
    : [];

  const isActive =
    String(owner?.status || "").toLowerCase() ===
    "active";

  function handleEditOwner() {
    if (!owner?.id) {
      return;
    }

    dispatch(startEditOwner(owner));
  }

  function handleDeleteOwner() {
  if (!owner?.id) {
    return;
  }

  Swal.fire({
    title: "Are you sure?",
    text: `Are you sure you want to delete ${owner?.firstName || ""} ${owner?.lastName || ""}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
  }).then((result) => {
    if (result.isConfirmed) {
      dispatch(deleteOwner(owner.id));
    }
  });
}

  function handleAddVehicle() {
    if (!owner?.id) {
      return;
    }

    dispatch(openAddVehicle(owner.id));
  }

  function handleEditVehicle(vehicle) {
    if (!owner?.id || !vehicle?.id) {
      return;
    }

    dispatch(
      openEditVehicle({
        ownerId: owner.id,
        vehicle,
      })
    );
  }

function handleDeleteVehicle(vehicleId) {
  if (!owner?.id || !vehicleId) {
    return;
  }

  Swal.fire({
    title: "Are you sure?",
    text: "You are about to delete this vehicle.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
  }).then((result) => {
    if (result.isConfirmed) {
      dispatch(
        deleteVehicleApi({
          ownerId: owner.id,
          vehicleId,
        })
      );
    }
  });
}

  function handleToggleStatus() {
    /*
      Owner status currently has no API thunk in the slice.
      Do not change the UI state locally because that would
      be reverted after refresh.
    */
  }

  function handleVehicleStatusChange(
    vehicleId,
    status
  ) {
    if (!owner?.id || !vehicleId) {
      return;
    }

    dispatch(
      updateVehicleStatusApi({
        ownerId: owner.id,
        vehicleId,
        status,
      })
    );
  }

  return (
    <>
      {/* =================================================
          OWNER ROW
      ================================================= */}

      <tr className="border-b border-slate-100 align-top transition hover:bg-slate-50/70">

        {/* =================================================
            OWNER
        ================================================= */}

        <td className="px-4 py-4">
          <div className="font-semibold text-slate-800">
            {owner?.firstName || ""}{" "}
            {owner?.lastName || ""}
          </div>

          <div className="mt-1 text-xs text-slate-400">
            ID: {owner?.id || "-"}
          </div>
        </td>

        {/* =================================================
            EMAIL
        ================================================= */}

        <td className="px-4 py-4 text-sm text-slate-600">
          {owner?.email || "-"}
        </td>


        {/* =================================================
            USERNAME
        ================================================= */}

        <td className="px-4 py-4 text-sm text-slate-600">
          {owner?.username || "-"}
        </td>

        {/* =================================================
            PHONE
        ================================================= */}

        <td className="px-4 py-4 text-sm text-slate-600">
          {owner?.phone || "-"}
        </td>

        {/* =================================================
            UNIT
        ================================================= */}

        <td className="px-4 py-4 text-sm font-medium text-slate-700">
          {
            owner?.unitCode ||
            "-"}
        </td>

        {/* =================================================
            VEHICLES
        ================================================= */}

        <td className="px-4 py-4">
          {vehicles.length === 0 ? (
            <span className="text-sm text-slate-400">
              No vehicles
            </span>
          ) : (
            <div className="flex flex-col gap-2">
              {vehicles.map(
                (vehicle, index) => (
                  <div
                    key={
                      vehicle?.id ||
                      `${owner?.id}-${index}`
                    }
                    className="flex items-center gap-2"
                  >
                    {/* PLATE */}

                    <span
                      dir="rtl"
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold tracking-wide text-slate-700"
                    >
                      {typeof getPlateString ===
                        "function"
                        ? getPlateString(
                          vehicle
                        )
                        : "-"}
                    </span>

                    {/* BRAND */}

                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium text-slate-700">
                        {vehicle?.brand || "Unknown brand"}
                      </span>

                      {vehicle?.color && (
                        <span className="text-xs text-slate-400">
                          {vehicle.color}
                        </span>
                      )}
                    </div>

                    {/* EDIT VEHICLE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleEditVehicle(
                          vehicle
                        )
                      }
                      className="rounded-lg border border-slate-300 p-1.5 text-slate-600 transition hover:bg-slate-100"
                      title="Edit vehicle"
                    >
                      <Edit size={14} />
                    </button>

                    {/* DELETE VEHICLE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteVehicle(
                          vehicle.id
                        )
                      }
                      className="rounded-lg border border-red-200 p-1.5 text-red-500 transition hover:bg-red-50"
                      title="Delete vehicle"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </td>

        {/* =================================================
            OWNER STATUS
        ================================================= */}

        <td className="px-4 py-4">
          <button
            type="button"
            onClick={
              handleToggleStatus
            }
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${isActive
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
          >
            {isActive
              ? "Active"
              : "Inactive"}
          </button>
        </td>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <td className="px-4 py-4">
          <div className="flex flex-wrap gap-2">

            {/* ADD VEHICLE */}

            <button
              type="button"
              onClick={
                handleAddVehicle
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={15} />
              Add Vehicle
            </button>

            {/* EDIT OWNER */}

            <button
              type="button"
              onClick={
                handleEditOwner
              }
              className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100"
              title="Edit owner"
            >
              <Edit size={16} />
            </button>

            {/* DELETE OWNER */}

            <button
              type="button"
              onClick={
                handleDeleteOwner
              }
              className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50"
              title="Delete owner"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>

      {/* =================================================
          VEHICLE DETAILS
      ================================================= */}

      {/*
      {vehicles.length > 0 && (
        <tr className="border-b border-slate-200 bg-slate-50">
          <td
            colSpan={7}
            className="px-5 py-5"
          >
            <VehicleTable
              owner={owner}
              vehicles={vehicles}
              onDeleteVehicle={
                handleDeleteVehicle
              }
              onVehicleStatusChange={
                handleVehicleStatusChange
              }
              getPlateString={
                getPlateString
              }
            />
          </td>
        </tr>
      )}
      */}
    </>
  );
}