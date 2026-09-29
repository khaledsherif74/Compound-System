// store/slices/ownerRegistrationSlice.js

"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/Services/api";

/* =========================================================
   EMPTY FORMS
========================================================= */

const EMPTY_OWNER_FORM = {
  firstName: "",
  lastName: "",
  unitCode: "",
  phone: "",
  email: "",
  username: "",
  vehicleLimit: 2,
};

const EMPTY_VEHICLE_FORM = {
  plateLetters: ["", "", ""],
  plateNumbers: "",
  vehicleType: "OWNER",
  brand: "",
  color: "",
  licenseFile: null,
  licenseFileName: "",
};

/* =========================================================
   NORMALIZE VEHICLE
========================================================= */

function normalizeVehicle(vehicle) {
  if (!vehicle) return null;

  let plateLetters = ["", "", ""];

  if (Array.isArray(vehicle.plateLetters)) {
    plateLetters = [
      vehicle.plateLetters[0] || "",
      vehicle.plateLetters[1] || "",
      vehicle.plateLetters[2] || "",
    ];
  } else if (typeof vehicle.plateLetters === "string") {
    const parts = vehicle.plateLetters.trim().split(/\s+/);

    plateLetters = [parts[0] || "", parts[1] || "", parts[2] || ""];
  }

  return {
    ...vehicle,

    id: vehicle.id,

    ownerId: vehicle.ownerId || vehicle.owner_id || "",

    vehicleType: vehicle.vehicleType || vehicle.type || "OWNER",

    plateLetters,

    plateNumbers: vehicle.plateNumbers || vehicle.plateNumber || "",

    brand: vehicle.brand || "",

    color: vehicle.color || "",

    status: vehicle.status || "pending",

    licenseFile: vehicle.licenseFile || null,

    licenseFileName: vehicle.licenseFileName || vehicle.licenseFile?.name || "",
  };
}

/* =========================================================
   NORMALIZE OWNER
========================================================= */

function normalizeOwner(owner) {
  if (!owner) return null;

  const vehiclesSource = Array.isArray(owner.vehicles)
    ? owner.vehicles
    : Array.isArray(owner.Vehicles)
      ? owner.Vehicles
      : [];

  return {
    ...owner,

    id: owner.id,

    firstName: owner.firstName || "",

    lastName: owner.lastName || "",

    email: owner.email || "",

    username: owner.username || "",

    phone: owner.phone || "",

    /*
     * The API response contains:
     *
     * unit: {
     *   unitCode: "A-101"
     * }
     *
     * Therefore read it from unit.unitCode.
     */
    unitCode: owner.unitCode || owner.unit?.unitCode || "",

    vehicleLimit: Number(owner.vehicleLimit ?? owner.maxVehicles ?? 1),

    maxVehicles: Number(owner.maxVehicles ?? owner.vehicleLimit ?? 1),

    status: owner.status || (owner.active === false ? "INACTIVE" : "ACTIVE"),

    active: owner.active !== false,

    vehicles: vehiclesSource.map(normalizeVehicle).filter(Boolean),
  };
}

/* =========================================================
   EXTRACT ARRAY
========================================================= */

function extractArray(response) {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.data?.users)) {
    return data.data.users;
  }

  if (Array.isArray(data?.owners)) {
    return data.owners;
  }

  if (Array.isArray(data?.data?.owners)) {
    return data.data.owners;
  }

  return [];
}

/* =========================================================
   EXTRACT VEHICLES ARRAY
========================================================= */

function extractVehiclesArray(response) {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.vehicles)) {
    return data.vehicles;
  }

  if (Array.isArray(data?.data?.vehicles)) {
    return data.data.vehicles;
  }

  return [];
}

/* =========================================================
   GROUP VEHICLES BY OWNER ID
========================================================= */

function groupVehiclesByOwner(vehicles) {
  const grouped = {};

  vehicles.forEach((vehicle) => {
    const ownerId = vehicle?.ownerId ?? vehicle?.owner_id;

    if (ownerId === undefined || ownerId === null) return;

    const key = String(ownerId);

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(vehicle);
  });

  return grouped;
}

/* =========================================================
   REGISTER OWNER
========================================================= */

export const registerOwner = createAsyncThunk(
  "ownerRegistration/registerOwner",

  async (form, { rejectWithValue }) => {
    try {
      const firstName = form.firstName?.trim() || "";

      const lastName = form.lastName?.trim() || "";

      const unitCode = form.unitCode?.trim() || "";

      const phone = form.phone?.trim() || "";

      const email = form.email?.trim() || "";

      const username = form.username?.trim() || "";

      const maxVehicles = Number(form.vehicleLimit) || 3;

      const payload = {
        firstName,
        lastName,
        username,
        phone,
        email,
        role: "OWNER",
        unitCode,
        maxVehicles,
      };

      const response = await api.post("/users", payload);

      const owner =
        response.data?.data?.user ||
        response.data?.data ||
        response.data?.user ||
        response.data;

      return {
        owner: normalizeOwner(owner),
        passwordRecoverySent:
          response.data?.meta?.passwordRecoverySent !== false,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          (error.response?.status === 409
            ? "An owner with the same username, email, phone, or unit already exists."
            : error.message) ||
          "Failed to register owner.",
      );
    }
  },
);

/* =========================================================
   FETCH OWNERS
========================================================= */

export const fetchOwners = createAsyncThunk(
  "ownerRegistration/fetchOwners",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users");

      const users = extractArray(response);

      /*
       * GET /users does NOT include each owner's vehicles.
       * Vehicles live on their own resource, so fetch them
       * separately and merge by ownerId.
       */
      let vehiclesByOwner = {};

      try {
        const vehiclesResponse = await api.get(`/vehicles`);

        const vehicles = extractVehiclesArray(vehiclesResponse);

        vehiclesByOwner = groupVehiclesByOwner(vehicles);
      } catch (vehiclesError) {
        console.error("Failed to load vehicles:", vehiclesError);
      }

      const owners = users
        .filter((user) => String(user?.role || "").toUpperCase() === "OWNER")
        .map((user) => {
          const normalized = normalizeOwner(user);

          if (!normalized) return null;

          if (normalized.vehicles.length) {
            return normalized;
          }

          const ownerVehicles = vehiclesByOwner[String(normalized.id)] || [];

          return {
            ...normalized,
            vehicles: ownerVehicles.map(normalizeVehicle).filter(Boolean),
          };
        })
        .filter(Boolean);

      return owners;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load owners.",
      );
    }
  },
);

/* =========================================================
   UPDATE OWNER
========================================================= */

export const updateOwner = createAsyncThunk(
  "ownerRegistration/updateOwner",
  async ({ id, form }, { rejectWithValue }) => {
    try {
      const username =
        (form.username?.trim() ||
          `${(form.firstName || "")
            .replace(/\s/g, "")}${(form.lastName || "").replace(/\s/g, "")}`) ||
          "";

      const payload = {
        firstName: form.firstName?.trim() || "",
        lastName: form.lastName?.trim() || "",
        phone: form.phone?.trim() || "",
        email: form.email?.trim() || "",
        username,
        maxVehicles: Number(form.vehicleLimit) || 3,
      };

      const response = await api.patch(`/users/${id}`, payload);

      const updated =
        response.data?.data?.user ||
        response.data?.data ||
        response.data?.user ||
        response.data;

      return normalizeOwner(updated);
    } catch (error) {
      console.error("UPDATE OWNER ERROR:", error.response?.data || error);

      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update owner.",
      );
    }
  },
);

/* =========================================================
   SEND OWNER PASSWORD RECOVERY
   POST /users/:id/password-reset
========================================================= */

export const sendOwnerPasswordRecovery = createAsyncThunk(
  "ownerRegistration/sendOwnerPasswordRecovery",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Owner ID is required.");
      }

      await api.post(`/users/${id}/password-reset`);

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to send password recovery message.",
      );
    }
  },
);

/* =========================================================
   DELETE OWNER
========================================================= */

export const deleteOwner = createAsyncThunk(
  "ownerRegistration/deleteOwner",

  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to delete owner.",
      );
    }
  },
);

/* =========================================================
   ADD VEHICLE API
========================================================= */

export const addVehicleApi = createAsyncThunk(
  "ownerRegistration/addVehicleApi",

  async ({ ownerId, vehicle }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append(
        "plateLetters",
        Array.isArray(vehicle.plateLetters)
          ? vehicle.plateLetters.filter(Boolean).join(" ")
          : vehicle.plateLetters || "",
      );

      formData.append("plateNumbers", vehicle.plateNumbers || "");

      formData.append("ownerId", String(ownerId));

      formData.append("vehicleType", vehicle.vehicleType || "OWNER");

      if (vehicle.brand) {
        formData.append("brand", vehicle.brand);
      }

      if (vehicle.color) {
        formData.append("color", vehicle.color);
      }

      if (vehicle.licenseFile) {
        formData.append("licenseFile", vehicle.licenseFile);
      }

      const response = await api.post("/vehicles", formData);

      const created =
        response.data?.data?.vehicle ||
        response.data?.data ||
        response.data?.vehicle ||
        response.data;

      return {
        ownerId,

        vehicle: normalizeVehicle({
          ...created,

          ownerId,

          vehicleType: created?.vehicleType || vehicle.vehicleType || "OWNER",
        }),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to add vehicle.",
      );
    }
  },
);

/* =========================================================
   UPDATE VEHICLE API
========================================================= */

export const updateVehicleApi = createAsyncThunk(
  "ownerRegistration/updateVehicleApi",

  async ({ id, vehicle, ownerId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append(
        "plateLetters",
        Array.isArray(vehicle.plateLetters)
          ? vehicle.plateLetters.filter(Boolean).join(" ")
          : vehicle.plateLetters || "",
      );

      formData.append("plateNumbers", vehicle.plateNumbers || "");

      formData.append("ownerId", String(ownerId));

      formData.append("vehicleType", vehicle.vehicleType || "OWNER");

      if (vehicle.brand) {
        formData.append("brand", vehicle.brand);
      }

      if (vehicle.color) {
        formData.append("color", vehicle.color);
      }

      if (vehicle.licenseFile) {
        formData.append("licenseFile", vehicle.licenseFile);
      }

      const response = await api.patch(`/vehicles/${id}`, formData);

      const updated =
        response.data?.data?.vehicle ||
        response.data?.data ||
        response.data?.vehicle ||
        response.data;

      return normalizeVehicle({
        ...updated,

        id,

        ownerId,

        vehicleType: updated?.vehicleType || vehicle.vehicleType || "OWNER",
      });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update vehicle.",
      );
    }
  },
);

/* =========================================================
   DELETE VEHICLE API
========================================================= */

export const deleteVehicleApi = createAsyncThunk(
  "ownerRegistration/deleteVehicleApi",

  async ({ ownerId, vehicleId }, { rejectWithValue }) => {
    try {
      await api.delete(`/vehicles/${vehicleId}`);

      return {
        ownerId,
        vehicleId,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to delete vehicle.",
      );
    }
  },
);

/* =========================================================
   UPDATE VEHICLE STATUS API
========================================================= */

export const updateVehicleStatusApi = createAsyncThunk(
  "ownerRegistration/updateVehicleStatusApi",

  async ({ vehicleId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/vehicles/${vehicleId}/status`, {
        status,
      });

      const updated =
        response.data?.data?.vehicle ||
        response.data?.data ||
        response.data?.vehicle ||
        response.data;

      return {
        vehicle: normalizeVehicle({
          ...updated,

          id: vehicleId,

          status,
        }),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update vehicle status.",
      );
    }
  },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  form: {
    ...EMPTY_OWNER_FORM,
  },

  vehicleForm: {
    ...EMPTY_VEHICLE_FORM,
    plateLetters: ["", "", ""],
  },

  owners: [],

  editingOwnerId: null,

  vehicleOwnerId: null,

  editingVehicleId: null,

  showVehicleForm: false,

  search: "",

  sortConfig: {
    key: "",
    direction: "asc",
  },

  loadingOwners: false,

  submittingOwner: false,

  sendingPasswordRecovery: false,

  submittingVehicle: false,

  deletingOwner: false,

  error: "",

  vehicleError: "",

  success: false,
};

/* =========================================================
   SLICE
========================================================= */

const ownerRegistrationSlice = createSlice({
  name: "ownerRegistration",

  initialState,

  reducers: {
    setOwnerFormField(state, action) {
      const { name, value } = action.payload;

      state.form[name] =
        name === "phone" ? String(value).replace(/\D/g, "") : value;
    },

    setOwnerForm(state, action) {
      state.form = {
        ...state.form,
        ...action.payload,
      };
    },

    resetOwnerForm(state) {
      state.form = {
        ...EMPTY_OWNER_FORM,
      };

      state.editingOwnerId = null;
      state.error = "";
      state.success = false;
    },

    startEditOwner(state, action) {
      const owner = action.payload;

      const existingUnitCode = owner.unitCode || owner.unit?.unitCode || "";

      state.editingOwnerId = owner.id;

      state.form = {
        firstName: owner.firstName || "",
        lastName: owner.lastName || "",

        unitCode: existingUnitCode,

        phone: owner.phone || "",
        email: owner.email || "",
        username: owner.username || "",

        vehicleLimit: String(owner.maxVehicles ?? owner.vehicleLimit ?? 1),
      };

      state.error = "";
      state.success = false;
    },

    setOwnerSearch(state, action) {
      state.search = action.payload;
    },

    setOwnerSort(state, action) {
      const column = action.payload;

      if (state.sortConfig.key === column) {
        state.sortConfig.direction =
          state.sortConfig.direction === "asc" ? "desc" : "asc";
      } else {
        state.sortConfig = {
          key: column,
          direction: "asc",
        };
      }
    },

    clearOwnerError(state) {
      state.error = "";
    },

    setVehicleFormField(state, action) {
      const { name, value } = action.payload;

      state.vehicleForm[name] = value;
    },

    setVehicleForm(state, action) {
      state.vehicleForm = {
        ...state.vehicleForm,
        ...action.payload,
      };
    },

    setVehiclePlateLetters(state, action) {
      state.vehicleForm.plateLetters = [...action.payload];
    },

    setVehiclePlateNumbers(state, action) {
      state.vehicleForm.plateNumbers = action.payload;
    },

    setVehicleType(state, action) {
      state.vehicleForm.vehicleType = action.payload;
    },

    openAddVehicle(state, action) {
      state.vehicleOwnerId = action.payload;

      state.editingVehicleId = null;

      state.vehicleForm = {
        ...EMPTY_VEHICLE_FORM,

        plateLetters: ["", "", ""],

        vehicleType: "OWNER",
      };

      state.showVehicleForm = true;

      state.vehicleError = "";
    },

    openEditVehicle(state, action) {
      const { ownerId, vehicle } = action.payload;

      state.vehicleOwnerId = ownerId;

      state.editingVehicleId = vehicle.id;

      state.vehicleForm = {
        plateLetters: Array.isArray(vehicle.plateLetters)
          ? [
              vehicle.plateLetters[0] || "",

              vehicle.plateLetters[1] || "",

              vehicle.plateLetters[2] || "",
            ]
          : ["", "", ""],

        plateNumbers: vehicle.plateNumbers || vehicle.plateNumber || "",

        vehicleType: vehicle.vehicleType || vehicle.type || "OWNER",

        brand: vehicle.brand || "",

        color: vehicle.color || "",

        licenseFile: vehicle.licenseFile || null,

        licenseFileName:
          vehicle.licenseFileName || vehicle.licenseFile?.name || "",
      };

      state.showVehicleForm = true;

      state.vehicleError = "";
    },

    closeVehicleForm(state) {
      state.showVehicleForm = false;

      state.vehicleOwnerId = null;

      state.editingVehicleId = null;

      state.vehicleForm = {
        ...EMPTY_VEHICLE_FORM,

        plateLetters: ["", "", ""],
      };

      state.vehicleError = "";
    },

    addVehicleLocal(state, action) {
      const { ownerId, vehicle } = action.payload;

      const owner = state.owners.find((item) => item.id === ownerId);

      if (!owner) return;

      owner.vehicles.push(
        normalizeVehicle({
          ...vehicle,

          ownerId,

          vehicleType: vehicle.vehicleType || "OWNER",

          id: vehicle.id || Date.now(),
        }),
      );
    },

    updateVehicleLocal(state, action) {
      const { ownerId, vehicleId, changes } = action.payload;

      const owner = state.owners.find((item) => item.id === ownerId);

      if (!owner) return;

      const vehicle = owner.vehicles.find((item) => item.id === vehicleId);

      if (!vehicle) return;

      Object.assign(vehicle, changes);
    },

    deleteVehicleLocal(state, action) {
      const { ownerId, vehicleId } = action.payload;

      const owner = state.owners.find((item) => item.id === ownerId);

      if (!owner) return;

      owner.vehicles = owner.vehicles.filter(
        (vehicle) => vehicle.id !== vehicleId,
      );
    },

    setVehicleStatus(state, action) {
      const { vehicleId, status } = action.payload;

      for (const owner of state.owners) {
        const vehicle = owner.vehicles.find((item) => item.id === vehicleId);

        if (vehicle) {
          vehicle.status = status;
          break;
        }
      }
    },

    toggleOwnerStatus(state, action) {
      const owner = state.owners.find((item) => item.id === action.payload);

      if (!owner) return;

      owner.active = !owner.active;

      owner.status = owner.active ? "ACTIVE" : "INACTIVE";
    },

    clearRegisteredOwner(state) {
      state.success = false;
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
           REGISTER OWNER
        ===================================================== */

    builder
      .addCase(registerOwner.pending, (state) => {
        state.submittingOwner = true;

        state.error = "";
        state.success = false;
      })

      .addCase(registerOwner.fulfilled, (state, action) => {
        state.submittingOwner = false;

        state.error = "";
        state.success = true;

        if (action.payload?.owner) {
          state.owners.unshift(action.payload.owner);
        }

        state.form = {
          ...EMPTY_OWNER_FORM,
        };

        state.editingOwnerId = null;
      })

      .addCase(registerOwner.rejected, (state, action) => {
        state.submittingOwner = false;

        state.success = false;

        state.error = action.payload || "Failed to register owner.";
      });

    /* =====================================================
           PASSWORD RECOVERY
        ===================================================== */

    builder
      .addCase(sendOwnerPasswordRecovery.pending, (state) => {
        state.sendingPasswordRecovery = true;
        state.error = "";
      })
      .addCase(sendOwnerPasswordRecovery.fulfilled, (state) => {
        state.sendingPasswordRecovery = false;
        state.error = "";
      })
      .addCase(sendOwnerPasswordRecovery.rejected, (state, action) => {
        state.sendingPasswordRecovery = false;
        state.error = action.payload || "Failed to send password recovery message.";
      });

    /* =====================================================
           FETCH OWNERS
        ===================================================== */

    builder
      .addCase(fetchOwners.pending, (state) => {
        state.loadingOwners = true;

        state.error = "";
      })

      .addCase(fetchOwners.fulfilled, (state, action) => {
        state.loadingOwners = false;

        state.owners = action.payload;

        state.error = "";
      })

      .addCase(fetchOwners.rejected, (state, action) => {
        state.loadingOwners = false;

        state.error = action.payload || "Failed to load owners.";
      });

    /* =====================================================
           UPDATE OWNER
        ===================================================== */

    builder
      .addCase(updateOwner.pending, (state) => {
        state.submittingOwner = true;

        state.error = "";
      })

      .addCase(updateOwner.fulfilled, (state, action) => {
        state.submittingOwner = false;

        const updated = action.payload;

        if (!updated) return;

        const index = state.owners.findIndex(
          (owner) => owner.id === updated.id,
        );

        if (index !== -1) {
          const oldOwner = state.owners[index];

          state.owners[index] = {
            ...oldOwner,
            ...updated,

            vehicles: updated.vehicles?.length
              ? updated.vehicles
              : oldOwner.vehicles,
          };
        }

        state.form = {
          ...EMPTY_OWNER_FORM,
        };

        state.editingOwnerId = null;

        state.success = true;
      })

      .addCase(updateOwner.rejected, (state, action) => {
        state.submittingOwner = false;

        state.error = action.payload || "Failed to update owner.";
      });

    /* =====================================================
           DELETE OWNER
        ===================================================== */

    builder
      .addCase(deleteOwner.pending, (state) => {
        state.deletingOwner = true;

        state.error = "";
      })

      .addCase(deleteOwner.fulfilled, (state, action) => {
        state.deletingOwner = false;

        state.owners = state.owners.filter(
          (owner) => owner.id !== action.payload,
        );

        if (state.editingOwnerId === action.payload) {
          state.form = {
            ...EMPTY_OWNER_FORM,
          };

          state.editingOwnerId = null;
        }
      })

      .addCase(deleteOwner.rejected, (state, action) => {
        state.deletingOwner = false;

        state.error = action.payload || "Failed to delete owner.";
      });

    /* =====================================================
           ADD VEHICLE
        ===================================================== */

    builder
      .addCase(addVehicleApi.pending, (state) => {
        state.submittingVehicle = true;

        state.vehicleError = "";
      })

      .addCase(addVehicleApi.fulfilled, (state, action) => {
        state.submittingVehicle = false;

        const { ownerId, vehicle } = action.payload;

        const owner = state.owners.find((item) => item.id === ownerId);

        if (owner && vehicle) {
          owner.vehicles.push(vehicle);
        }

        state.showVehicleForm = false;

        state.vehicleOwnerId = null;

        state.editingVehicleId = null;

        state.vehicleForm = {
          ...EMPTY_VEHICLE_FORM,

          plateLetters: ["", "", ""],
        };
      })

      .addCase(addVehicleApi.rejected, (state, action) => {
        state.submittingVehicle = false;

        state.vehicleError = action.payload || "Failed to add vehicle.";
      });

    /* =====================================================
           UPDATE VEHICLE
        ===================================================== */

    builder
      .addCase(updateVehicleApi.pending, (state) => {
        state.submittingVehicle = true;

        state.vehicleError = "";
      })

      .addCase(updateVehicleApi.fulfilled, (state, action) => {
        state.submittingVehicle = false;

        const updated = action.payload;

        if (!updated) return;

        for (const owner of state.owners) {
          const index = owner.vehicles.findIndex(
            (vehicle) => vehicle.id === updated.id,
          );

          if (index !== -1) {
            const old = owner.vehicles[index];

            owner.vehicles[index] = {
              ...old,
              ...updated,

              status: updated.status || old.status || "pending",
            };

            break;
          }
        }

        state.showVehicleForm = false;

        state.vehicleOwnerId = null;

        state.editingVehicleId = null;

        state.vehicleForm = {
          ...EMPTY_VEHICLE_FORM,

          plateLetters: ["", "", ""],
        };
      })

      .addCase(updateVehicleApi.rejected, (state, action) => {
        state.submittingVehicle = false;

        state.vehicleError = action.payload || "Failed to update vehicle.";
      });

    /* =====================================================
           DELETE VEHICLE
        ===================================================== */

    builder
      .addCase(deleteVehicleApi.pending, (state) => {
        state.vehicleError = "";
      })

      .addCase(deleteVehicleApi.fulfilled, (state, action) => {
        const { ownerId, vehicleId } = action.payload;

        const owner = state.owners.find((item) => item.id === ownerId);

        if (owner) {
          owner.vehicles = owner.vehicles.filter(
            (vehicle) => vehicle.id !== vehicleId,
          );
        }
      })

      .addCase(deleteVehicleApi.rejected, (state, action) => {
        state.vehicleError = action.payload || "Failed to delete vehicle.";
      });

    /* =====================================================
           VEHICLE STATUS
        ===================================================== */

    builder
      .addCase(updateVehicleStatusApi.pending, (state) => {
        state.vehicleError = "";
      })

      .addCase(updateVehicleStatusApi.fulfilled, (state, action) => {
        const { vehicle } = action.payload;

        for (const owner of state.owners) {
          const index = owner.vehicles.findIndex(
            (item) => item.id === vehicle.id,
          );

          if (index !== -1) {
            owner.vehicles[index] = {
              ...owner.vehicles[index],
              ...vehicle,
            };
            break;
          }
        }
      })

      .addCase(updateVehicleStatusApi.rejected, (state, action) => {
        state.vehicleError = action.payload || "Failed to update vehicle status.";
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setOwnerFormField,
  setOwnerForm,
  resetOwnerForm,
  startEditOwner,
  setOwnerSearch,
  setOwnerSort,
  clearOwnerError,

  setVehicleFormField,
  setVehicleForm,
  setVehiclePlateLetters,
  setVehiclePlateNumbers,
  setVehicleType,

  openAddVehicle,
  openEditVehicle,
  closeVehicleForm,

  addVehicleLocal,
  updateVehicleLocal,
  deleteVehicleLocal,

  setVehicleStatus,

  toggleOwnerStatus,

  clearRegisteredOwner,
} = ownerRegistrationSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectOwnerRegistration = (state) => state.ownerRegistration;

export const selectOwnerForm = (state) =>
  state.ownerRegistration?.form || EMPTY_OWNER_FORM;

export const selectOwners = (state) => state.ownerRegistration?.owners || [];

export const selectOwnerSearch = (state) =>
  state.ownerRegistration?.search || "";

export const selectOwnerSort = (state) =>
  state.ownerRegistration?.sortConfig || {
    key: "",
    direction: "asc",
  };

export const selectEditingOwnerId = (state) =>
  state.ownerRegistration?.editingOwnerId || null;

export const selectVehicleForm = (state) =>
  state.ownerRegistration?.vehicleForm || EMPTY_VEHICLE_FORM;

export const selectVehicleOwnerId = (state) =>
  state.ownerRegistration?.vehicleOwnerId || null;

export const selectEditingVehicleId = (state) =>
  state.ownerRegistration?.editingVehicleId || null;

export const selectShowVehicleForm = (state) =>
  state.ownerRegistration?.showVehicleForm || false;

export const selectLoadingOwners = (state) =>
  state.ownerRegistration?.loadingOwners || false;

export const selectSubmittingOwner = (state) =>
  state.ownerRegistration?.submittingOwner || false;

export const selectSubmittingVehicle = (state) =>
  state.ownerRegistration?.submittingVehicle || false;

export const selectOwnerError = (state) => state.ownerRegistration?.error || "";

export const selectVehicleError = (state) =>
  state.ownerRegistration?.vehicleError || "";

/* =========================================================
   REDUCER
========================================================= */

export default ownerRegistrationSlice.reducer;