"use client";

import { useCallback, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";

import api from "@/Services/api";

import OwnerForm from "@/components/owner-registration/OwnerForm";
import VehicleForm from "./VehicleForm";
import OwnersTable from "./OwnersTable";

import {
  EMPTY_VEHICLE_FORM,
} from "./OwnerForm";

import {
  setOwners,
  setLoadingOwners,
  setOwnersError,
  setOwnerForm,
  resetOwnerForm,
  setEditingOwnerId,
  setVehicleForm,
  resetVehicleForm,
  setVehicleOwnerId,
  setEditingVehicleId,
  setShowVehicleForm,
  setSearch,
  addVehicleToOwner,
  updateVehicleInOwner,
  deleteVehicleFromOwner,
  updateVehicleStatus,
} from "@/store/slices/rollerRegOwnerSlice";

import { updateOwner } from "@/store/slices/ownerRegistrationSlice";

const cloneVehicleForm = () => ({
  ...EMPTY_VEHICLE_FORM,
  plateLetters: ["", "", ""],
});

export default function RollerRegOwner() {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    owners,
    loadingOwners,
    ownersError,
    ownerForm,
    editingOwnerId,
    vehicleForm,
    vehicleOwnerId,
    editingVehicleId,
    showVehicleForm,
    search,
  } = useSelector((state) => state.rollerRegOwner);

  // =========================================================
  // RESET OWNER FORM
  // =========================================================

  const resetOwnerFormHandler = useCallback(() => {
    dispatch(resetOwnerForm());
  }, [dispatch]);

  // =========================================================
  // RESET VEHICLE FORM
  // =========================================================

  const resetVehicleFormHandler = useCallback(() => {
    dispatch(resetVehicleForm());
  }, [dispatch]);

  // =========================================================
  // NORMALIZE BACKEND USER
  // =========================================================

  const normalizeOwner = useCallback((user) => {
    if (!user) {
      return null;
    }

    const vehicles = Array.isArray(user.vehicles)
      ? user.vehicles
      : Array.isArray(user.cars)
        ? user.cars
        : [];

    return {
      id:
        user.id ??
        user._id ??
        user.userId,

      firstName:
        user.firstName ?? "",

      lastName:
        user.lastName ?? "",

      username:
        user.username ?? "",

      phone:
        user.phone ?? "",

      email:
        user.email ?? "",

      role:
        user.role ?? "OWNER",

      // Backend: unitCode
      // Frontend: unitNumber
      unitNumber:
        user.unitCode ??
        user.unitNumber ??
        "",

      // Backend: maxVehicles
      // Frontend: vehicleLimit
      vehicleLimit: Number(
        user.maxVehicles ??
        user.vehicleLimit ??
        0,
      ),

      vehicles: vehicles.map((vehicle) => ({
        ...vehicle,

        id:
          vehicle.id ??
          vehicle._id ??
          vehicle.vehicleId ??
          `${Date.now()}-${Math.random()}`,

        plateLetters:
          Array.isArray(vehicle.plateLetters)
            ? [
              ...vehicle.plateLetters,
              "",
              "",
              "",
            ].slice(0, 3)
            : ["", "", ""],

        plateNumbers:
          vehicle.plateNumbers ?? "",

        // Support both brand and model
        brand:
          vehicle.brand ??
          vehicle.model ??
          "",

        model:
          vehicle.model ??
          vehicle.brand ??
          "",

        color:
          vehicle.color ?? "",

        status:
          vehicle.status ?? "pending",

        licenseFile:
          vehicle.licenseFile ?? null,

        licenseFileName:
          vehicle.licenseFileName ?? "",
      })),
    };
  }, []);

  // =========================================================
  // FETCH OWNERS — GET /users
  // =========================================================

  const fetchOwners = useCallback(async () => {
    console.log(
      "GET /users — fetching owners from backend...",
    );

    dispatch(setLoadingOwners(true));
    dispatch(setOwnersError(""));

    try {
      const response = await api.get("/users");

      console.log(
        "GET /users response.data:",
        response.data,
      );

      let users = [];

      // Backend returns array directly
      if (Array.isArray(response.data)) {
        users = response.data;
      }

      // { data: [...] }
      else if (
        Array.isArray(response.data?.data)
      ) {
        users = response.data.data;
      }

      // { users: [...] }
      else if (
        Array.isArray(response.data?.users)
      ) {
        users = response.data.users;
      }

      // { results: [...] }
      else if (
        Array.isArray(response.data?.results)
      ) {
        users = response.data.results;
      }

      else {
        console.warn(
          "GET /users returned an unexpected response structure:",
          response.data,
        );
      }

      // =====================================================
      // KEEP ONLY OWNER USERS
      // =====================================================

      const ownerUsers = users.filter(
        (user) =>
          !user.role ||
          String(user.role).toUpperCase() ===
          "OWNER",
      );

      const normalizedOwners = ownerUsers
        .map(normalizeOwner)
        .filter(Boolean);

      console.log(
        "Owners received from backend:",
        normalizedOwners,
      );

      dispatch(
        setOwners(normalizedOwners),
      );
    } catch (error) {
      console.error(
        "GET /users FAILED:",
        error,
      );

      if (error.response) {
        console.error(
          "Status:",
          error.response.status,
        );

        console.error(
          "Response data:",
          error.response.data,
        );
      } else if (error.request) {
        console.error(
          "No response received from backend.",
          error.request,
        );
      } else {
        console.error(
          "Request setup error:",
          error.message,
        );
      }

      dispatch(
        setOwnersError(
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unable to load owners from the backend.",
        ),
      );

      // Do NOT insert dummy data.
      dispatch(setOwners([]));
    } finally {
      dispatch(setLoadingOwners(false));
    }
  }, [dispatch, normalizeOwner]);

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        fetchOwners();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [fetchOwners]);

  // =========================================================
  // OWNER INPUT CHANGE
  // =========================================================

  const handleOwnerChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    const cleanedValue =
      name === "phone"
        ? value.replace(/\D/g, "")
        : value;

    dispatch(
      setOwnerForm({
        [name]: cleanedValue,
      }),
    );
  };

  // =========================================================
  // VALIDATE OWNER
  // =========================================================

  const validateOwner = () => {
    const firstName =
      ownerForm.firstName.trim();

    const lastName =
      ownerForm.lastName.trim();

    const unitNumber =
      ownerForm.unitNumber.trim();

    const phone =
      ownerForm.phone.trim();

    const email =
      ownerForm.email.trim();

    const vehicleLimit =
      Number(ownerForm.vehicleLimit);

    if (
      !firstName ||
      !lastName ||
      !unitNumber ||
      !phone ||
      !email ||
      !vehicleLimit
    ) {
      alert(
        "Please fill in all required owner information.",
      );

      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      alert(
        "Please enter a valid email address.",
      );

      return false;
    }

    if (vehicleLimit < 1) {
      alert(
        "Vehicle limit must be at least 1.",
      );

      return false;
    }

    return true;
  };

  const getUsername = () => {
    const trimmed =
      ownerForm.username?.trim();

    if (trimmed) {
      return trimmed;
    }

    return `${ownerForm.firstName}${ownerForm.lastName}`.replace(
      /\s/g,
      "",
    );
  };

  // =========================================================
  // CREATE OWNER — POST /users
  // =========================================================

  const setForm = (updater) => {
    dispatch(
      setOwnerForm(
        typeof updater === "function"
          ? updater(ownerForm)
          : updater,
      ),
    );
  };

  const handleOwnerSubmit = async (event) => {
    event.preventDefault();

    if (!validateOwner()) {
      return;
    }

    if (editingOwnerId) {
      try {
        const result = await dispatch(
          updateOwner({
            id: editingOwnerId,
            form: { ...ownerForm, username: getUsername() },
          }),
        );

        if (updateOwner.fulfilled.match(result)) {
          dispatch(resetOwnerForm());
          await fetchOwners();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }

        return;
      } catch (error) {
        console.error("UPDATE OWNER FAILED:", error);
        return;
      }
    }

    const firstName =
      ownerForm.firstName.trim();

    const lastName =
      ownerForm.lastName.trim();

    const unitCode =
      ownerForm.unitNumber.trim();

    const phone =
      ownerForm.phone.trim();

    const email =
      ownerForm.email.trim();

    const maxVehicles =
      Number(ownerForm.vehicleLimit);

    const payload = {
      firstName,

      lastName,

      username: getUsername(),

      phone,

      email,

      password:
        ownerForm.password || "",

      role: "OWNER",

      unitCode,

      maxVehicles,
    };

    // =====================================================
    // POST OWNER
    // =====================================================

    console.log(
      "POST /users payload:",
      payload,
    );

    try {
      const response = await api.post(
        "/users",
        payload,
      );

      console.log(
        "POST /users SUCCESS:",
        response.data,
      );

      alert(
        "Owner registered successfully.",
      );

      dispatch(resetOwnerForm());

      // Always reload from backend.
      await fetchOwners();
    } catch (error) {
      console.error(
        "POST /users FAILED:",
        error,
      );

      if (error.response) {
        console.error(
          "Status:",
          error.response.status,
        );

        console.error(
          "Response data:",
          error.response.data,
        );
      } else if (error.request) {
        console.error(
          "The request was sent but no response was received.",
          error.request,
        );
      } else {
        console.error(
          "Error message:",
          error.message,
        );
      }

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to register owner.";

      alert(backendMessage);
    }
  };

  // =========================================================
  // EDIT OWNER
  // =========================================================

  const handleEditOwner = (owner) => {
    dispatch(
      setEditingOwnerId(owner.id),
    );

    dispatch(
      setOwnerForm({
        firstName:
          owner.firstName || "",

        lastName:
          owner.lastName || "",

        username:
          owner.username || "",

        unitNumber:
          owner.unitNumber || "",

        phone:
          owner.phone || "",

        email:
          owner.email || "",

        password: "",

        confirmPassword: "",

        vehicleLimit:
          String(
            owner.vehicleLimit || 1,
          ),
      }),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE OWNER
  // =========================================================

 const handleDeleteOwner = async (id) => {
  const owner = owners.find(
    (item) => item.id === id,
  );

  if (!owner) {
    return;
  }

  const result = await Swal.fire({
    title: "Are you sure?",
    text: `Are you sure you want to delete ${owner.firstName} ${owner.lastName}? This will also delete all vehicles registered to this owner.`,
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

  await Swal.fire({
    title: "Not Connected",
    text: "Owner deletion is not connected yet because the backend DELETE endpoint has not been provided.",
    icon: "info",
    confirmButtonText: "OK",
  });
};

  // =========================================================
  // OPEN VEHICLE FORM
  // =========================================================

  const openVehicleForm = (
    owner,
    vehicle = null,
  ) => {
    dispatch(
      setVehicleOwnerId(owner.id),
    );

    dispatch(
      setEditingVehicleId(
        vehicle?.id ?? null,
      ),
    );

    if (vehicle) {
      dispatch(
        setVehicleForm({
          plateLetters: [
            ...(vehicle.plateLetters || [
              "",
              "",
              "",
            ]),
          ],

          plateNumbers:
            vehicle.plateNumbers || "",

          model:
            vehicle.model ||
            vehicle.brand ||
            "",

          brand:
            vehicle.brand ||
            vehicle.model ||
            "",

          color:
            vehicle.color || "",

          licenseFile:
            vehicle.licenseFile || null,

          licenseFileName:
            vehicle.licenseFileName || "",
        }),
      );
    } else {
      dispatch(
        setVehicleForm(
          cloneVehicleForm(),
        ),
      );
    }

    dispatch(
      setShowVehicleForm(true),
    );

    requestAnimationFrame(() => {
      document
        .getElementById(
          "vehicle-form-section",
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  };

  // =========================================================
  // VEHICLE CHANGE
  // =========================================================

  const handleVehicleChange = (
    changes,
  ) => {
    dispatch(
      setVehicleForm(changes),
    );
  };

  // =========================================================
  // VALIDATE VEHICLE
  // =========================================================

  const validateVehicle = () => {
    if (!vehicleOwnerId) {
      alert(
        "Please select an owner first.",
      );

      return false;
    }

    if (
      !vehicleForm.plateLetters?.[2]?.trim()
    ) {
      alert(
        "Please enter a plate letter.",
      );

      return false;
    }

    if (
      vehicleForm.plateNumbers.length !== 4
    ) {
      alert(
        "Please enter all 4 plate numbers.",
      );

      return false;
    }

    if (
      !vehicleForm.model.trim()
    ) {
      alert(
        "Please enter the vehicle model.",
      );

      return false;
    }

    if (!vehicleForm.color) {
      alert(
        "Please select the vehicle color.",
      );

      return false;
    }

    return true;
  };

  // =========================================================
  // ADD VEHICLE
  // =========================================================

  const handleVehicleSubmit = (
    event,
  ) => {
    event.preventDefault();

    if (!validateVehicle()) {
      return;
    }

    const owner = owners.find(
      (item) =>
        item.id === vehicleOwnerId,
    );

    if (!owner) {
      alert("Owner not found.");
      return;
    }

    const vehicleLimit =
      Number(owner.vehicleLimit);

    const currentVehicleCount =
      Array.isArray(owner.vehicles)
        ? owner.vehicles.length
        : 0;

    if (
      currentVehicleCount >=
      vehicleLimit
    ) {
      alert(
        `This owner has reached the vehicle limit of ${vehicleLimit}.`,
      );

      return;
    }

    /*
      IMPORTANT:

      There is currently NO vehicle POST endpoint
      provided in the supplied code.

      Therefore this remains local state only.
      Once the real vehicle endpoint is provided,
      this section should be replaced with api.post(...).
    */

    const newVehicle = {
      id: `${Date.now()}-${Math.random()}`,

      plateLetters: [
        ...vehicleForm.plateLetters,
      ],

      plateNumbers:
        vehicleForm.plateNumbers,

      model:
        vehicleForm.model.trim(),

      brand:
        vehicleForm.model.trim(),

      color:
        vehicleForm.color,

      status: "pending",

      licenseFile:
        vehicleForm.licenseFile,

      licenseFileName:
        vehicleForm.licenseFileName,
    };

    dispatch(
      addVehicleToOwner({
        ownerId: vehicleOwnerId,
        vehicle: newVehicle,
      }),
    );

    dispatch(
      resetVehicleForm(),
    );
  };

  // =========================================================
  // UPDATE VEHICLE
  // =========================================================

  const handleVehicleUpdate = (
    event,
  ) => {
    event.preventDefault();

    if (
      !editingVehicleId ||
      !validateVehicle()
    ) {
      return;
    }

    const owner = owners.find(
      (item) =>
        item.id === vehicleOwnerId,
    );

    const existingVehicle =
      owner?.vehicles?.find(
        (vehicle) =>
          vehicle.id ===
          editingVehicleId,
      );

    if (!existingVehicle) {
      alert("Vehicle not found.");
      return;
    }

    dispatch(
      updateVehicleInOwner({
        ownerId: vehicleOwnerId,

        vehicleId:
          editingVehicleId,

        changes: {
          plateLetters: [
            ...vehicleForm.plateLetters,
          ],

          plateNumbers:
            vehicleForm.plateNumbers,

          model:
            vehicleForm.model.trim(),

          brand:
            vehicleForm.model.trim(),

          color:
            vehicleForm.color,

          status:
            existingVehicle.status ||
            "pending",

          licenseFile:
            vehicleForm.licenseFile,

          licenseFileName:
            vehicleForm.licenseFileName,
        },
      }),
    );

    dispatch(
      resetVehicleForm(),
    );
  };

  // =========================================================
  // DELETE VEHICLE
  // =========================================================

const handleDeleteVehicle = async (ownerId, vehicleId) => {
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
    deleteVehicleFromOwner({
      ownerId,
      vehicleId,
    }),
  );

  if (
    vehicleOwnerId === ownerId &&
    editingVehicleId === vehicleId
  ) {
    dispatch(
      resetVehicleForm(),
    );
  }
};
  // =========================================================
  // VEHICLE STATUS
  // =========================================================

  const handleVehicleStatusChange = (
    ownerId,
    vehicleId,
    status,
  ) => {
    dispatch(
      updateVehicleStatus({
        ownerId,
        vehicleId,
        status,
      }),
    );
  };

  // =========================================================
  // CURRENT VEHICLE OWNER
  // =========================================================

  const currentVehicleOwner =
    owners.find(
      (owner) =>
        owner.id === vehicleOwnerId,
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-200 px-4 py-8">
      <div className="mx-auto w-full max-w-360">
        {/* BACK */}
        <button
          type="button"
          onClick={() =>
            router.push("/roller")
          }
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          <ArrowLeft size={18} />
          Back to Roller Dashboard
        </button>

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Register Owner
          </h1>

          <p className="mt-1 text-gray-500">
            Register and manage compound owners.
          </p>
        </div>

        {/* OWNER FORM */}
        <OwnerForm
          form={ownerForm}
          setForm={setForm}
          editing={!!editingOwnerId}
          onChange={handleOwnerChange}
          onSubmit={handleOwnerSubmit}
          onCancel={
            resetOwnerFormHandler
          }
          style="mx-0 w-full max-w-full"
        />

        {/* VEHICLE FORM */}
        {showVehicleForm && (
          <VehicleForm
            form={vehicleForm}
            owner={currentVehicleOwner}
            editingVehicleId={
              editingVehicleId
            }
            onChange={
              handleVehicleChange
            }
            onSubmit={
              editingVehicleId
                ? handleVehicleUpdate
                : handleVehicleSubmit
            }
            onClose={
              resetVehicleFormHandler
            }
          />
        )}

        {/* BACKEND ERROR */}
        {ownersError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">
              Unable to load owners
            </p>

            <p className="mt-1">
              {ownersError}
            </p>

            <button
              type="button"
              onClick={fetchOwners}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loadingOwners ? (
          <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
            <div className="flex min-h-60 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

                <p className="mt-4 text-sm font-medium text-gray-500">
                  Loading owners from backend...
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* TABLE */
          <OwnersTable
            owners={owners}
            search={search}
            onSearchChange={(value) =>
              dispatch(
                setSearch(value),
              )
            }
            onAddVehicle={(owner) =>
              openVehicleForm(owner)
            }
            onEditOwner={
              handleEditOwner
            }
            onDeleteOwner={
              handleDeleteOwner
            }
            onEditVehicle={(
              owner,
              vehicle,
            ) =>
              openVehicleForm(
                owner,
                vehicle,
              )
            }
            onDeleteVehicle={
              handleDeleteVehicle
            }
            onStatusChange={
              handleVehicleStatusChange
            }
          />
        )}
      </div>
    </div>
  );
}