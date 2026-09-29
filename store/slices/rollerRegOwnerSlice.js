import { createSlice } from "@reduxjs/toolkit";

const createEmptyVehicleForm = () => ({
  plateLetters: ["", "", ""],
  plateNumbers: "",
  model: "",
  brand: "",
  color: "",
  licenseFile: null,
  licenseFileName: "",
});

const createEmptyOwnerForm = () => ({
  firstName: "",
  lastName: "",
  unitCode: "",
  phone: "",
  email: "",
  vehicleLimit: "3",
});

const normalizePlateLetters = (
  letters,
) => {
  if (!Array.isArray(letters)) {
    return ["", "", ""];
  }

  return [
    letters[0] || "",
    letters[1] || "",
    letters[2] || "",
  ];
};

const initialState = {
  owners: [],

  loadingOwners: true,

  ownersError: "",

  ownerForm: createEmptyOwnerForm(),

  editingOwnerId: null,

  vehicleForm:
    createEmptyVehicleForm(),

  vehicleOwnerId: null,

  editingVehicleId: null,

  showVehicleForm: false,

  search: "",
};

const rollerRegOwnerSlice =
  createSlice({
    name: "rollerRegOwner",

    initialState,

    reducers: {
      /* ===================================================
         OWNERS
      =================================================== */

      setOwners(state, action) {
        state.owners =
          Array.isArray(
            action.payload,
          )
            ? action.payload
            : [];
      },

      setLoadingOwners(
        state,
        action,
      ) {
        state.loadingOwners =
          Boolean(action.payload);
      },

      setOwnersError(
        state,
        action,
      ) {
        state.ownersError =
          action.payload || "";
      },

      setOwnerForm(
        state,
        action,
      ) {
        state.ownerForm = {
          ...state.ownerForm,
          ...(action.payload || {}),
        };
      },

      resetOwnerForm(state) {
        state.ownerForm =
          createEmptyOwnerForm();

        state.editingOwnerId = null;
      },

      setEditingOwnerId(
        state,
        action,
      ) {
        state.editingOwnerId =
          action.payload ?? null;
      },

      /* ===================================================
         VEHICLES
      =================================================== */

      setVehicleForm(
        state,
        action,
      ) {
        const payload =
          action.payload || {};

        state.vehicleForm = {
          ...state.vehicleForm,
          ...payload,

          ...(payload.plateLetters
            ? {
                plateLetters:
                  normalizePlateLetters(
                    payload.plateLetters,
                  ),
              }
            : {}),
        };
      },

      resetVehicleForm(
        state,
      ) {
        state.vehicleForm =
          createEmptyVehicleForm();

        state.vehicleOwnerId = null;
        state.editingVehicleId = null;
        state.showVehicleForm = false;
      },

      setVehicleOwnerId(
        state,
        action,
      ) {
        state.vehicleOwnerId =
          action.payload ?? null;
      },

      setEditingVehicleId(
        state,
        action,
      ) {
        state.editingVehicleId =
          action.payload ?? null;
      },

      setShowVehicleForm(
        state,
        action,
      ) {
        state.showVehicleForm =
          Boolean(action.payload);
      },

      /* ===================================================
         SEARCH
      =================================================== */

      setSearch(
        state,
        action,
      ) {
        state.search =
          String(action.payload || "");
      },

      /* ===================================================
         LOCAL VEHICLE OPERATIONS
      =================================================== */

      addVehicleToOwner(
        state,
        action,
      ) {
        const {
          ownerId,
          vehicle,
        } =
          action.payload || {};

        if (!vehicle) {
          return;
        }

        const owner =
          state.owners.find(
            (item) =>
              item.id === ownerId,
          );

        if (!owner) {
          return;
        }

        if (
          !Array.isArray(
            owner.vehicles,
          )
        ) {
          owner.vehicles = [];
        }

        owner.vehicles.push({
          ...vehicle,

          plateLetters:
            normalizePlateLetters(
              vehicle.plateLetters,
            ),
        });
      },

      updateVehicleInOwner(
        state,
        action,
      ) {
        const {
          ownerId,
          vehicleId,
          changes,
        } =
          action.payload || {};

        const owner =
          state.owners.find(
            (item) =>
              item.id === ownerId,
          );

        if (
          !owner ||
          !Array.isArray(
            owner.vehicles,
          )
        ) {
          return;
        }

        const vehicle =
          owner.vehicles.find(
            (item) =>
              item.id ===
              vehicleId,
          );

        if (!vehicle) {
          return;
        }

        Object.assign(
          vehicle,
          changes || {},
        );

        if (
          changes?.plateLetters
        ) {
          vehicle.plateLetters =
            normalizePlateLetters(
              changes.plateLetters,
            );
        }
      },

      deleteVehicleFromOwner(
        state,
        action,
      ) {
        const {
          ownerId,
          vehicleId,
        } =
          action.payload || {};

        const owner =
          state.owners.find(
            (item) =>
              item.id === ownerId,
          );

        if (
          !owner ||
          !Array.isArray(
            owner.vehicles,
          )
        ) {
          return;
        }

        owner.vehicles =
          owner.vehicles.filter(
            (vehicle) =>
              vehicle.id !==
              vehicleId,
          );
      },

      updateVehicleStatus(
        state,
        action,
      ) {
        const {
          ownerId,
          vehicleId,
          status,
        } =
          action.payload || {};

        const owner =
          state.owners.find(
            (item) =>
              item.id === ownerId,
          );

        if (
          !owner ||
          !Array.isArray(
            owner.vehicles,
          )
        ) {
          return;
        }

        const vehicle =
          owner.vehicles.find(
            (item) =>
              item.id ===
              vehicleId,
          );

        if (vehicle) {
          vehicle.status =
            status;
        }
      },
    },
  });

export const {
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
} = rollerRegOwnerSlice.actions;

export default rollerRegOwnerSlice.reducer;