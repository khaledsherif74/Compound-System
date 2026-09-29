"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from 'sweetalert2';
import RollerSupervisorEmployeeForm from "./RollerSupervisorEmployeeForm";
import RollerSupervisorEmployeeTable from "./RollerSupervisorEmployeeTable";

import {
  INITIAL_EMPLOYEE_FORM,
  normalizeEmployeeField,
  validateEmployeeField,
  validateEmployeeForm,
} from "./rollerSupervisorEmployeeValidation";

import api from "@/Services/api";

import {
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
} from "@/store/slices/rollerSupervisorEmployeeSlice";

export default function RollerSupervisorEmployee() {
  const router = useRouter();
  const dispatch = useDispatch();

  // =========================================================
  // REDUX STATE
  // =========================================================

  const {
    employees,
    loadingEmployees,
    employeesError,
    form,
    errors,
    editingId,
    successMessage,
    showPassword,
    submitting,
  } = useSelector((state) => state.rollerSupervisorEmployee);

  // =========================================================
  // GET SUPERVISORS
  // =========================================================

  const fetchEmployees = async (showLoading = false) => {
    try {
      if (showLoading) {
        dispatch(setLoadingEmployees(true));
      }

      dispatch(setEmployeesError(""));

      const response = await api.get("/users");

      console.log("Users API response:", response.data);

      // =====================================================
      // EXTRACT USERS
      // =====================================================

      let users = [];

      if (Array.isArray(response.data?.data?.users)) {
        users = response.data.data.users;
      } else if (Array.isArray(response.data?.data)) {
        users = response.data.data;
      } else if (Array.isArray(response.data?.users)) {
        users = response.data.users;
      } else if (Array.isArray(response.data)) {
        users = response.data;
      }

      console.log("All users:", users);

      // =====================================================
      // ONLY SUPERVISORS
      // =====================================================

      const supervisors = users.filter(
        (user) => String(user.role ?? "").toUpperCase() === "SUPERVISOR",
      );

      console.log("Supervisor employees:", supervisors);

      dispatch(setEmployees(supervisors));
    } catch (error) {
      console.error("Failed to fetch supervisors:", error);

      console.error("API error response:", error.response?.data);

      dispatch(setEmployees([]));

      dispatch(
        setEmployeesError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to load supervisor employees.",
        ),
      );
    } finally {
      if (showLoading) {
        dispatch(setLoadingEmployees(false));
      }
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      try {
        dispatch(setLoadingEmployees(true));

        dispatch(setEmployeesError(""));

        const response = await api.get("/users");

        if (cancelled) {
          return;
        }

        console.log("Users API response:", response.data);

        // ===================================================
        // EXTRACT USERS
        // ===================================================

        let users = [];

        if (Array.isArray(response.data?.data?.users)) {
          users = response.data.data.users;
        } else if (Array.isArray(response.data?.data)) {
          users = response.data.data;
        } else if (Array.isArray(response.data?.users)) {
          users = response.data.users;
        } else if (Array.isArray(response.data)) {
          users = response.data;
        }

        console.log("All users:", users);

        // ===================================================
        // FILTER SUPERVISORS
        // ===================================================

        const supervisors = users.filter(
          (user) => String(user.role ?? "").toUpperCase() === "SUPERVISOR",
        );

        console.log("Supervisor employees:", supervisors);

        dispatch(setEmployees(supervisors));

        dispatch(setEmployeesError(""));
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to fetch supervisors:", error);

        console.error("API error response:", error.response?.data);

        dispatch(setEmployees([]));

        dispatch(
          setEmployeesError(
            error.response?.data?.message ||
              error.response?.data?.error ||
              "Failed to load supervisor employees.",
          ),
        );
      } finally {
        if (!cancelled) {
          dispatch(setLoadingEmployees(false));
        }
      }
    };

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    dispatch(resetEmployeeForm());
  };

  // =========================================================
  // CLEAR SUCCESS MESSAGE
  // =========================================================

  const clearSuccessMessageHandler = () => {
    if (successMessage) {
      dispatch(clearSuccessMessage());
    }
  };

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    const newValue = normalizeEmployeeField(name, value);

    dispatch(
      updateFormField({
        name,
        value: newValue,
      }),
    );

    const error = validateEmployeeField(name, newValue, editingId);

    dispatch(
      updateFieldError({
        name,
        error,
      }),
    );

    clearSuccessMessageHandler();
  };

  // =========================================================
  // EDIT EMPLOYEE
  // =========================================================

  const handleEdit = (employee) => {
    dispatch(setEditingId(employee.id));

    const identifier =
      employee.username ?? employee.email ?? employee.employeeId ?? "";

    dispatch(
      setForm({
        firstName: employee.firstName ?? "",

        lastName: employee.lastName ?? "",

        phone: employee.phone ?? "",

        email: String(identifier),

        password: "",
      }),
    );

    dispatch(setErrors({}));
    dispatch(setSuccessMessage(""));
    dispatch(setShowPassword(false));

    window.setTimeout(() => {
      document.querySelector("#employee-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // =========================================================
  // CANCEL EDITING
  // =========================================================

  const handleCancel = () => {
    resetForm();

    dispatch(setSuccessMessage(""));
  };

  // =========================================================
  // TOGGLE EMPLOYEE STATUS
  // =========================================================

  const handleToggleActive = async (id) => {
    const employee = employees.find((item) => item.id === id);

    if (!employee) {
      console.error("Employee not found:", id);

      return;
    }

    const currentIsActive = employee.isActive === true;

    const newIsActive = !currentIsActive;

    console.log("=================================");

    console.log("Employee ID:", id);

    console.log("Current isActive:", currentIsActive);

    console.log("New isActive:", newIsActive);

    console.log("Request:", {
      isActive: newIsActive,
    });

    try {
      dispatch(setEmployeesError(""));

      // =====================================================
      // SEND REQUEST TO BACKEND
      // =====================================================

      const response = await api.patch(`/users/${id}/disable`, {
        isActive: newIsActive,
      });

      console.log("Disable API response:", response.data);

      // =====================================================
      // UPDATE REDUX STATE
      // =====================================================

      dispatch(
        updateEmployeeStatus({
          id,
          isActive: newIsActive,
        }),
      );

      // =====================================================
      // SUCCESS MESSAGE
      // =====================================================

      const employeeName = `${employee.firstName ?? ""} ${
        employee.lastName ?? ""
      }`.trim();

      dispatch(
        setSuccessMessage(
          `${employeeName || "Employee"} is now ${
            newIsActive ? "active" : "inactive"
          }.`,
        ),
      );
    } catch (error) {
      console.error("Failed to update employee status:", error);

      console.error("Status:", error.response?.status);

      console.error("API error response:", error.response?.data);

      dispatch(
        setEmployeesError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to update employee status.",
        ),
      );
    }
  };

  // =========================================================
  // SUBMIT FORM
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    dispatch(setSuccessMessage(""));
    dispatch(setEmployeesError(""));

    // =====================================================
    // VALIDATION
    // =====================================================

    const validationErrors = validateEmployeeForm(form, employees, editingId);

    dispatch(setErrors(validationErrors));

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      dispatch(setSubmitting(true));

      // ===================================================
      // NORMALIZE VALUES
      // ===================================================

      const firstName = form.firstName.trim();

      const lastName = form.lastName.trim();

      const phone = form.phone.trim();

      /*
       * IMPORTANT:
       *
       * Your form calls this field "email",
       * but the backend expects "username".
       */

      const username = form.email.trim();

      // ===================================================
      // UPDATE SUPERVISOR
      // ===================================================

      if (editingId) {
        const updateData = {
          firstName,
          lastName,
          phone,
          username,
          role: "SUPERVISOR",
        };

        /*
         * Password is optional when editing.
         */

        if (form.password.trim()) {
          updateData.password = form.password;
        }

        console.log("Updating supervisor:", editingId);

        console.log("Update data:", updateData);

        await api.patch(`/users/${editingId}`, updateData);

        dispatch(setSuccessMessage("Supervisor updated successfully."));
      }

      // ===================================================
      // CREATE SUPERVISOR
      // ===================================================
      else {
        const createData = {
          firstName,
          lastName,
          phone,
          password: form.password,
          username,
          role: "SUPERVISOR",
        };

        console.log("Creating supervisor:");

        console.log("Create data:", createData);

        await api.post("/users", createData);

        dispatch(setSuccessMessage("Supervisor added successfully."));
      }

      // ===================================================
      // RELOAD REAL DATA
      // ===================================================

      await fetchEmployees();

      // ===================================================
      // RESET FORM
      // ===================================================

      resetForm();
    } catch (error) {
      console.error("Failed to save supervisor:", error);

      console.error("API error response:", error.response?.data);

      dispatch(
        setEmployeesError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to save supervisor.",
        ),
      );
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  // =========================================================
  // DELETE EMPLOYEE
  // =========================================================

  const handleDelete = async (id) => {
    const employee = employees.find((item) => item.id === id);

    if (!employee) {
      return;
    }

   const result = await Swal.fire({
  title: "Are you sure?",
  text: `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`,
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Yes, delete it",
  cancelButtonText: "Cancel",
  confirmButtonColor: "#dc2626",
  cancelButtonColor: "#6b7280",
});

const confirmed = result.isConfirmed;

    if (!confirmed) {
      return;
    }

    try {
      dispatch(setEmployeesError(""));

      console.log("Deleting supervisor:", id);

      await api.delete(`/users/${id}`);

      dispatch(setSuccessMessage("Supervisor deleted successfully."));

      // ===================================================
      // RELOAD REAL DATA
      // ===================================================

      await fetchEmployees();

      // ===================================================
      // RESET IF EDITING DELETED USER
      // ===================================================

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Failed to delete supervisor:", error);

      console.error("API error response:", error.response?.data);

      dispatch(
        setEmployeesError(
          error.response?.data?.message || "Failed to delete supervisor.",
        ),
      );

      // ===================================================
      // RESTORE REAL DATA
      // ===================================================

      await fetchEmployees();
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-200 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* ===================================================
            BACK BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={() => router.push("/roller")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Roller Dashboard
        </button>

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Supervisor Employees
          </h1>

          <p className="mt-1 text-gray-500">
            Register and manage supervisors staff.
          </p>
        </div>

        {/* ===================================================
            ERROR MESSAGE
        =================================================== */}

        {employeesError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {employeesError}
          </div>
        )}

        {/* ===================================================
            MAIN LAYOUT
        =================================================== */}

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* =================================================
              FORM
          ================================================= */}

          <RollerSupervisorEmployeeForm
            form={form}
            errors={errors}
            editingId={editingId}
            successMessage={successMessage}
            showPassword={showPassword}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onTogglePassword={() => dispatch(toggleShowPassword())}
            submitting={submitting}
          />

          {/* =================================================
              TABLE
          ================================================= */}

          {loadingEmployees ? (
            <div className="flex min-h-75 items-center justify-center rounded-3xl bg-white shadow-lg">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                <p className="mt-4 font-medium text-gray-500">
                  Loading supervisor employees...
                </p>
              </div>
            </div>
          ) : (
            <RollerSupervisorEmployeeTable
              employees={employees}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          )}
        </div>
      </div>
    </div>
  );
}