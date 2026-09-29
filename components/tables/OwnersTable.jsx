"use client";

import {
  Car,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

const STATUS_STYLES = {
  pending:
    "bg-amber-100 text-amber-700",

  approved:
    "bg-green-100 text-green-700",

  rejected:
    "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  const style =
    STATUS_STYLES[status] ||
    "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style}`}
    >
      {status || "pending"}
    </span>
  );
}

function VehicleRow({
  owner,
  vehicle,
  onEditVehicle,
  onDeleteVehicle,
  onStatusChange,
}) {
  const plate = [
    ...(vehicle.plateLetters || []).filter(
      Boolean,
    ),

    vehicle.plateNumbers,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
          <Car size={16} />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            {vehicle.model ||
              vehicle.brand ||
              "Unnamed vehicle"}
          </p>

          <p className="text-xs text-gray-500">
            {plate || "No plate"}

            {vehicle.color
              ? ` · ${vehicle.color}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={
            vehicle.status ||
            "pending"
          }
          onChange={(event) =>
            onStatusChange(
              owner.id,
              vehicle.id,
              event.target.value,
            )
          }
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 focus:border-blue-400 focus:outline-none"
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

        <StatusBadge
          status={vehicle.status}
        />

        <button
          type="button"
          onClick={() =>
            onEditVehicle(
              owner,
              vehicle,
            )
          }
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white hover:text-blue-600"
          aria-label="Edit vehicle"
        >
          <Pencil size={14} />
        </button>

        <button
          type="button"
          onClick={() =>
            onDeleteVehicle(
              owner.id,
              vehicle.id,
            )
          }
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white hover:text-red-600"
          aria-label="Delete vehicle"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function OwnerCard({
  owner,
  onAddVehicle,
  onEditOwner,
  onDeleteOwner,
  onEditVehicle,
  onDeleteVehicle,
  onStatusChange,
}) {
  const vehicleCount =
    Array.isArray(owner.vehicles)
      ? owner.vehicles.length
      : 0;

  const vehicleLimit =
    Number(owner.vehicleLimit || 0);

  const atLimit =
    vehicleCount >= vehicleLimit;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-800">
              {owner.firstName}{" "}
              {owner.lastName}
            </h3>

            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
              Unit{" "}
              {owner.unitNumber || "—"}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {owner.email ||
              "No email"}

            {owner.phone
              ? ` · ${owner.phone}`
              : ""}

          </p>

          <p className="mt-1 text-xs font-medium text-gray-400">
            {vehicleCount} /{" "}
            {vehicleLimit} vehicles
            registered
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onAddVehicle(owner)
            }
            disabled={atLimit}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Plus size={14} />
            Add Vehicle
          </button>

          <button
            type="button"
            onClick={() =>
              onEditOwner(owner)
            }
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
            aria-label="Edit owner"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() =>
              onDeleteOwner(
                owner.id,
              )
            }
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-red-600"
            aria-label="Delete owner"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {vehicleCount > 0 && (
        <div className="mt-4 space-y-2">
          {owner.vehicles.map(
            (vehicle) => (
              <VehicleRow
                key={vehicle.id}
                owner={owner}
                vehicle={vehicle}
                onEditVehicle={
                  onEditVehicle
                }
                onDeleteVehicle={
                  onDeleteVehicle
                }
                onStatusChange={
                  onStatusChange
                }
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default function OwnersTable({
  owners,
  search,
  onSearchChange,
  onAddVehicle,
  onEditOwner,
  onDeleteOwner,
  onEditVehicle,
  onDeleteVehicle,
  onStatusChange,
}) {
  const query = (search || "")
    .trim()
    .toLowerCase();

  const filteredOwners = query
    ? owners.filter((owner) => {
        const haystack = [
          owner.firstName,
          owner.lastName,
          owner.unitNumber,
          owner.email,
          owner.phone,
          owner.username,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(
          query,
        );
      })
    : owners;

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
      <div className="border-b border-gray-100 p-5">
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Search owners by name, unit, email..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-blue-400 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-4 p-5">
        {filteredOwners.length ===
        0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-gray-500">
              {owners.length === 0
                ? "No owners registered yet."
                : "No owners match your search."}
            </p>
          </div>
        ) : (
          filteredOwners.map(
            (owner) => (
              <OwnerCard
                key={owner.id}
                owner={owner}
                onAddVehicle={
                  onAddVehicle
                }
                onEditOwner={
                  onEditOwner
                }
                onDeleteOwner={
                  onDeleteOwner
                }
                onEditVehicle={
                  onEditVehicle
                }
                onDeleteVehicle={
                  onDeleteVehicle
                }
                onStatusChange={
                  onStatusChange
                }
              />
            ),
          )
        )}
      </div>
    </div>
  );
}