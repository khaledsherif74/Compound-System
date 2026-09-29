"use client";

import {
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

import { useSelector } from "react-redux";

import ReusableDataTable from "@/components/tables/ReusableDataTable";

import RollerSupervisorEmployeeStatus from "./RollerSupervisorEmployeeStatus";

const EMPLOYEE_COLUMNS = [
  {
    key: "name",
    label: "Name",
    searchable: true,
    sortable: true,
    cellClassName:
      "px-6 py-5 font-semibold text-gray-800",
  },

  {
    key: "email",
    label: "Email / ID / Username",
    searchable: true,
    sortable: true,
    cellClassName:
      "px-6 py-5 text-gray-600",
  },

  {
    key: "phone",
    label: "Phone",
    searchable: true,
    sortable: true,
    cellClassName:
      "px-6 py-5 text-gray-600",
  },

  {
    key: "isActive",
    label: "Status",
    searchable: true,
    sortable: true,
    cellClassName: "px-6 py-5",
  },

  {
    key: "actions",
    label: "Actions",
    searchable: false,
    sortable: false,
    cellClassName: "px-6 py-5",
  },
];

export default function RollerSupervisorEmployeeTable({
  onEdit,
  onDelete,
  onToggleActive,
}) {
  const employees = useSelector(
    (state) =>
      state.rollerSupervisorEmployee
        ?.employees || []
  );

  /*
   * ============================================================
   * NORMALIZE EMPLOYEE DATA
   * ============================================================
   */

  const tableData = employees.map(
    (employee) => {
      const firstName =
        employee?.firstName ?? "";

      const lastName =
        employee?.lastName ?? "";

      const fullName =
        `${firstName} ${lastName}`.trim() ||
        "—";

      const identifier =
        employee?.username ??
        employee?.email ??
        employee?.employeeId ??
        employee?.id ??
        "";

      const isActive =
        employee?.isActive ?? true;

      return {
        ...employee,

        id: employee?.id,

        firstName,

        lastName,

        name: fullName,

        email:
          employee?.email ?? "",

        username:
          employee?.username ?? "",

        employeeId:
          employee?.employeeId ?? "",

        identifier,

        phone:
          employee?.phone ?? "",

        isActive: Boolean(isActive),
      };
    }
  );

  /*
   * ============================================================
   * RENDER CELL
   * ============================================================
   */

  const renderCell = (
    employee,
    column
  ) => {
    switch (column.key) {
      /*
       * ========================================================
       * NAME
       * ========================================================
       */

      case "name":
        return (
          employee.name || "—"
        );

      /*
       * ========================================================
       * EMAIL / ID / USERNAME
       * ========================================================
       */

      case "email":
        return (
          employee.username ||
          employee.email ||
          employee.employeeId ||
          employee.id ||
          "—"
        );

      /*
       * ========================================================
       * PHONE
       * ========================================================
       */

      case "phone":
        return (
          employee.phone || "—"
        );

      /*
       * ========================================================
       * STATUS
       * ========================================================
       */

      case "isActive":
        return (
          <RollerSupervisorEmployeeStatus
            active={employee.isActive}
            employeeName={
              employee.name
            }
            onToggle={() => {
              if (!employee.id) {
                console.error(
                  "Cannot change employee status: employee ID is missing."
                );

                return;
              }

              if (
                typeof onToggleActive !==
                "function"
              ) {
                console.error(
                  "onToggleActive was not provided to RollerSupervisorEmployeeTable."
                );

                return;
              }

              onToggleActive(
                employee.id
              );
            }}
          />
        );

      /*
       * ========================================================
       * ACTIONS
       * ========================================================
       */

      case "actions":
        return (
          <div className="flex items-center gap-2">

            {/* ==================================================
                EDIT
                ================================================== */}

            <button
              type="button"
              onClick={() => {
                if (!employee.id) {
                  console.error(
                    "Cannot edit employee: employee ID is missing."
                  );

                  return;
                }

                if (
                  typeof onEdit !==
                  "function"
                ) {
                  console.error(
                    "onEdit was not provided to RollerSupervisorEmployeeTable."
                  );

                  return;
                }

                onEdit(employee);
              }}
              aria-label={`Edit ${employee.name}`}
              title="Edit employee"
              className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
            >
              <Pencil size={18} />
            </button>

            {/* ==================================================
                DELETE
                ================================================== */}

            <button
              type="button"
              onClick={() => {
                if (!employee.id) {
                  console.error(
                    "Cannot delete employee: employee ID is missing."
                  );

                  return;
                }

                if (
                  typeof onDelete !==
                  "function"
                ) {
                  console.error(
                    "onDelete was not provided to RollerSupervisorEmployeeTable."
                  );

                  return;
                }

                onDelete(
                  employee.id
                );
              }}
              aria-label={`Delete ${employee.name}`}
              title="Delete employee"
              className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );

      /*
       * ========================================================
       * DEFAULT
       * ========================================================
       */

      default:
        return "—";
    }
  };

  /*
   * ============================================================
   * TABLE
   * ============================================================
   */

  return (
    <div className="overflow-hidden rounded-3xl bg-white p-5 shadow-lg">
      <ReusableDataTable
        data={tableData}
        columns={EMPLOYEE_COLUMNS}
        renderCell={renderCell}
        rowKey="id"
        searchKeys={[
          "name",
          "email",
          "username",
          "employeeId",
          "phone",
        ]}
        title="Supervisors Employees"
        titleIcon={Search}
        searchPlaceholder="Search name, email, ID, username or phone..."
        emptyMessage="No employees found. Try another search."
        resultCountLabel="registered employee"
        showSearch
        showSort
        showColumnVisibility={false}
        showExpandButton={false}
        maxVisibleRows={Math.max(
          tableData.length,
          1
        )}
        minWidth="min-w-[850px]"
      />
    </div>
  );
}