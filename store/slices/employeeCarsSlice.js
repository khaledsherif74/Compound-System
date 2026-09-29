import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import api from "@/Services/api";

// =========================================================
// DIGIT CONVERSION
// =========================================================

const WESTERN_DIGITS = "0123456789";
const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const convertWesternToArabicIndic = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(
    /[0-9]/g,
    (digit) =>
      ARABIC_INDIC_DIGITS[
        WESTERN_DIGITS.indexOf(digit)
      ],
  );
};

const convertArabicIndicToWestern = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(
    /[٠-٩]/g,
    (digit) =>
      WESTERN_DIGITS[
        ARABIC_INDIC_DIGITS.indexOf(digit)
      ],
  );
};

// =========================================================
// INITIAL FORM
// =========================================================

const initialForm = {
  employee: "",
  employeePhone: "",
  employeeType: "",

  plateLetters: ["", "", ""],
  plateNumbers: "",

  brand: "",
  color: "",
};

// =========================================================
// NORMALIZE VEHICLE
// =========================================================

const normalizeVehicle = (vehicle) => {
  if (!vehicle) {
    return null;
  }

  const rawPlateLetters =
    vehicle?.plateLetters ??
    vehicle?.plate?.letters ??
    "";

  const rawPlateNumbers =
    vehicle?.plateNumbers ??
    vehicle?.plate?.numbers ??
    "";

  let plateLetters = [];

  if (Array.isArray(rawPlateLetters)) {
    plateLetters = rawPlateLetters;
  } else {
    plateLetters = String(rawPlateLetters)
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  plateLetters = [
    plateLetters[0] || "",
    plateLetters[1] || "",
    plateLetters[2] || "",
  ];

  const employeeName =
    vehicle?.employee ??
    vehicle?.employeeName ??
    vehicle?.ownerName ??
    vehicle?.user?.name ??
    "";

  const employeePhone =
    vehicle?.employeePhone ??
    vehicle?.phone ??
    vehicle?.employee?.phone ??
    "";

  const employeeType =
    vehicle?.employeeType ??
    vehicle?.type ??
    "EMPLOYEE";

  const brand =
    vehicle?.brand ??
    vehicle?.vehicleBrand ??
    vehicle?.make ??
    "";

  const color =
    vehicle?.color ??
    vehicle?.vehicleColor ??
    "";

  const allowed =
    vehicle?.allowed ??
    vehicle?.isAllowed ??
    vehicle?.gateAccess ??
    vehicle?.accessAllowed ??
    vehicle?.user?.isActive ??
    true;

  const id =
    vehicle?.id ??
    vehicle?._id ??
    vehicle?.vehicleId;

  return {
    ...vehicle,

    id,

    employee: employeeName,
    employeeName,

    employeePhone,

    employeeType,

    plateLetters,

    plateNumbers:
      convertWesternToArabicIndic(
        rawPlateNumbers,
      ),

    brand,

    color,

    allowed: Boolean(allowed),
  };
};

// =========================================================
// GET USER ID FOR EMPLOYEE CAR
// =========================================================

export const getEmployeeCarUserId = (
  car,
) => {
  return (
    car?.userId ??
    car?.employeeId ??
    car?.ownerId ??
    car?.user?.id ??
    car?.id
  );
};

// =========================================================
// EXTRACT VEHICLES FROM API RESPONSE
// =========================================================

const extractVehicles = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.vehicles)) {
    return data.vehicles;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.vehicles)) {
    return data.data.vehicles;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

// =========================================================
// API ERROR HELPER
// =========================================================

const getApiError = (error) => {
  const responseData =
    error?.response?.data;

  if (
    typeof responseData?.message ===
    "string"
  ) {
    return responseData.message;
  }

  if (
    typeof responseData?.error ===
    "string"
  ) {
    return responseData.error;
  }

  if (
    Array.isArray(responseData?.errors) &&
    responseData.errors.length > 0
  ) {
    const firstError =
      responseData.errors[0];

    if (
      typeof firstError === "string"
    ) {
      return firstError;
    }

    if (
      typeof firstError?.message ===
      "string"
    ) {
      return firstError.message;
    }

    if (
      typeof firstError?.msg ===
      "string"
    ) {
      return firstError.msg;
    }
  }

  if (
    typeof error?.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong.";
};

// =========================================================
// FETCH EMPLOYEE VEHICLES
// =========================================================

export const fetchEmployeeCars =
  createAsyncThunk(
    "employeeCars/fetchEmployeeCars",

    async (
      {
        page = 1,
        limit = 20,
      } = {},
      { rejectWithValue },
    ) => {
      try {
        const response =
          await api.get(
            `/vehicles?page=${page}&limit=${limit}`,
          );

        const data =
          response?.data;

        const vehicles =
          extractVehicles(data);

        return {
          vehicles:
            vehicles
              .map(normalizeVehicle)
              .filter(Boolean),

          pagination:
            data?.pagination ??
            data?.meta ??
            null,
        };
      } catch (error) {
        return rejectWithValue(
          getApiError(error),
        );
      }
    },
  );

// =========================================================
// FETCH SINGLE EMPLOYEE VEHICLE
// =========================================================

export const fetchEmployeeCarById =
  createAsyncThunk(
    "employeeCars/fetchEmployeeCarById",

    async (
      vehicleId,
      { rejectWithValue },
    ) => {
      try {
        if (!vehicleId) {
          return rejectWithValue(
            "Vehicle ID is required.",
          );
        }

        const response =
          await api.get(
            `/vehicles/${vehicleId}`,
          );

        const data =
          response?.data;

        const vehicle =
          data?.vehicle ??
          data?.data ??
          data;

        return normalizeVehicle(
          vehicle,
        );
      } catch (error) {
        return rejectWithValue(
          getApiError(error),
        );
      }
    },
  );

// =========================================================
// CREATE EMPLOYEE VEHICLE
//
// POST /vehicles
//
// IMPORTANT:
// vehicleType IS required for creating
// an employee vehicle.
// =========================================================

export const createEmployeeCar =
  createAsyncThunk(
    "employeeCars/createEmployeeCar",

    async (
      payload,
      { rejectWithValue },
    ) => {
      try {
        const apiPayload = {
          vehicleType:
            payload?.vehicleType ||
            "EMPLOYEE",

          plateLetters:
            String(
              payload?.plateLetters ??
                "",
            ).trim(),

          plateNumbers:
            convertArabicIndicToWestern(
              payload?.plateNumbers,
            ),

          brand:
            String(
              payload?.brand ?? "",
            ).trim(),

          color:
            String(
              payload?.color ?? "",
            ).trim(),

          employeeName:
            String(
              payload?.employeeName ??
                payload?.employee ??
                "",
            ).trim(),

          employeePhone:
            String(
              payload?.employeePhone ??
                "",
            ).trim(),

          employeeType:
            String(
              payload?.employeeType ??
                "EMPLOYEE",
            ).trim(),
        };

        const response =
          await api.post(
            "/vehicles",
            apiPayload,
          );

        const data =
          response?.data;

        const vehicle =
          data?.vehicle ??
          data?.data ??
          data;

        return normalizeVehicle(
          vehicle,
        );
      } catch (error) {
        return rejectWithValue(
          getApiError(error),
        );
      }
    },
  );

// =========================================================
// UPDATE EMPLOYEE VEHICLE
//
// PATCH /vehicles/:vehicleId
//
// IMPORTANT:
// DO NOT SEND vehicleType HERE.
//
// The backend PATCH validation rejects:
// "vehicleType" is not allowed
// =========================================================

export const updateEmployeeCar =
  createAsyncThunk(
    "employeeCars/updateEmployeeCar",

    async (
      { id, payload },
      { rejectWithValue },
    ) => {
      try {
        if (!id) {
          return rejectWithValue(
            "Vehicle ID is required.",
          );
        }

        // =================================================
        // IMPORTANT:
        // Do NOT use:
        //
        // const apiPayload = {
        //   ...payload,
        //   vehicleType: ...
        // };
        //
        // because vehicleType is not allowed by
        // the backend PATCH endpoint.
        // =================================================

        const apiPayload = {
          plateLetters:
            String(
              payload?.plateLetters ??
                "",
            ).trim(),

          plateNumbers:
            convertArabicIndicToWestern(
              payload?.plateNumbers,
            ),

          brand:
            String(
              payload?.brand ?? "",
            ).trim(),

          color:
            String(
              payload?.color ?? "",
            ).trim(),

          employeeName:
            String(
              payload?.employeeName ??
                payload?.employee ??
                "",
            ).trim(),

          employeePhone:
            String(
              payload?.employeePhone ??
                "",
            ).trim(),

          employeeType:
            String(
              payload?.employeeType ??
                "",
            ).trim(),
        };

        const response =
          await api.patch(
            `/vehicles/${id}`,
            apiPayload,
          );

        const data =
          response?.data;

        const vehicle =
          data?.vehicle ??
          data?.data ??
          data;

        return normalizeVehicle(
          vehicle,
        );
      } catch (error) {
        return rejectWithValue(
          getApiError(error),
        );
      }
    },
  );

// =========================================================
// UPDATE EMPLOYEE VEHICLE STATUS
//
// PATCH /users/:userId/disable
// =========================================================

export const updateEmployeeCarStatus =
  createAsyncThunk(
    "employeeCars/updateEmployeeCarStatus",

    async (
      {
        userId,
        allowed,
      },
      { rejectWithValue },
    ) => {
      try {
        if (!userId) {
          return rejectWithValue(
            "User ID is required.",
          );
        }

        const response =
          await api.patch(
            `/users/${userId}/disable`,
            {
              isActive: Boolean(
                allowed,
              ),
            },
          );

        return {
          userId,
          allowed: Boolean(
            allowed,
          ),
          response:
            response?.data,
        };
      } catch (error) {
        return rejectWithValue(
          getApiError(error),
        );
      }
    },
  );

// =========================================================
// DELETE EMPLOYEE VEHICLE
// =========================================================

export const deleteEmployeeCar =
  createAsyncThunk(
    "employeeCars/deleteEmployeeCar",

    async (
      vehicleId,
      { rejectWithValue },
    ) => {
      try {
        if (!vehicleId) {
          return rejectWithValue(
            "Vehicle ID is required.",
          );
        }

        await api.delete(
          `/vehicles/${vehicleId}`,
        );

        return vehicleId;
      } catch (error) {
        return rejectWithValue(
          getApiError(error),
        );
      }
    },
  );

// =========================================================
// SLICE
// =========================================================

const employeeCarsSlice =
  createSlice({
    name: "employeeCars",

    initialState: {
      cars: [],

      form: {
        ...initialForm,
      },

      search: "",

      sortConfig: {
        key: null,
        direction: "asc",
      },

      colorSearch: "",

      editingCarId: null,

      loading: false,

      loadingCars: false,

      loadingEmployeeCar: false,

      submitting: false,

      updating: false,

      deleting: false,

      statusUpdating: false,

      error: null,

      success: null,

      pagination: null,
    },

    reducers: {
      // ===================================================
      // FORM
      // ===================================================

      updateFormField: (
        state,
        action,
      ) => {
        const {
          name,
          value,
        } = action.payload || {};

        if (!name) {
          return;
        }

        state.form[name] = value;
      },

      updatePlateLetter: (
        state,
        action,
      ) => {
        const {
          index,
          value,
        } = action.payload || {};

        if (
          index < 0 ||
          index > 2
        ) {
          return;
        }

        state.form.plateLetters[
          index
        ] = value;
      },

      updatePlateNumbers: (
        state,
        action,
      ) => {
        state.form.plateNumbers =
          action.payload ?? "";
      },

      resetForm: (state) => {
        state.form = {
          ...initialForm,
          plateLetters: [
            "",
            "",
            "",
          ],
        };

        state.editingCarId = null;
      },

      // ===================================================
      // EDIT
      // ===================================================

      startEditCar: (
        state,
        action,
      ) => {
        state.editingCarId =
          action.payload;
      },

      cancelEditCar: (state) => {
        state.editingCarId = null;

        state.form = {
          ...initialForm,
          plateLetters: [
            "",
            "",
            "",
          ],
        };
      },

      // ===================================================
      // SEARCH
      // ===================================================

      setSearch: (
        state,
        action,
      ) => {
        state.search =
          action.payload ?? "";
      },

      setColorSearch: (
        state,
        action,
      ) => {
        state.colorSearch =
          action.payload ?? "";
      },

      // ===================================================
      // SORT
      // ===================================================

      setSort: (
        state,
        action,
      ) => {
        const {
          key,
          direction,
        } = action.payload || {};

        state.sortConfig = {
          key:
            key ??
            state.sortConfig.key,

          direction:
            direction ??
            state.sortConfig.direction,
        };
      },

      // ===================================================
      // ERRORS / SUCCESS
      // ===================================================

      clearError: (state) => {
        state.error = null;
      },

      clearSuccess: (state) => {
        state.success = null;
      },

      clearMessages: (state) => {
        state.error = null;
        state.success = null;
      },

      // ===================================================
      // LOCAL CAR ACTIONS
      // ===================================================

      addCar: (
        state,
        action,
      ) => {
        const vehicle =
          normalizeVehicle(
            action.payload,
          );

        if (vehicle) {
          state.cars.push(vehicle);
        }
      },

      updateCar: (
        state,
        action,
      ) => {
        const {
          id,
          car,
        } = action.payload || {};

        const index =
          state.cars.findIndex(
            (item) =>
              item.id === id,
          );

        if (
          index !== -1 &&
          car
        ) {
          state.cars[index] =
            normalizeVehicle(car);
        }
      },

      deleteCar: (
        state,
        action,
      ) => {
        state.cars =
          state.cars.filter(
            (car) =>
              car.id !==
              action.payload,
          );
      },

      toggleCarAccess: (
        state,
        action,
      ) => {
        const id =
          action.payload;

        const car =
          state.cars.find(
            (item) =>
              item.id === id,
          );

        if (car) {
          car.allowed =
            !car.allowed;
        }
      },

      setCars: (
        state,
        action,
      ) => {
        state.cars =
          Array.isArray(
            action.payload,
          )
            ? action.payload
                .map(
                  normalizeVehicle,
                )
                .filter(Boolean)
            : [];
      },
    },

    extraReducers: (
      builder,
    ) => {
      // ===================================================
      // FETCH ALL
      // ===================================================

      builder
        .addCase(
          fetchEmployeeCars.pending,
          (state) => {
            state.loading = true;
            state.loadingCars = true;
            state.error = null;
          },
        )

        .addCase(
          fetchEmployeeCars.fulfilled,
          (
            state,
            action,
          ) => {
            state.loading = false;
            state.loadingCars =
              false;

            state.cars =
              action.payload
                ?.vehicles ?? [];

            state.pagination =
              action.payload
                ?.pagination ??
              null;
          },
        )

        .addCase(
          fetchEmployeeCars.rejected,
          (
            state,
            action,
          ) => {
            state.loading = false;
            state.loadingCars =
              false;

            state.error =
              action.payload ||
              "Failed to fetch employee vehicles.";
          },
        );

      // ===================================================
      // FETCH SINGLE
      // ===================================================

      builder
        .addCase(
          fetchEmployeeCarById.pending,
          (state) => {
            state.loadingEmployeeCar =
              true;
            state.error = null;
          },
        )

        .addCase(
          fetchEmployeeCarById.fulfilled,
          (
            state,
            action,
          ) => {
            state.loadingEmployeeCar =
              false;

            const vehicle =
              action.payload;

            if (!vehicle) {
              return;
            }

            const index =
              state.cars.findIndex(
                (car) =>
                  car.id ===
                  vehicle.id,
              );

            if (index === -1) {
              state.cars.push(
                vehicle,
              );
            } else {
              state.cars[index] =
                vehicle;
            }
          },
        )

        .addCase(
          fetchEmployeeCarById.rejected,
          (
            state,
            action,
          ) => {
            state.loadingEmployeeCar =
              false;

            state.error =
              action.payload ||
              "Failed to fetch employee vehicle.";
          },
        );

      // ===================================================
      // CREATE
      // ===================================================

      builder
        .addCase(
          createEmployeeCar.pending,
          (state) => {
            state.submitting =
              true;

            state.error = null;
            state.success = null;
          },
        )

        .addCase(
          createEmployeeCar.fulfilled,
          (
            state,
            action,
          ) => {
            state.submitting =
              false;

            const vehicle =
              action.payload;

            if (vehicle) {
              state.cars.push(
                vehicle,
              );
            }

            state.form = {
              ...initialForm,
              plateLetters: [
                "",
                "",
                "",
              ],
            };

            state.editingCarId =
              null;

            state.success =
              "Employee vehicle added successfully.";
          },
        )

        .addCase(
          createEmployeeCar.rejected,
          (
            state,
            action,
          ) => {
            state.submitting =
              false;

            state.error =
              action.payload ||
              "Failed to add employee vehicle.";
          },
        );

      // ===================================================
      // UPDATE
      // ===================================================

      builder
        .addCase(
          updateEmployeeCar.pending,
          (state) => {
            state.updating =
              true;

            state.error = null;
            state.success = null;
          },
        )

        .addCase(
          updateEmployeeCar.fulfilled,
          (
            state,
            action,
          ) => {
            state.updating =
              false;

            const vehicle =
              action.payload;

            if (vehicle) {
              const index =
                state.cars.findIndex(
                  (car) =>
                    car.id ===
                    vehicle.id,
                );

              if (index !== -1) {
                state.cars[index] =
                  vehicle;
              } else {
                state.cars.push(
                  vehicle,
                );
              }
            }

            state.form = {
              ...initialForm,
              plateLetters: [
                "",
                "",
                "",
              ],
            };

            state.editingCarId =
              null;

            state.success =
              "Employee vehicle updated successfully.";
          },
        )

        .addCase(
          updateEmployeeCar.rejected,
          (
            state,
            action,
          ) => {
            state.updating =
              false;

            state.error =
              action.payload ||
              "Failed to update employee vehicle.";
          },
        );

      // ===================================================
      // UPDATE STATUS
      // ===================================================

      builder
        .addCase(
          updateEmployeeCarStatus.pending,
          (state) => {
            state.statusUpdating =
              true;

            state.error = null;
          },
        )

        .addCase(
          updateEmployeeCarStatus.fulfilled,
          (
            state,
            action,
          ) => {
            state.statusUpdating =
              false;

            const {
              userId,
              allowed,
            } =
              action.payload || {};

            const car =
              state.cars.find(
                (item) =>
                  getEmployeeCarUserId(
                    item,
                  ) === userId,
              );

            if (car) {
              car.allowed =
                Boolean(
                  allowed,
                );
            }

            state.success =
              allowed
                ? "Gate access enabled successfully."
                : "Gate access disabled successfully.";
          },
        )

        .addCase(
          updateEmployeeCarStatus.rejected,
          (
            state,
            action,
          ) => {
            state.statusUpdating =
              false;

            state.error =
              action.payload ||
              "Failed to update gate access.";
          },
        );

      // ===================================================
      // DELETE
      // ===================================================

      builder
        .addCase(
          deleteEmployeeCar.pending,
          (state) => {
            state.deleting =
              true;

            state.error = null;
            state.success = null;
          },
        )

        .addCase(
          deleteEmployeeCar.fulfilled,
          (
            state,
            action,
          ) => {
            state.deleting =
              false;

            state.cars =
              state.cars.filter(
                (car) =>
                  car.id !==
                  action.payload,
              );

            state.success =
              "Employee vehicle deleted successfully.";
          },
        )

        .addCase(
          deleteEmployeeCar.rejected,
          (
            state,
            action,
          ) => {
            state.deleting =
              false;

            state.error =
              action.payload ||
              "Failed to delete employee vehicle.";
          },
        );
    },
  });

// =========================================================
// EXPORT ACTIONS
// =========================================================

export const {
  updateFormField,
  updatePlateLetter,
  updatePlateNumbers,
  resetForm,

  startEditCar,
  cancelEditCar,

  setSearch,
  setColorSearch,
  setSort,

  clearError,
  clearSuccess,
  clearMessages,

  addCar,
  updateCar,
  deleteCar,
  toggleCarAccess,
  setCars,
} =
  employeeCarsSlice.actions;

// =========================================================
// EXPORT REDUCER
// =========================================================

export default employeeCarsSlice.reducer;

// =========================================================
// EXPORT HELPERS
// =========================================================

export {
  convertWesternToArabicIndic,
  convertArabicIndicToWestern,
  normalizeVehicle,
};