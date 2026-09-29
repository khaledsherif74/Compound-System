"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";

import {
  Plus,
  FileText,
  User,
  Car,
  Phone,
  Mail,
  X,
  Hash,
  Palette,
  ShieldUser,
  LogOut,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";

import Input from "@/utilites/Input";
import api from "@/Services/api";
import { normalizeUser } from "@/hooks/useCurrentUser";
import { clearUser } from "@/store/slices/authSlice";
import {
  initializeProfile,
  setProfileFormData,
  setOriginalProfileData,
  setProfileUser,
  setProfileEditing,
  setProfileSaving,
  setProfileMessage,
  setProfileMessageType,
} from "@/store/slices/profileSlice";

/* =========================================================
   SWR FETCHER
========================================================= */

const fetcher = async (url) => {
  const response = await api.get(url);
  return response.data;
};

/* =========================================================
   DEFAULT USER
========================================================= */

const DEFAULT_USER_DATA = {
  name: "",
  email: "",
  phone: "",
  unit: "",
  role: "",
};

/* =========================================================
   EXTRACT USER FROM API RESPONSE
========================================================= */

const extractUser = (responseData) => {
  if (!responseData) {
    return null;
  }

  if (responseData?.data?.user) {
    return responseData.data.user;
  }

  if (responseData?.data) {
    return responseData.data;
  }

  if (responseData?.user) {
    return responseData.user;
  }

  return responseData;
};

/* =========================================================
   PROFILE
========================================================= */

export default function Profile({
  dashboardType = null,
  vehicles = [],
  showAllVehicles = false,
  setShowAllVehicles = null,
  onClose = null,
  onLogout = null,
  currentUser = null,
  currentUserRaw = null,
  currentUserLoading = false,
  onUserUpdated = null,
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    data: swrData,
    error: swrError,
    isLoading: swrLoading,
    mutate,
  } = useSWR(currentUser ? null : "/auth/me", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    dedupingInterval: 60 * 1000,
    keepPreviousData: true,
  });

  const swrUser = extractUser(swrData);

  const user = currentUser || swrUser;

  const loading = currentUser
    ? currentUserLoading
    : swrLoading && !swrData;

  if (swrError) {
    console.error("FAILED TO LOAD PROFILE");
    console.error(swrError);
    console.error("RESPONSE:");
    console.error(swrError.response?.data);
  }

  const profileError =
    !loading && !user && !currentUser && swrError
      ? swrError.response?.data?.message ||
        swrError.response?.data?.error ||
        swrError.message ||
        "Failed to load profile."
      : null;

  /* =========================================================
     HANDLE LOGOUT
     =========================================================
     
     IMPORTANT:
     
     1. Logout is sent to the BACKEND first.
     2. Only after backend logout succeeds do we clear the
        frontend middleware session.
     3. Redux auth state is cleared.
     4. Browser is redirected to login.
     
     Backend:
     
       POST /auth/logout
     
     Body:
     
       {
         status: "success",
         message: "Logged out"
       }
     
  ========================================================= */

  const handleLogout = async () => {
    try {
      /*
       * =======================================================
       * STEP 1 — BACKEND LOGOUT
       * =======================================================
       *
       * The backend owns the real authentication session.
       * Therefore logout must be performed there first.
       */

      const response = await api.post("/auth/logout", {
        status: "success",
        message: "Logged out",
      });

      console.log("BACKEND LOGOUT RESPONSE:");
      console.log(response.data);

      /*
       * =======================================================
       * STEP 2 — CLEAR FRONTEND MIDDLEWARE SESSION
       * =======================================================
       *
       * This does NOT perform the real logout.
       * It only removes the Next.js middleware cookies after
       * the backend has successfully logged the user out.
       */

      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "same-origin",
      });

      /*
       * =======================================================
       * STEP 3 — CLEAR REDUX AUTH STATE
       * =======================================================
       */

      dispatch(clearUser());

      dispatch(setProfileUser(null));

      /*
       * =======================================================
       * STEP 4 — CUSTOM LOGOUT CALLBACK
       * =======================================================
       */

      if (typeof onLogout === "function") {
        onLogout();
      }

      /*
       * =======================================================
       * STEP 5 — REDIRECT
       * =======================================================
       */

      window.location.replace("/login");
    } catch (error) {
      console.error("BACKEND LOGOUT ERROR:");
      console.error(error);
      console.error("RESPONSE:");
      console.error(error.response?.data);

      /*
       * If the backend returns 401/403 because the session is
       * already invalid/expired, locally finish the logout so
       * the user is not trapped inside the dashboard.
       *
       * The backend remains the source of truth.
       */

      try {
        await fetch("/api/auth/session", {
          method: "DELETE",
          credentials: "same-origin",
        });
      } catch (frontendSessionError) {
        console.error(
          "Failed to clear frontend session:",
          frontendSessionError,
        );
      }

      dispatch(clearUser());
      dispatch(setProfileUser(null));

      if (typeof onLogout === "function") {
        onLogout();
      }

      window.location.replace("/login");
    }
  };

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (dashboardType && loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="font-medium text-gray-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR SCREEN
  ========================================================= */

  if (!dashboardType && profileError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <X className="text-red-600" size={28} />
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Failed to Load Profile
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            {profileError}
          </p>

          <button
            type="button"
            onClick={() => mutate()}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     NO USER
  ========================================================= */

  if (!loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-xl">
          <p className="font-medium text-gray-600">
            User data was not returned from the server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProfileEditor
      key={
        user?.id ||
        user?.userId ||
        user?.username ||
        user?.email ||
        "profile"
      }
      dashboardType={dashboardType}
      user={user}
      currentUserRaw={currentUserRaw}
      vehicles={vehicles}
      showAllVehicles={showAllVehicles}
      setShowAllVehicles={setShowAllVehicles}
      onClose={onClose}
      onLogout={handleLogout}
      onUserUpdated={onUserUpdated}
      mutate={mutate}
    />
  );
}

/* =========================================================
   PROFILE EDITOR
========================================================= */

function ProfileEditor({
  dashboardType = null,
  user,
  currentUserRaw = null,
  vehicles = [],
  showAllVehicles = false,
  setShowAllVehicles = null,
  onClose = null,
  onLogout = null,
  onUserUpdated = null,
  mutate,
}) {
  const normalizedUser = normalizeUser(user);

  const dispatch = useDispatch();

  const {
    isEditing,
    saving,
    formData,
    originalData,
    profileUser,
    message,
    messageType,
  } = useSelector((state) => state.profile);

  const profileKey =
    user?.id ||
    user?.userId ||
    user?.username ||
    user?.email ||
    "profile";

  useEffect(() => {
    const initialData = normalizedUser || DEFAULT_USER_DATA;

    dispatch(
      initializeProfile({
        user: initialData,
        rawUser: currentUserRaw || user,
      }),
    );
  }, [dispatch, profileKey]);

  const setIsEditing = (value) =>
    dispatch(setProfileEditing(value));

  const setSaving = (value) =>
    dispatch(setProfileSaving(value));

  const setFormData = (value) => {
    if (typeof value === "function") {
      dispatch(setProfileFormData(value(formData)));
      return;
    }

    dispatch(setProfileFormData(value));
  };

  const setOriginalData = (value) =>
    dispatch(setOriginalProfileData(value));

  const setProfileUserLocal = (value) =>
    dispatch(setProfileUser(value));

  const setMessage = (value) =>
    dispatch(setProfileMessage(value));

  const setMessageType = (value) =>
    dispatch(setProfileMessageType(value));

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     UPDATE PROFILE
  ========================================================= */

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setMessageType("");

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        unit: formData.unit,
      };

      const response = await api.put("/me", payload);

      console.log("UPDATE PROFILE RESPONSE:");
      console.log(response.data);

      const responseData = response.data;

      let updatedUser = extractUser(responseData);

      if (!updatedUser || typeof updatedUser !== "object") {
        updatedUser = null;
      }

      const updatedData = updatedUser
        ? normalizeUser(updatedUser)
        : {
            ...formData,
          };

      if (!updatedData.role) {
        updatedData.role = formData.role;
      }

      setFormData(updatedData);
      setOriginalData(updatedData);

      if (updatedUser) {
        setProfileUserLocal(updatedUser);
      }

      if (updatedUser) {
        await mutate((currentData) => {
          if (!currentData) {
            return currentData;
          }

          if (currentData?.data?.user) {
            return {
              ...currentData,
              data: {
                ...currentData.data,
                user: updatedUser,
              },
            };
          }

          if (currentData?.data) {
            return {
              ...currentData,
              data: updatedUser,
            };
          }

          if (currentData?.user) {
            return {
              ...currentData,
              user: updatedUser,
            };
          }

          return updatedUser;
        }, false);
      } else {
        await mutate();
      }

      setIsEditing(false);
      setMessage("Profile updated successfully.");
      setMessageType("success");

      if (typeof onUserUpdated === "function") {
        onUserUpdated();
      }
    } catch (error) {
      console.error("FAILED TO UPDATE PROFILE");
      console.error(error);
      console.error(error.response?.data);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update profile.",
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setMessage("");
    setMessageType("");
  };

  /* =========================================================
     ROLE
  ========================================================= */

  const role = formData.role?.toUpperCase();

  const isAdmin = role === "ADMIN";
  const isOwner = role === "OWNER";
  const isSecurity = role === "SECURITY" || role === "SUPERVISOR";
  const isRoller = role === "ROLLER";

  const getRoleLabel = () => {
    switch (role) {
      case "ADMIN":
        return "Administrator";

      case "OWNER":
        return "Owner";

      case "SECURITY":
      case "SUPERVISOR":
        return "Security / Supervisor";

      case "ROLLER":
        return "Roller";

      default:
        return formData.role || "User";
    }
  };

  /* =========================================================
     VEHICLE STATUS
  ========================================================= */

  const STATUS_STYLES = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const STATUS_LABELS = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };

  /* =========================================================
     CONVERT NUMBERS
  ========================================================= */

  const convertToHindiNumbers = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    return String(value).replace(
      /[0-9]/g,
      (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)],
    );
  };

  /* =========================================================
     VEHICLE PLATE
  ========================================================= */

  const getVehiclePlate = (vehicle) => {
    if (!vehicle) {
      return "-";
    }

    const plateLetters =
      vehicle.plateLetters ??
      vehicle.plateLettersNormalized ??
      "";

    const plateNumbers =
      vehicle.plateNumbers ??
      vehicle.plateNumbersNormalized ??
      "";

    const convertedNumbers =
      convertToHindiNumbers(plateNumbers);

    if (plateLetters && convertedNumbers) {
      return `${plateLetters
        .split("")
        .reverse()
        .join("")} ${convertedNumbers}`;
    }

    if (plateLetters) {
      return plateLetters;
    }

    if (convertedNumbers) {
      return convertedNumbers;
    }

    if (vehicle.plateNumber) {
      return convertToHindiNumbers(vehicle.plateNumber);
    }

    return "-";
  };

  /* =========================================================
     VEHICLE BRAND
  ========================================================= */

  const getVehicleBrand = (vehicle) => {
    if (!vehicle) {
      return "-";
    }

    if (
      typeof vehicle.brand === "string" &&
      vehicle.brand.trim()
    ) {
      return vehicle.brand;
    }

    if (
      typeof vehicle.vehicleBrand === "string" &&
      vehicle.vehicleBrand.trim()
    ) {
      return vehicle.vehicleBrand;
    }

    if (
      vehicle.vehicle &&
      typeof vehicle.vehicle === "object" &&
      typeof vehicle.vehicle.brand === "string" &&
      vehicle.vehicle.brand.trim()
    ) {
      return vehicle.vehicle.brand;
    }

    return "-";
  };

  /* =========================================================
     VEHICLE COLOR
  ========================================================= */

  const getVehicleColor = (vehicle) => {
    if (!vehicle) {
      return "-";
    }

    if (
      typeof vehicle.color === "string" &&
      vehicle.color.trim()
    ) {
      return vehicle.color;
    }

    if (
      vehicle.vehicle &&
      typeof vehicle.vehicle === "object" &&
      typeof vehicle.vehicle.color === "string" &&
      vehicle.vehicle.color.trim()
    ) {
      return vehicle.vehicle.color;
    }

    return "-";
  };

  /* =========================================================
     OWNER PROFILE
  ========================================================= */

  const renderOwnerDashboardProfile = () => {
    if (!profileUser) {
      return null;
    }

    const ownerVehicles = Array.isArray(vehicles)
      ? vehicles
      : [];

    const displayedVehicles = showAllVehicles
      ? ownerVehicles
      : ownerVehicles.slice(0, 3);

    return (
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          aria-label="Close profile"
          onClick={onClose}
          className="absolute inset-0 h-full w-full cursor-default bg-black/40 backdrop-blur-[2px]"
        />

        <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
          <div className="shrink-0 bg-linear-to-r from-blue-600 to-blue-800 px-6 py-7 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                  <User size={32} className="text-blue-700" />
                </div>

                <div>
                  <p className="text-sm text-blue-100">
                    Resident Profile
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {formData.name || "User"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close profile panel"
                className="rounded-xl p-2 text-white transition hover:bg-white/15"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-7">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
                Personal Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                    <User size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400">
                      Full Name
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {formData.name || "User"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                    <Hash size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400">
                      Unit Number
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {formData.unit || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="rounded-xl bg-green-100 p-3 text-green-600">
                    <Phone size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400">
                      Phone Number
                    </p>

                    <p className="mt-1 font-semibold text-gray-800">
                      {formData.phone || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                    <Mail size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-400">
                      Email
                    </p>

                    <p className="mt-1 break-all font-semibold text-gray-800">
                      {formData.email || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Registered Vehicles
                </h3>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {ownerVehicles.length} Vehicle
                  {ownerVehicles.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-4">
                {ownerVehicles.length > 0 ? (
                  displayedVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3 border-b bg-gray-50 px-4 py-4">
                        <div className="rounded-xl bg-green-100 p-3 text-green-600">
                          <Car size={21} />
                        </div>

                        <div className="flex-1">
                          <p className="font-bold text-gray-800">
                            {getVehicleBrand(vehicle)}
                          </p>

                          <p className="text-xs text-gray-500">
                            Registered Vehicle
                          </p>
                        </div>

                        {(() => {
                          const status =
                            vehicle.status || "approved";

                          const style =
                            STATUS_STYLES[status] ||
                            STATUS_STYLES.pending;

                          const label =
                            STATUS_LABELS[status] || status;

                          return (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}
                            >
                              {label}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="grid grid-cols-1 gap-3 p-4">
                        <div className="rounded-xl bg-blue-50 p-3">
                          <div className="mb-1 flex items-center gap-2">
                            <Hash
                              size={15}
                              className="text-blue-600"
                            />

                            <span className="text-xs font-medium text-gray-500">
                              Plate Number
                            </span>
                          </div>

                          <p
                            dir="rtl"
                            className="font-mono text-lg font-bold text-blue-700"
                          >
                            {getVehiclePlate(vehicle)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-purple-50 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Car
                                size={15}
                                className="text-purple-600"
                              />

                              <span className="text-xs font-medium text-gray-500">
                                Brand
                              </span>
                            </div>

                            <p className="font-semibold text-gray-800">
                              {getVehicleBrand(vehicle)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-orange-50 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Palette
                                size={15}
                                className="text-orange-600"
                              />

                              <span className="text-xs font-medium text-gray-500">
                                Color
                              </span>
                            </div>

                            <p className="font-semibold text-gray-800">
                              {getVehicleColor(vehicle)}
                            </p>
                          </div>
                        </div>

                        {vehicle.licenseFileName && (
                          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                            <FileText size={17} />

                            <span className="truncate">
                              {vehicle.licenseFileName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                    <Car
                      className="mx-auto text-gray-300"
                      size={32}
                    />

                    <p className="mt-2 text-sm font-medium text-gray-500">
                      No registered vehicles.
                    </p>
                  </div>
                )}

                {ownerVehicles.length > 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowAllVehicles?.(!showAllVehicles)
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                  >
                    {showAllVehicles ? (
                      <>
                        Show Less
                        <ChevronUp size={18} />
                      </>
                    ) : (
                      <>
                        View All Vehicles
                        <ChevronDown size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-blue-50 p-3">
              <ShieldUser
                size={20}
                className="shrink-0 text-blue-600"
              />

              <p className="text-xs leading-relaxed text-blue-700">
                Your profile information and registered vehicles are
                managed by the system.
              </p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-semibold text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </aside>
      </div>
    );
  };

  /* =========================================================
     SUPERVISOR PROFILE
  ========================================================= */

  const renderSupervisorDashboardProfile = () => {
    if (!profileUser) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          aria-label="Close profile"
          onClick={onClose}
          className="absolute inset-0 h-full w-full cursor-default bg-black/40 backdrop-blur-[2px]"
        />

        <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl sm:max-w-md">
          <div className="shrink-0 bg-linear-to-r from-blue-600 to-blue-800 px-6 py-7 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                  <ShieldCheck
                    size={32}
                    className="text-blue-700"
                  />
                </div>

                <div>
                  <p className="text-sm text-blue-100">
                    Supervisor Profile
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {formData.name || "User"}
                  </h2>

                  <p className="mt-1 text-sm text-blue-200">
                    ID:{" "}
                    {profileUser.username ||
                      profileUser.userId ||
                      "-"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close profile panel"
                className="rounded-xl p-2 text-white transition hover:bg-white/15"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
              Supervisor Information
            </h3>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <User size={21} />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Full Name
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {formData.name || "User"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-green-100 p-3 text-green-600">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Role
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {getRoleLabel()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-blue-700">
                    ID
                  </p>

                  <p className="mt-1 font-mono font-semibold text-blue-800">
                    {profileUser.username ||
                      profileUser.userId ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-blue-700">
                    Username
                  </p>

                  <p className="mt-1 font-semibold text-blue-800">
                    {profileUser.username ||
                      profileUser.userName ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-blue-700">
                    Email
                  </p>

                  <p className="mt-1 break-all font-semibold text-blue-800">
                    {formData.email || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-blue-50 p-3">
              <ShieldCheck
                size={20}
                className="shrink-0 text-blue-600"
              />

              <p className="text-xs leading-relaxed text-blue-700">
                Supervisor access is used to monitor vehicle activity at
                compound gates.
              </p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-semibold text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </aside>
      </div>
    );
  };

  /* =========================================================
     ROLLER PROFILE
  ========================================================= */

  const renderRollerDashboardProfile = () => {
    if (!profileUser) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          aria-label="Close profile"
          onClick={onClose}
          className="absolute inset-0 h-full w-full cursor-default bg-black/40 backdrop-blur-[2px]"
        />

        <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl sm:max-w-md">
          <div className="shrink-0 bg-linear-to-r from-blue-600 to-blue-800 px-6 py-7 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                  <ShieldCheck
                    size={32}
                    className="text-blue-700"
                  />
                </div>

                <div>
                  <p className="text-sm text-blue-100">
                    Roller Profile
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {formData.name || "User"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close profile panel"
                className="rounded-xl p-2 text-white transition hover:bg-white/15"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
              Roller Information
            </h3>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <User size={21} />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Full Name
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {formData.name || "User"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-400">
                ID
              </p>

              <p className="mt-1 font-mono font-semibold text-gray-800">
                {profileUser.id ||
                  profileUser.userId ||
                  "-"}
              </p>

              <p className="mt-3 text-xs font-medium text-gray-400">
                Username
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {profileUser.username ||
                  profileUser.userName ||
                  "-"}
              </p>

              <p className="mt-3 text-xs font-medium text-gray-400">
                Email
              </p>

              <p className="mt-1 break-all font-semibold text-gray-800">
                {formData.email || "-"}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-green-100 p-3 text-green-600">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Role
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {getRoleLabel()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="font-semibold text-blue-800">
                    Extended Access
                  </p>

                  <p className="mt-1 text-sm leading-relaxed text-blue-700">
                    Roller can monitor gate activity and manage employees
                    through the management buttons.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-blue-50 p-3">
              <ShieldCheck
                size={20}
                className="shrink-0 text-blue-600"
              />

              <p className="text-xs leading-relaxed text-blue-700">
                Roller access is used to monitor vehicle activity and
                manage employees.
              </p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-semibold text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </aside>
      </div>
    );
  };

  /* =========================================================
     DASHBOARD PROFILE
  ========================================================= */

  if (dashboardType === "owner") {
    return renderOwnerDashboardProfile();
  }

  if (dashboardType === "supervisor") {
    return renderSupervisorDashboardProfile();
  }

  if (dashboardType === "roller") {
    return renderRollerDashboardProfile();
  }

  /* =========================================================
     NORMAL PROFILE LOADING
  ========================================================= */

  if (!profileUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-lg">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="font-medium text-gray-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     NORMAL PROFILE UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/20 text-4xl font-bold">
                {formData.name
                  ? formData.name.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div>
                <h2 className="text-3xl font-bold">
                  {formData.name || "User"}
                </h2>

                <p className="mt-1 text-blue-100">
                  {formData.email || "No email"}
                </p>

                <div className="mt-3">
                  <span className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
                    {getRoleLabel()}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 px-6 py-5 backdrop-blur">
              <p className="text-sm text-blue-100">
                Account Role
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                {getRoleLabel()}
              </h3>
            </div>
          </div>
        </div>

        <div className="px-6 py-10 sm:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Personal Information
            </h2>

            <p className="mt-1 text-gray-500">
              View and manage your account information.
            </p>
          </div>

          <div className="grid gap-6">
            <Input
              name="name"
              label_title="Full Name"
              input_type="text"
              value={formData.name}
              placeholder="Full Name"
              handleCahnge={handleChange}
              disabled={!isEditing}
            />

            <Input
              name="email"
              label_title="Email Address"
              input_type="email"
              value={formData.email}
              placeholder="Email Address"
              handleCahnge={handleChange}
              disabled={!isEditing}
            />

            <Input
              name="phone"
              label_title="Phone Number"
              input_type="text"
              value={formData.phone}
              placeholder="Phone Number"
              handleCahnge={handleChange}
              disabled={!isEditing}
            />

            {isOwner && (
              <Input
                name="unit"
                label_title="Unit Number"
                input_type="text"
                value={formData.unit}
                placeholder="Unit Number"
                handleCahnge={handleChange}
                disabled={!isEditing}
              />
            )}

            <div className="flex w-full max-w-3xl flex-col items-start gap-2 md:flex-row md:items-center md:gap-6">
              <label className="w-50 font-semibold text-gray-700">
                Account Role
              </label>

              <div className="flex-1">
                <span className="inline-flex rounded-xl bg-blue-100 px-5 py-3 font-semibold text-blue-700">
                  {getRoleLabel()}
                </span>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  setMessageType("");
                  setIsEditing(true);
                }}
                className="mx-auto mt-4 w-full max-w-sm rounded-xl bg-blue-600 py-3.5 text-lg font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-xl"
              >
                Edit Profile
              </button>
            ) : (
              <div className="mx-auto flex w-full max-w-md flex-col gap-4 md:flex-row">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gray-400 py-3 font-semibold text-white transition hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="mt-10 border-t pt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Owner Actions
              </h2>

              <div className="flex flex-col justify-center gap-4 md:flex-row">
                <Link
                  href="/vehicle-registration"
                  className="flex items-center justify-center gap-3 rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-green-700 hover:shadow-xl"
                >
                  <Plus size={22} />
                  Add New Vehicle
                </Link>

                <Link
                  href="/my-vehicles"
                  className="flex items-center justify-center rounded-xl border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-50"
                >
                  My Vehicles
                </Link>

                <Link
                  href="/family-members"
                  className="flex items-center justify-center rounded-xl bg-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-purple-700 hover:shadow-xl"
                >
                  Family Members
                </Link>
              </div>
            </div>
          )}

          {isSecurity && (
            <div className="mt-10 border-t pt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Security Actions
              </h2>

              <div className="flex flex-col justify-center gap-4 md:flex-row">
                <Link
                  href="/vehicle-lookup"
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 hover:shadow-xl"
                >
                  Vehicle Lookup
                </Link>

                <Link
                  href="/supervisor-dashboard"
                  className="flex items-center justify-center rounded-xl border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Supervisor Dashboard
                </Link>
              </div>
            </div>
          )}

          {isRoller && (
            <div className="mt-10 border-t pt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Roller Actions
              </h2>

              <div className="flex flex-col justify-center gap-4 md:flex-row">
                <Link
                  href="/vehicle-lookup"
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 hover:shadow-xl"
                >
                  Vehicle Lookup
                </Link>

                <Link
                  href="/roller"
                  className="flex items-center justify-center rounded-xl border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Roller Dashboard
                </Link>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="mt-10 border-t pt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Administration
              </h2>

              <Link
                href="/admin"
                className="mx-auto flex w-full max-w-sm items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-indigo-700 hover:shadow-xl"
              >
                Admin Dashboard
              </Link>
            </div>
          )}
        </div>

        {message && (
          <div className="px-6 pb-8 sm:px-8">
            <div
              className={`rounded-xl border p-4 text-center font-medium ${
                messageType === "success"
                  ? "border-green-300 bg-green-100 text-green-700"
                  : "border-red-300 bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

