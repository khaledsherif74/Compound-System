import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/Services/api";

/* =========================================================
   HELPERS
========================================================= */

const getApiError = (error, fallback = "Something went wrong.") => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  );
};

/* =========================================================
   NORMALIZE ROLE
========================================================= */

const normalizeRole = (role) => {
  if (!role) {
    return "";
  }

  const value = String(role).trim().toUpperCase();

  switch (value) {
    case "ADMIN":
      return "Admin";

    case "SUB_ADMIN":
      return "Sub Admin";

    case "OWNER":
      return "Owner";

    case "SUPERVISOR":
      return "Supervisor";

    case "ROLLER":
      return "Roller";

    case "SECURITY":
      return "Security";

    default:
      return String(role)
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

/* =========================================================
   GET FULL NAME
========================================================= */

const getFullName = (user) => {
  if (!user) {
    return "";
  }

  if (
    typeof user.fullName === "string" &&
    user.fullName.trim() !== ""
  ) {
    return user.fullName.trim();
  }

  if (
    typeof user.name === "string" &&
    user.name.trim() !== ""
  ) {
    return user.name.trim();
  }

  const firstName =
    typeof user.firstName === "string"
      ? user.firstName.trim()
      : "";

  const lastName =
    typeof user.lastName === "string"
      ? user.lastName.trim()
      : "";

  return `${firstName} ${lastName}`.trim();
};

/* =========================================================
   GET UNIT NUMBER
========================================================= */

const getUnitNumber = (user) => {
  if (!user) {
    return "";
  }

  if (
    user.unit &&
    typeof user.unit === "object"
  ) {
    return (
      user.unit.unitCode ||
      user.unit.code ||
      user.unit.number ||
      user.unit.name ||
      ""
    );
  }

  if (
    typeof user.unit === "string" &&
    user.unit.trim() !== ""
  ) {
    return user.unit.trim();
  }

  return (
    user.unitCode ??
    user.unitNumber ??
    ""
  );
};

/* =========================================================
   GET ACTIVE STATUS
========================================================= */

const getIsActive = (user) => {
  if (!user) {
    return true;
  }

  if (typeof user.isActive === "boolean") {
    return user.isActive;
  }

  if (typeof user.active === "boolean") {
    return user.active;
  }

  if (typeof user.status === "string") {
    return user.status.toLowerCase() === "active";
  }

  return true;
};

/* =========================================================
   NORMALIZE USER
========================================================= */

export const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const role = normalizeRole(
    user.role ||
      user.userRole ||
      user.roleName
  );

  const isActive = getIsActive(user);

  /*
   * Supervisor / Roller / Security / Admin / Sub Admin
   * are always limited to one vehicle.
   *
   * Owner gets the backend vehicle limit.
   */
  let vehicleLimit = 1;

  if (role === "Owner") {
    vehicleLimit =
      user.maxVehicles ??
      user.vehicleLimit ??
      user.vehicle_limit ??
      0;
  }

  return {
    ...user,

    id:
      user.id ??
      user.userId ??
      user._id,

    username:
      user.username ??
      user.userName ??
      "",

    firstName:
      user.firstName ??
      "",

    lastName:
      user.lastName ??
      "",

    fullName: getFullName(user),

    email:
      user.email ??
      "",

    phone:
      user.phone ??
      user.phoneNumber ??
      "",

    unitNumber: getUnitNumber(user),

    role,

    isActive,

    status: isActive
      ? "Active"
      : "Inactive",

    vehicleLimit,
  };
};

/* =========================================================
   EXTRACT USERS FROM RESPONSE
========================================================= */

const extractUsers = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.users)) {
    return data.data.users;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

/* =========================================================
   GET USERS
   GET /users
========================================================= */

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users");

      const users = extractUsers(response.data)
        .map(normalizeUser)
        .filter(Boolean);

      return users;
    } catch (error) {
      return rejectWithValue(
        getApiError(
          error,
          "Failed to load users."
        )
      );
    }
  }
);

/* =========================================================
   CREATE USER
   POST /users
========================================================= */

export const registerUser = createAsyncThunk(
  "users/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const roleValue = String(
        userData.role || ""
      ).trim();

      const role = roleValue
        .toUpperCase()
        .replace(/\s+/g, "_");

      const payload = {
        firstName:
          userData.firstName?.trim() || "",

        lastName:
          userData.lastName?.trim() || "",

        username:
          userData.username?.trim() || "",

        phone:
          userData.phone?.trim() || "",

        password:
          userData.password || "",

        role,
      };

      /*
       * Email is required by the backend for
       * Sub Admin and is also supported for Owner.
       */
      if (
        role === "SUB_ADMIN" ||
        role === "OWNER"
      ) {
        payload.email =
          userData.email?.trim() || "";
      }

      /*
       * Owner-specific fields.
       */
      if (role === "OWNER") {
        if (
          userData.unitCode !== undefined
        ) {
          payload.unitCode =
            userData.unitCode;
        }

        if (
          userData.maxVehicles !== undefined
        ) {
          payload.maxVehicles =
            Number(userData.maxVehicles);
        } else if (
          userData.vehicleLimit !== undefined
        ) {
          payload.maxVehicles =
            Number(userData.vehicleLimit);
        }
      }

      const response = await api.post(
        "/users",
        payload
      );

      const responseData =
        response.data;

      const createdUser =
        responseData?.data?.user ??
        responseData?.data ??
        responseData?.user ??
        responseData;

      return normalizeUser(createdUser);
    } catch (error) {
      return rejectWithValue(
        getApiError(
          error,
          "Failed to create user."
        )
      );
    }
  }
);

/* =========================================================
   SEND USER PASSWORD RECOVERY
   POST /users/:userId/password-reset
========================================================= */

export const sendUserPasswordRecovery = createAsyncThunk(
  "users/sendUserPasswordRecovery",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("User ID is required.");
      }

      await api.post(`/users/${id}/password-reset`);

      return id;
    } catch (error) {
      return rejectWithValue(
        getApiError(error, "Failed to send password recovery message."),
      );
    }
  },
);

/* =========================================================
   CREATE SUB ADMIN
   POST /users
========================================================= */

export const registerSubAdmin = createAsyncThunk(
  "users/registerSubAdmin",
  async (userData, { rejectWithValue }) => {
    try {
      const email = userData?.email?.trim() || "";
      const password = userData?.password || "";

      if (!email) {
        return rejectWithValue("Email is required for a Sub Admin.");
      }

      if (password.length < 6) {
        return rejectWithValue("Password must contain at least 6 characters.");
      }

      const payload = {
        firstName: userData.firstName?.trim() || "",
        lastName: userData.lastName?.trim() || "",
        username: userData.username?.trim() || "",
        phone: userData.phone?.trim() || "",
        email,
        password,
        role: "SUB_ADMIN",
      };

      const response = await api.post("/users", payload);
      const responseData = response.data;

      const createdUser =
        responseData?.data?.user ??
        responseData?.data ??
        responseData?.user ??
        responseData;

      return normalizeUser(createdUser);
    } catch (error) {
      return rejectWithValue(
        getApiError(error, "Failed to create Sub Admin."),
      );
    }
  },
);

/* =========================================================
   UPDATE USER
   PATCH /users/:userId
========================================================= */

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    { id, data },
    { rejectWithValue, getState }
  ) => {
    try {
      if (!id) {
        return rejectWithValue(
          "User ID is required."
        );
      }

      const users =
        getState().users?.items || [];

      const existingUser =
        users.find(
          (user) =>
            String(user.id) ===
            String(id)
        );

      const roleValue = String(
        data?.role ||
          existingUser?.role ||
          ""
      ).trim();

      const role = roleValue
        .toUpperCase()
        .replace(/\s+/g, "_");

      const fullName =
        data?.fullName ??
        existingUser?.fullName ??
        "";

      const nameParts =
        String(fullName)
          .trim()
          .split(/\s+/)
          .filter(Boolean);

      const payload = {
        firstName:
          data?.firstName ??
          nameParts[0] ??
          existingUser?.firstName ??
          "",

        lastName:
          data?.lastName ??
          nameParts
            .slice(1)
            .join(" ") ??
          existingUser?.lastName ??
          "",

        username:
          data?.username ??
          existingUser?.username ??
          "",

        phone:
          data?.phone ??
          existingUser?.phone ??
          "",

        role,
      };

      /*
       * Owner / Sub Admin email.
       */
      if (
        role === "OWNER" ||
        role === "SUB_ADMIN"
      ) {
        if (
          data?.email !== undefined
        ) {
          payload.email =
            data.email;
        } else if (
          existingUser?.email
        ) {
          payload.email =
            existingUser.email;
        }
      }

      /*
       * Owner-specific fields.
       */
      if (role === "OWNER") {
        if (
          data?.maxVehicles !== undefined
        ) {
          payload.maxVehicles =
            Number(
              data.maxVehicles
            );
        } else if (
          data?.vehicleLimit !== undefined
        ) {
          payload.maxVehicles =
            Number(
              data.vehicleLimit
            );
        }
      }

      /*
       * Only send password if explicitly
       * provided.
       */
      if (
        data?.password &&
        String(data.password).trim()
      ) {
        payload.password =
          data.password;
      }

      const response =
        await api.patch(
          `/users/${id}`,
          payload
        );

      const responseData =
        response.data;

      const returnedUser =
        responseData?.data?.user ??
        responseData?.data ??
        responseData?.user ??
        null;

      const updatedUser = returnedUser
        ? {
            ...(existingUser || {}),
            ...returnedUser,
          }
        : {
            ...(existingUser || {}),
            ...data,
            id,
            role:
              data?.role ??
              existingUser?.role,
          };

      return normalizeUser(
        updatedUser
      );
    } catch (error) {
      return rejectWithValue(
        getApiError(
          error,
          "Failed to update user."
        )
      );
    }
  }
);

/* =========================================================
   DELETE USER
   DELETE /users/:userId
========================================================= */

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "User ID is required."
        );
      }

      await api.delete(
        `/users/${id}`
      );

      return id;
    } catch (error) {
      return rejectWithValue(
        getApiError(
          error,
          "Failed to delete user."
        )
      );
    }
  }
);

/* =========================================================
   UPDATE USER STATUS
   PATCH /users/:userId/disable
========================================================= */

export const updateUserStatus =
  createAsyncThunk(
    "users/updateUserStatus",

    async (
      { id, isActive },
      { rejectWithValue }
    ) => {
      try {
        if (!id) {
          return rejectWithValue(
            "User ID is required."
          );
        }

        if (
          typeof isActive !==
          "boolean"
        ) {
          return rejectWithValue(
            "isActive must be a boolean."
          );
        }

        await api.patch(
          `/users/${id}/disable`,
          {
            isActive,
          }
        );

        return {
          id,
          isActive,
        };
      } catch (error) {
        return rejectWithValue(
          getApiError(
            error,
            "Failed to update user status."
          )
        );
      }
    }
  );

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  items: [],

  loading: false,

  submitting: false,

  updatingStatusId: null,

  error: "",

  success: false,

  lastCreatedUser: null,
};

/* =========================================================
   SLICE
========================================================= */

const usersSlice = createSlice({
  name: "users",

  initialState,

  reducers: {
    clearUserError: (state) => {
      state.error = "";
    },

    clearUserSuccess: (state) => {
      state.success = false;
    },

    clearRegisteredUser: (state) => {
      state.lastCreatedUser =
        null;
    },

    clearUsers: (state) => {
      state.items = [];
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       FETCH USERS
    ===================================================== */

    builder.addCase(
      fetchUsers.pending,
      (state) => {
        state.loading = true;
        state.error = "";
      }
    );

    builder.addCase(
      fetchUsers.fulfilled,
      (state, action) => {
        state.loading = false;
        state.error = "";

        state.items =
          action.payload || [];
      }
    );

    builder.addCase(
      fetchUsers.rejected,
      (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          "Failed to load users.";
      }
    );

    /* =====================================================
       REGISTER USER
    ===================================================== */

    builder.addCase(
      registerUser.pending,
      (state) => {
        state.submitting = true;
        state.success = false;
        state.error = "";
      }
    );

    builder.addCase(
      registerUser.fulfilled,
      (state, action) => {
        state.submitting = false;
        state.success = true;
        state.error = "";

        state.lastCreatedUser =
          action.payload;

        if (action.payload?.id) {
          state.items.push(
            action.payload
          );
        }
      }
    );

    builder.addCase(
      registerUser.rejected,
      (state, action) => {
        state.submitting = false;
        state.success = false;

        state.error =
          action.payload ||
          "Failed to create user.";
      }
    );

    /* =====================================================
       UPDATE USER
    ===================================================== */

    builder
      .addCase(registerSubAdmin.pending, (state) => {
        state.submitting = true;
        state.error = "";
        state.success = false;
      })
      .addCase(registerSubAdmin.fulfilled, (state, action) => {
        state.submitting = false;
        state.error = "";
        state.success = true;
        state.lastCreatedUser = action.payload || null;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(registerSubAdmin.rejected, (state, action) => {
        state.submitting = false;
        state.success = false;
        state.error = action.payload || "Failed to create Sub Admin.";
      });

    builder.addCase(
      updateUser.pending,
      (state) => {
        state.submitting = true;
        state.success = false;
        state.error = "";
      }
    );

    builder.addCase(
      updateUser.fulfilled,
      (state, action) => {
        state.submitting = false;
        state.success = true;
        state.error = "";

        const updatedUser =
          action.payload;

        if (!updatedUser?.id) {
          return;
        }

        const index =
          state.items.findIndex(
            (user) =>
              String(user.id) ===
              String(
                updatedUser.id
              )
          );

        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...updatedUser,
          };
        }
      }
    );

    builder.addCase(
      updateUser.rejected,
      (state, action) => {
        state.submitting = false;
        state.success = false;

        state.error =
          action.payload ||
          "Failed to update user.";
      }
    );

    /* =====================================================
       DELETE USER
    ===================================================== */

    builder.addCase(
      deleteUser.pending,
      (state) => {
        state.error = "";
      }
    );

    builder.addCase(
      deleteUser.fulfilled,
      (state, action) => {
        state.error = "";

        state.items =
          state.items.filter(
            (user) =>
              String(user.id) !==
              String(action.payload)
          );
      }
    );

    builder.addCase(
      deleteUser.rejected,
      (state, action) => {
        state.error =
          action.payload ||
          "Failed to delete user.";
      }
    );

    /* =====================================================
       UPDATE STATUS
    ===================================================== */

    builder.addCase(
      updateUserStatus.pending,
      (state, action) => {
        state.updatingStatusId =
          action.meta.arg.id;

        state.error = "";
      }
    );

    builder.addCase(
      updateUserStatus.fulfilled,
      (state, action) => {
        state.updatingStatusId =
          null;

        state.error = "";

        const {
          id,
          isActive,
        } = action.payload;

        const user =
          state.items.find(
            (item) =>
              String(item.id) ===
              String(id)
          );

        if (user) {
          user.isActive =
            isActive;

          user.active =
            isActive;

          user.status =
            isActive
              ? "Active"
              : "Inactive";
        }
      }
    );

    builder.addCase(
      updateUserStatus.rejected,
      (state, action) => {
        state.updatingStatusId =
          null;

        state.error =
          action.payload ||
          "Failed to update user status.";
      }
    );
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearUserError,
  clearUserSuccess,
  clearRegisteredUser,
  clearUsers,
} = usersSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectUsers = (
  state
) =>
  state.users?.items || [];

export const selectUsersLoading = (
  state
) =>
  Boolean(
    state.users?.loading
  );

export const selectUserSubmitting = (
  state
) =>
  Boolean(
    state.users?.submitting
  );

export const selectUserError = (
  state
) =>
  state.users?.error || "";

export const selectUserSuccess = (
  state
) =>
  Boolean(
    state.users?.success
  );

export const selectLastCreatedUser = (
  state
) =>
  state.users
    ?.lastCreatedUser || null;

export const selectUserStatusUpdatingId = (
  state
) =>
  state.users
    ?.updatingStatusId || null;

export default usersSlice.reducer;