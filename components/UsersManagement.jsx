"use client";

import { useEffect, useMemo, useState } from "react";
import useReduxUIState from "@/hooks/useReduxUIState";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import Link from "next/link";
import {
  UserPlus,
  Edit,
  Trash2,
  ShieldCheck,
  ArrowLeft,
  X,
  CheckCircle2,
  Mail,
  LockKeyhole,
  Loader2,
} from "lucide-react";

import ReusableDataTable from "./tables/ReusableDataTable";
import { BackWard } from "@/utilites/backFunc";
import {
  fetchUsers,
  updateUser,
  deleteUser,
  updateUserStatus,
  sendUserPasswordRecovery,
  selectUsers,
  selectUsersLoading,
  selectUserError,
  selectUserSubmitting,
} from "@/store/slices/usersSlice";

export default function UsersManagement() {
  const dispatch = useDispatch();

  const [roleFilter, setRoleFilter] = useReduxUIState(
    "usersManagement.roleFilter",
    "all",
  );

  /*
   * Users are now read directly from usersSlice.
   * No duplicate users collection through registrySlice.
   */
  const users = useSelector(selectUsers);
  const loadingUsers = useSelector(selectUsersLoading);
  const usersError = useSelector(selectUserError);
  const isStatusUpdating = useSelector(selectUserSubmitting);

  /* =========================================================
     MODAL STATES
  ========================================================= */

  const [isEditModalOpen, setIsEditModalOpen] = useReduxUIState(
    "usersManagement.isEditModalOpen",
    false,
  );

  const [selectedUser, setSelectedUser] = useReduxUIState(
    "usersManagement.selectedUser",
    null,
  );

  const [editForm, setEditForm] = useReduxUIState(
    "usersManagement.editForm",
    {
      username: "",
      fullName: "",
      email: "",
      phone: "",
      unitNumber: "",
      role: "",
      vehicleLimit: "",
    },
  );

  const [newPassword, setNewPassword] = useReduxUIState(
    "usersManagement.newPassword",
    "",
  );

  /*
   * Message inside the Reset Password section
   */
  const [resetMessage, setResetMessage] = useReduxUIState(
    "usersManagement.resetMessage",
    "",
  );

  const [resetMessageType, setResetMessageType] = useReduxUIState(
    "usersManagement.resetMessageType",
    "success",
  );

  /*
   * General Users Management message
   */
  const [message, setMessage] = useReduxUIState(
    "usersManagement.message",
    "",
  );

  const [messageType, setMessageType] = useReduxUIState(
    "usersManagement.messageType",
    "success",
  );

  /*
   * Local loading flags for edit modal async actions.
   */
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);

  /* =========================================================
     ROLE HELPERS
  ========================================================= */

  const isSupervisorOrRoller = (role) => {
    const normalizedRole = role?.toLowerCase();
    return (
      normalizedRole === "supervisor" ||
      normalizedRole === "roller"
    );
  };

  const isOwner = (role) => {
    return role?.toLowerCase() === "owner";
  };

  /*
   * Admin, Supervisor and Roller must always display 1.
   * Owner uses the backend vehicle limit.
   */
  const getVehicleLimit = (user) => {
    const role = user.role?.toLowerCase();
    if (
      role === "admin" ||
      role === "supervisor" ||
      role === "roller"
    ) {
      return 1;
    }
    return user.vehicleLimit ?? "—";
  };

  /* =========================================================
     LOAD USERS
  ========================================================= */

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns = useMemo(
    () => [
      {
        key: "username",
        label: "Username",
        searchable: true,
        sortable: true,
        cellClassName: "px-6 py-5",
      },
      {
        key: "role",
        label: "Role",
        searchable: true,
        sortable: true,
        cellClassName: "px-6 py-5",
      },
      {
        key: "fullName",
        label: "Full Name",
        searchable: true,
        sortable: true,
        cellClassName: "px-6 py-5",
      },
      {
        key: "unitNumber",
        label: "Unit Number",
        searchable: true,
        sortable: true,
        cellClassName: "px-6 py-5 text-gray-600",
      },
      {
        key: "status",
        label: "Status",
        searchable: true,
        sortable: true,
        cellClassName: "px-6 py-5",
      },
      {
        key: "phone",
        label: "Phone",
        searchable: true,
        sortable: true,
        cellClassName: "px-6 py-5 text-gray-600",
      },
      {
        key: "vehicleLimit",
        label: "Max Vehicles",
        searchable: false,
        sortable: true,
        cellClassName:
          "w-24 min-w-24 max-w-24 px-2 py-5 text-center",
      },
      {
        key: "actions",
        label: "Actions",
        searchable: false,
        sortable: false,
        filterable: false,
        cellClassName: "px-6 py-5",
      },
    ],
    [],
  );

  /* =========================================================
     ROLE FILTER
  ========================================================= */

  const externalFilter = useMemo(() => {
    if (roleFilter === "all") {
      return undefined;
    }
    return (user) =>
      user.role?.toLowerCase() === roleFilter.toLowerCase();
  }, [roleFilter]);

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const handleEditUser = (user) => {
    setSelectedUser(user);

    setEditForm({
      username: user.username ?? "",
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      unitNumber: user.unitNumber ?? "",
      role: user.role ?? "",
      vehicleLimit: isSupervisorOrRoller(user.role)
        ? 1
        : (user.vehicleLimit ?? ""),
    });

    setNewPassword("");
    setResetMessage("");
    setMessage("");

    setIsEditModalOpen(true);
  };

  /* =========================================================
     CLOSE EDIT MODAL
  ========================================================= */

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setNewPassword("");
    setResetMessage("");
    setMessage("");
  };

  /* =========================================================
     EDIT FORM CHANGE
  ========================================================= */

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    if (name === "role") {
      setEditForm((previous) => ({
        ...previous,
        role: value,
        vehicleLimit: isSupervisorOrRoller(value)
          ? 1
          : previous.vehicleLimit,
      }));

      setNewPassword("");
      setResetMessage("");

      return;
    }

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     SAVE EDITED USER

     PATCH /users/:id
  ========================================================= */

  const handleSaveUser = async (event) => {
    event.preventDefault();

    if (!selectedUser || isSavingUser) {
      return;
    }

    const supervisorOrRoller = isSupervisorOrRoller(
      editForm.role,
    );

    setIsSavingUser(true);
    setMessage("");

    try {
      await dispatch(
        updateUser({
          id: selectedUser.id,
          form: {
            ...editForm,
            vehicleLimit: supervisorOrRoller
              ? 1
              : editForm.vehicleLimit,
          },
        }),
      ).unwrap();

      setMessageType("success");
      setMessage("User data has been updated successfully.");

      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      setMessageType("error");
      setMessage(
        typeof error === "string"
          ? error
          : "Failed to update user.",
      );
    } finally {
      setIsSavingUser(false);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  /* =========================================================
     DELETE USER

     DELETE /users/:id
  ========================================================= */

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete user?",
      text: `Are you sure you want to delete ${user.fullName}?`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await dispatch(deleteUser(user.id)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "User has been deleted successfully.",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          typeof error === "string"
            ? error
            : "Failed to delete user.",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  /* =========================================================
     CHANGE STATUS

     PATCH /users/:id/disable
  ========================================================= */

  const handleStatusChange = async (user, status) => {
    const isActive = status === "Active";

    try {
      await dispatch(
        updateUserStatus({
          id: user.id,
          isActive,
        }),
      ).unwrap();
    } catch (error) {
      setMessageType("error");
      setMessage(
        typeof error === "string"
          ? error
          : "Failed to update user status.",
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  /* =========================================================
     OWNER RESET PASSWORD
  ========================================================= */

  const handleTriggerEmailReset = async () => {
    if (!selectedUser?.id || isSendingRecovery) {
      return;
    }

    if (!selectedUser.email) {
      setResetMessageType("error");
      setResetMessage("This owner does not have a saved email address.");
      return;
    }

    setIsSendingRecovery(true);
    setResetMessage("");

    try {
      await dispatch(sendUserPasswordRecovery(selectedUser.id)).unwrap();
      setResetMessageType("success");
      setResetMessage("Password recovery message sent successfully.");
    } catch (error) {
      setResetMessageType("error");
      setResetMessage(
        typeof error === "string"
          ? error
          : "Failed to send password recovery message.",
      );
    } finally {
      setIsSendingRecovery(false);
    }
  };

  /* =========================================================
     SUPERVISOR / ROLLER / ADMIN RESET PASSWORD

     PATCH /users/:id
  ========================================================= */

  const handleSaveNewPassword = async () => {
    if (!selectedUser || isSavingPassword) {
      return;
    }

    const password = newPassword.trim();

    if (!password) {
      setResetMessageType("error");
      setResetMessage("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setResetMessageType("error");
      setResetMessage(
        "Password must contain at least 6 characters.",
      );
      return;
    }

    setIsSavingPassword(true);

    try {
      await dispatch(
        updateUser({
          id: selectedUser.id,
          form: {
            ...editForm,
            password,
          },
        }),
      ).unwrap();

      setResetMessageType("success");
      setResetMessage(
        "New password has been saved successfully.",
      );

      setNewPassword("");
    } catch (error) {
      setResetMessageType("error");
      setResetMessage(
        typeof error === "string"
          ? error
          : "Failed to save new password.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  /* =========================================================
     CELL RENDERER
  ========================================================= */

  const renderCell = (user, column) => {
    if (column.key === "username") {
      return (
        <span className="font-semibold text-gray-800">
          {user.username}
        </span>
      );
    }

    if (column.key === "role") {
      return (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            user.role === "Owner"
              ? "bg-blue-100 text-blue-700"
              : user.role === "Supervisor"
                ? "bg-orange-100 text-orange-700"
                : user.role === "Admin"
                  ? "bg-red-100 text-red-700"
                  : "bg-purple-100 text-purple-700"
          }`}
        >
          {user.role}
        </span>
      );
    }

    if (column.key === "fullName") {
      return (
        <div>
          <p className="font-semibold text-gray-800">
            {user.fullName}
          </p>

          {!isSupervisorOrRoller(user.role) && (
            <p className="mt-1 text-sm text-gray-500">
              {user.email}
            </p>
          )}
        </div>
      );
    }

    if (column.key === "unitNumber") {
      if (isSupervisorOrRoller(user.role)) {
        return null;
      }

      return user.unitNumber ?? "—";
    }

    if (column.key === "status") {
      const nextStatus =
        user.status === "Active" ? "Inactive" : "Active";
      const isUpdating = isStatusUpdating;

      return (
        <button
          type="button"
          onClick={() => handleStatusChange(user, nextStatus)}
          disabled={isUpdating}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            user.status === "Active"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {isUpdating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <span
              className={`h-2 w-2 rounded-full ${
                user.status === "Active"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />
          )}

          {isUpdating ? "Updating..." : user.status}
        </button>
      );
    }

    if (column.key === "phone") {
      return user.phone;
    }

    if (column.key === "vehicleLimit") {
      return (
        <div className="flex w-24 min-w-24 max-w-24 justify-center">
          <span className="font-medium text-gray-700">
            {getVehicleLimit(user)}
          </span>
        </div>
      );
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleEditUser(user)}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-100"
            title="Edit User"
          >
            <Edit size={19} />
          </button>

          <button
            type="button"
            onClick={() => handleDeleteUser(user)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-100"
            title="Delete User"
          >
            <Trash2 size={19} />
          </button>
        </div>
      );
    }

    return user?.[column.key] ?? "—";
  };

  /* =========================================================
     CURRENT EDIT ROLE
  ========================================================= */

  const currentEditRole = editForm.role?.toLowerCase();

  const currentIsOwner = currentEditRole === "owner";

  const currentIsSupervisorOrRoller =
    currentEditRole === "supervisor" ||
    currentEditRole === "roller";

  const currentCanSetNewPassword =
    currentEditRole === "admin" ||
    currentEditRole === "supervisor" ||
    currentEditRole === "roller";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-200 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={BackWard}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold text-gray-800">
              Users Management
            </h1>

            <p className="mt-1 text-gray-500">
              View and manage all users registered in the system.
            </p>
          </div>

          <Link
            href="/admin/users/registration"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
          >
            <UserPlus size={20} />
            Add User
          </Link>
        </div>

        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border px-5 py-4 ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <X size={20} />
            )}

            <span className="font-medium">{message}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div className="p-6">
            {usersError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {usersError}
              </div>
            )}

            {loadingUsers && !usersError && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Loading users...
              </div>
            )}

            <ReusableDataTable
              data={users}
              columns={columns}
              renderCell={renderCell}
              rowKey="id"
              externalFilter={externalFilter}
              searchKeys={[
                "username",
                "fullName",
                "email",
                "phone",
                "unitNumber",
                "role",
                "status",
              ]}
              initialSortField="username"
              initialSortDirection="asc"
              maxVisibleRows={3}
              searchPlaceholder="Search by username, name, phone, unit, role or status..."
              emptyMessage="No users found."
              minWidth="min-w-[950px]"
              title="System Users"
              titleIcon={ShieldCheck}
              showResultCount={true}
              resultCountLabel="user"
              showSearch={true}
              showSort={true}
              showColumnVisibility={true}
              showExpandButton={true}
            />
          </div>
        </div>
      </div>

      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Edit User
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update the user&apos;s information and password.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEditModal}
                className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="mx-6 mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                    <LockKeyhole size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800">
                      Reset Password
                    </h3>

                    <p className="text-sm text-gray-500">
                      Password reset options depend on the selected role.
                    </p>
                  </div>
                </div>

                {currentIsOwner && (
                  <div>
                    <button
                      type="button"
                      onClick={handleTriggerEmailReset}
                      disabled={isSendingRecovery || !selectedUser.email}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingRecovery ? (
                        <Loader2 size={19} className="animate-spin" />
                      ) : (
                        <Mail size={19} />
                      )}
                      {isSendingRecovery ? "Sending..." : "Send recovery"}
                    </button>

                    <p className="mt-3 text-sm text-gray-500">
                      An email password-reset link will be sent to:
                    </p>

                    <p className="mt-1 font-semibold text-gray-700">
                      {selectedUser.email || "No saved email address"}
                    </p>

                    {resetMessage && (
                      <div
                        className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 ${
                          resetMessageType === "success"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {resetMessageType === "success" ? (
                          <CheckCircle2 size={19} />
                        ) : (
                          <X size={19} />
                        )}

                        <span className="font-medium">{resetMessage}</span>
                      </div>
                    )}
                  </div>
                )}

                {currentCanSetNewPassword && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                      >
                        New Password
                      </label>

                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                      <p className="mt-2 text-xs text-gray-500">
                        Password must contain at least 6 characters.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveNewPassword}
                      disabled={isSavingPassword}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LockKeyhole size={19} />

                      {isSavingPassword ? "Saving..." : "Save New Password"}
                    </button>

                    {resetMessage && (
                      <div
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                          resetMessageType === "success"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {resetMessageType === "success" ? (
                          <CheckCircle2 size={19} />
                        ) : (
                          <X size={19} />
                        )}

                        <span className="font-medium">{resetMessage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {!currentIsSupervisorOrRoller && (
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Email
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Phone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    placeholder="XXXX......."
                    maxLength={11}
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {!currentIsSupervisorOrRoller && (
                  <div>
                    <label
                      htmlFor="unitNumber"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Unit Number
                    </label>

                    <input
                      id="unitNumber"
                      name="unitNumber"
                      value={editForm.unitNumber}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Role
                  </label>

                  <select
                    id="role"
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Roller">Roller</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="vehicleLimit"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Max Vehicles
                  </label>

                  {currentIsSupervisorOrRoller ? (
                    <input
                      id="vehicleLimit"
                      type="number"
                      value={1}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-gray-500 outline-none"
                    />
                  ) : (
                    <input
                      id="vehicleLimit"
                      type="number"
                      min="0"
                      name="vehicleLimit"
                      value={editForm.vehicleLimit}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingUser ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}