// components/owner-registration/EditVehicleModal.jsx

"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Upload, X } from "lucide-react";

import {
  selectShowVehicleForm,
  selectEditingVehicleId,
  selectVehicleForm,
  selectVehicleOwnerId,
  selectSubmittingVehicle,
  selectVehicleError,
  closeVehicleForm,
  setVehicleFormField,
  setVehiclePlateNumbers,
  setVehicleType,
  updateVehicleApi,
} from "@/store/slices/ownerRegistrationSlice";

/*
 * EditVehicleModal
 * -----------------
 * Fully self-contained — reads everything it needs from Redux
 * (ownerRegistrationSlice) and dispatches the update thunk itself.
 *
 * It only renders when:
 *   - showVehicleForm is true, AND
 *   - editingVehicleId is set (i.e. we're editing, not adding)
 *
 * That means you can drop <EditVehicleModal /> into ANY component
 * (OwnerTableRow, OwnerRegistration, or a future page) with no
 * props at all. Whichever component dispatched
 * openEditVehicle({ ownerId, vehicle }) will have this modal pop
 * up automatically.
 */
export default function EditVehicleModal() {
  const dispatch = useDispatch();

  const isOpen = useSelector(selectShowVehicleForm);
  const editingVehicleId = useSelector(selectEditingVehicleId);
  const ownerId = useSelector(selectVehicleOwnerId);
  const vehicleForm = useSelector(selectVehicleForm);
  const submitting = useSelector(selectSubmittingVehicle);
  const vehicleError = useSelector(selectVehicleError);

  const [localError, setLocalError] = useState("");

  // Only render for EDIT. Adding a vehicle is a separate flow.
  if (!isOpen || !editingVehicleId) {
    return null;
  }

  function handleClose() {
    if (submitting) return;
    dispatch(closeVehicleForm());
  }

  function handlePlateLetterChange(index, value) {
    const cleaned = value.toUpperCase().slice(0, 1);
    const next = [...(vehicleForm.plateLetters || ["", "", ""])];
    next[index] = cleaned;

    dispatch(setVehicleFormField({ name: "plateLetters", value: next }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch(setVehicleFormField({ name: "licenseFile", value: file }));
    dispatch(
      setVehicleFormField({ name: "licenseFileName", value: file.name }),
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setLocalError("");

    if (!ownerId) {
      setLocalError("Missing owner reference for this vehicle.");
      return;
    }

    const result = await dispatch(
      updateVehicleApi({
        id: editingVehicleId,
        ownerId,
        vehicle: vehicleForm,
      }),
    );

    if (updateVehicleApi.fulfilled.match(result)) {
      dispatch(closeVehicleForm());
    }
  }

  const errorMessage = localError || vehicleError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Edit Vehicle</h2>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PLATE */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Plate Letters
            </label>
            <div dir="rtl" className="flex gap-2">
              {[0, 1, 2].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={vehicleForm.plateLetters?.[index] || ""}
                  onChange={(e) =>
                    handlePlateLetterChange(index, e.target.value)
                  }
                  className="w-14 rounded-lg border border-slate-300 py-2 text-center text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Plate Numbers
            </label>
            <input
              type="text"
              value={vehicleForm.plateNumbers || ""}
              onChange={(e) =>
                dispatch(setVehiclePlateNumbers(e.target.value))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* VEHICLE TYPE */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vehicle Type
            </label>
            <select
              value={vehicleForm.vehicleType || "OWNER"}
              onChange={(e) => dispatch(setVehicleType(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="OWNER">Owner</option>
              <option value="GUEST">Guest</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          {/* BRAND */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Brand
            </label>
            <input
              type="text"
              value={vehicleForm.brand || ""}
              onChange={(e) =>
                dispatch(
                  setVehicleFormField({
                    name: "brand",
                    value: e.target.value,
                  }),
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Color
            </label>
            <input
              type="text"
              value={vehicleForm.color || ""}
              onChange={(e) =>
                dispatch(
                  setVehicleFormField({
                    name: "color",
                    value: e.target.value,
                  }),
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* LICENSE FILE */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              License File
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-500 transition hover:border-blue-400 hover:text-blue-600">
              <Upload size={16} />
              {vehicleForm.licenseFileName || "Choose a file (optional)"}
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}