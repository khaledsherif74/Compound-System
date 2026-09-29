"use client";

import {
  Edit,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";

import {
  openEditVehicle,
  deleteVehicleLocal,
  setVehicleStatus,
} from "@/store/slices/ownerRegistrationSlice";

export default function VehicleTable({
  owner,
  vehicles = [],
  getPlateString,
}) {
  const dispatch =
    useDispatch();

  if (!vehicles.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
        <p className="text-sm font-medium text-slate-600">
          No vehicles registered.
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Click Add Vehicle to register a vehicle for this owner.
        </p>
      </div>
    );
  }

async function handleDelete(vehicleId) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You are about to delete this vehicle.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
  });

  if (!result.isConfirmed) {
    return;
  }

  dispatch(
    deleteVehicleLocal({
      ownerId: owner.id,
      vehicleId,
    })
  );
}

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-225 w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Brand
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Color
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Plate
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              License
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Status
            </th>

            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {vehicles.map(
            (vehicle) => (
              <tr
                key={
                  vehicle.id
                }
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-700">
                  {vehicle.brand ||
                    vehicle.model ||
                    "-"}
                </td>

                <td className="px-4 py-3 text-sm capitalize text-slate-600">
                  {vehicle.color ||
                    "-"}
                </td>

                <td className="px-4 py-3">
                  <span
                    dir="rtl"
                    className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold tracking-wide text-slate-700"
                  >
                    {getPlateString(
                      vehicle
                    )}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm text-slate-600">
                  {vehicle
                    .licenseFile
                    ?.name ||
                    vehicle.licenseFileName ||
                    "Uploaded"}
                </td>

                <td className="px-4 py-3">
                  <select
                    value={
                      vehicle.status ||
                      "pending"
                    }
                    onChange={(
                      event
                    ) =>
                      dispatch(
                        setVehicleStatus(
                          {
                            ownerId:
                              owner.id,
                            vehicleId:
                              vehicle.id,
                            status:
                              event
                                .target
                                .value,
                          }
                        )
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="approved">
                      Approved
                    </option>

                    <option value="rejected">
                      Rejected
                    </option>
                  </select>
                </td>

                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          openEditVehicle(
                            {
                              ownerId:
                                owner.id,
                              vehicle,
                            }
                          )
                        )
                      }
                      className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100"
                      title="Edit vehicle"
                    >
                      <Edit
                        size={16}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          vehicle.id
                        )
                      }
                      className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50"
                      title="Delete vehicle"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}