// components/owner-registration/OwnersTable.jsx

"use client";

import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

import { useDispatch } from "react-redux";

import {
  setOwnerSearch,
  setOwnerSort,
} from "@/store/slices/ownerRegistrationSlice";

import OwnerTableRow from "./OwnerTableRow";
import EditVehicleModal from "./EditVehicleModal";

function SortableHeader({
  label,
  column,
  sortConfig,
  onSort,
}) {
  const isActive =
    sortConfig.key === column;

  return (
    <th className="px-4 py-3 text-left">
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:text-blue-600"
      >
        <span>{label}</span>

        {!isActive && (
          <ArrowUpDown size={15} />
        )}

        {isActive &&
          (sortConfig.direction === "asc" ? (
            <ChevronUp size={15} />
          ) : (
            <ChevronDown size={15} />
          ))}
      </button>
    </th>
  );
}

export default function OwnersTable({
  owners = [],
  search,
  sortConfig,
  getPlateString,
  loading = false,
}) {
  const dispatch = useDispatch();

  const query = search.trim().toLowerCase();

  const filteredOwners = owners.filter((owner) => {
    if (!query) {
      return true;
    }

    const fullName =
      `${owner.firstName || ""} ${owner.lastName || ""}`
        .toLowerCase();

    const vehiclesText = (owner.vehicles || [])
      .map(
        (vehicle) =>
          `${vehicle.plateLetters?.join(" ") || ""} ${
            vehicle.plateNumbers || ""
          } ${vehicle.brand || ""} ${
            vehicle.model || ""
          } ${vehicle.color || ""}`
      )
      .join(" ")
      .toLowerCase();

    return (
      fullName.includes(query) ||
      String(owner.email || "")
        .toLowerCase()
        .includes(query) ||
      String(owner.phone || "")
        .toLowerCase()
        .includes(query) ||
      String(
        owner.unitCode ||
          owner.unitCode ||
          ""
      )
        .toLowerCase()
        .includes(query) ||
      vehiclesText.includes(query)
    );
  });

  const sortedOwners = [...filteredOwners].sort(
    (a, b) => {
      const { key, direction } = sortConfig;

      if (!key) {
        return 0;
      }

      let first = "";
      let second = "";

      switch (key) {
        case "name":
          first = `${a.firstName || ""} ${
            a.lastName || ""
          }`;
          second = `${b.firstName || ""} ${
            b.lastName || ""
          }`;
          break;

        case "email":
          first = a.email || "";
          second = b.email || "";
          break;

           case "username":
          first = a.username || "";
          second = b.username || "";
          break;

        case "phone":
          first = a.phone || "";
          second = b.phone || "";
          break;

        case "unitCode":
          first =
            a.unitCode ||
            a.unitCode ||
            "";
          second =
            b.unitCode ||
            b.unitCode ||
            "";
          break;

        case "status":
          first = a.active
            ? "active"
            : "inactive";
          second = b.active
            ? "active"
            : "inactive";
          break;

        default:
          return 0;
      }

      first = String(first).toLowerCase();
      second = String(second).toLowerCase();

      const result = first.localeCompare(
        second,
        undefined,
        {
          numeric: true,
        }
      );

      return direction === "asc"
        ? result
        : -result;
    }
  );

  return (
    <>
      {/* SEARCH */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              dispatch(
                setOwnerSearch(
                  event.target.value
                )
              )
            }
            placeholder="Search by name, email, phone, unit, plate, brand or color..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">
            Registered Owners
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {sortedOwners.length} owner
            {sortedOwners.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-14 text-center text-sm text-slate-500">
            Loading registered owners...
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-362.5 w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <SortableHeader
                    label="Owner"
                    column="name"
                    sortConfig={sortConfig}
                    onSort={(column) =>
                      dispatch(
                        setOwnerSort(column)
                      )
                    }
                  />

                  <SortableHeader
                    label="Email"
                    column="email"
                    sortConfig={sortConfig}
                    onSort={(column) =>
                      dispatch(
                        setOwnerSort(column)
                      )
                    }
                  />

                  
                  <SortableHeader
                    label="Username"
                    column="username"
                    sortConfig={sortConfig}
                    onSort={(column) =>
                      dispatch(
                        setOwnerSort(column)
                      )
                    }
                  />

                  <SortableHeader
                    label="Phone"
                    column="phone"
                    sortConfig={sortConfig}
                    onSort={(column) =>
                      dispatch(
                        setOwnerSort(column)
                      )
                    }
                  />

                  <SortableHeader
                    label="Unit"
                    column="unitCode"
                    sortConfig={sortConfig}
                    onSort={(column) =>
                      dispatch(
                        setOwnerSort(column)
                      )
                    }
                  />

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Vehicles
                  </th>

                  <SortableHeader
                    label="Status"
                    column="status"
                    sortConfig={sortConfig}
                    onSort={(column) =>
                      dispatch(
                        setOwnerSort(column)
                      )
                    }
                  />

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedOwners.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-14 text-center"
                    >
                      <div className="text-sm font-medium text-slate-600">
                        No owners found
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        Register an owner or change your search.
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedOwners.map((owner) => (
                    <OwnerTableRow
                      key={owner.id}
                      owner={owner}
                      getPlateString={
                        getPlateString
                      }
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/*
        Rendered ONCE for the whole table, not per row.
        It's fully Redux-driven (openEditVehicle / closeVehicleForm),
        so it only needs a single mount point regardless of which
        row's "Edit vehicle" button triggered it.
      */}
      <EditVehicleModal />
    </>
  );
}