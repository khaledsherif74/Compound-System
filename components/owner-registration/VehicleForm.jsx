// components/owner-registration/VehicleForm.jsx

"use client";

import { ChevronDown, Check, Search, Upload, X, FileText } from "lucide-react";

import { useState,useEffect, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";

import PlateInput from "./PlateInput";

import {
  addVehicleApi,
  updateVehicleApi,
  setVehicleFormField,
  setVehiclePlateLetters,
  setVehiclePlateNumbers,
  closeVehicleForm,
  selectVehicleForm,
  selectVehicleOwnerId,
  selectEditingVehicleId,
  selectSubmittingVehicle,
  selectVehicleError,
} from "@/store/slices/ownerRegistrationSlice";

const VEHICLE_COLORS = [
  {
    name: "White",
    arabic: "أبيض",
    value: "White",
    hex: "#FFFFFF",
  },
  {
    name: "Black",
    arabic: "أسود",
    value: "Black",
    hex: "#111827",
  },
  {
    name: "Gray",
    arabic: "رمادي",
    value: "Gray",
    hex: "#6B7280",
  },
  {
    name: "Silver",
    arabic: "فضي",
    value: "Silver",
    hex: "#C0C0C0",
  },
  {
    name: "Red",
    arabic: "أحمر",
    value: "Red",
    hex: "#EF4444",
  },
  {
    name: "Blue",
    arabic: "أزرق",
    value: "Blue",
    hex: "#3B82F6",
  },
  {
    name: "Dark Blue",
    arabic: "أزرق داكن",
    value: "Dark Blue",
    hex: "#1E3A8A",
  },
  {
    name: "Green",
    arabic: "أخضر",
    value: "Green",
    hex: "#22C55E",
  },
  {
    name: "Dark Green",
    arabic: "أخضر داكن",
    value: "Dark Green",
    hex: "#166534",
  },
  {
    name: "Yellow",
    arabic: "أصفر",
    value: "Yellow",
    hex: "#EAB308",
  },
  {
    name: "Orange",
    arabic: "برتقالي",
    value: "Orange",
    hex: "#F97316",
  },
  {
    name: "Brown",
    arabic: "بني",
    value: "Brown",
    hex: "#92400E",
  },
  {
    name: "Beige",
    arabic: "بيج",
    value: "Beige",
    hex: "#D6C6A5",
  },
  {
    name: "Gold",
    arabic: "ذهبي",
    value: "Gold",
    hex: "#D4AF37",
  },
  {
    name: "Purple",
    arabic: "بنفسجي",
    value: "Purple",
    hex: "#8B5CF6",
  },
  {
    name: "Maroon",
    arabic: "نبيتي",
    value: "Maroon",
    hex: "#800000",
  },
];

export default function VehicleForm() {
  const dispatch = useDispatch();

  const form = useSelector(selectVehicleForm);

  const ownerId = useSelector(selectVehicleOwnerId);

  const editingVehicleId = useSelector(selectEditingVehicleId);

  const submitting = useSelector(selectSubmittingVehicle);

  const error = useSelector(selectVehicleError);

  const editing = Boolean(editingVehicleId);

  const [isColorOpen, setIsColorOpen] = useState(false);

  const [colorSearch, setColorSearch] = useState("");

  const colorDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(event.target)
      ) {
        setIsColorOpen(false);
        setColorSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredColors = VEHICLE_COLORS.filter((item) => {
    const search = colorSearch.trim().toLowerCase();

    if (!search) return true;

    return (
      item.name.toLowerCase().includes(search) ||
      item.arabic.includes(colorSearch.trim())
    );
  });

  const selectedColor = VEHICLE_COLORS.find(
    (item) => item.value === form.color,
  );

  function handleChange(event) {
    const { name, value } = event.target;

    dispatch(
      setVehicleFormField({
        name,
        value,
      }),
    );
  }

  function handleColorSelect(value) {
    dispatch(
      setVehicleFormField({
        name: "color",
        value,
      }),
    );

    setIsColorOpen(false);
    setColorSearch("");
  }

  function handleLettersChange(letters) {
    dispatch(setVehiclePlateLetters(letters));
  }

  function handleNumbersChange(numbers) {
    dispatch(setVehiclePlateNumbers(numbers));
  }

  function handleLicenseChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    dispatch(
      setVehicleFormField({
        name: "licenseFile",
        value: file,
      }),
    );

    dispatch(
      setVehicleFormField({
        name: "licenseFileName",
        value: file.name,
      }),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!ownerId) return;

    if (editing) {
      await dispatch(
        updateVehicleApi({
          id: editingVehicleId,
          vehicle: form,
        }),
      );
    } else {
      await dispatch(
        addVehicleApi({
          ownerId,
          vehicle: form,
        }),
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-200 bg-blue-50 px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-xl font-bold text-blue-800">
              {editing ? "Edit Vehicle" : "Vehicle Registration"}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => dispatch(closeVehicleForm())}
            className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 bg-blue-50 p-4 sm:grid-cols-2 sm:p-5"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
              {error}
            </div>
          )}

          <div className="sm:col-span-2">
            <PlateInput
              letters={form.plateLetters || ["", "", ""]}
              numbers={form.plateNumbers || ""}
              onLettersChange={handleLettersChange}
              onNumbersChange={handleNumbersChange}
            />
          </div>

          <div>
            <label
              htmlFor="vehicle-brand"
              className="block text-sm font-medium text-gray-700"
            >
              Brand
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              id="vehicle-brand"
              type="text"
              name="brand"
              value={form.brand || ""}
              onChange={handleChange}
              placeholder="e.g., Toyota"
              required
              className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div ref={colorDropdownRef} className="relative">
            <label
              htmlFor="vehicle-color"
              className="block text-sm font-medium text-gray-700"
            >
              Color
              <span className="ml-1 text-red-500">*</span>
            </label>

            <button
              type="button"
              id="vehicle-color"
              onClick={() => setIsColorOpen((previous) => !previous)}
              className={`mt-1 flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition-all ${
                isColorOpen
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                {selectedColor ? (
                  <>
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border border-gray-300 shadow-sm"
                      style={{
                        backgroundColor: selectedColor.hex,
                      }}
                    />

                    <span className="truncate font-medium text-gray-800">
                      {selectedColor.name}
                    </span>

                    <span className="hidden text-sm text-gray-400 sm:inline">
                      ({selectedColor.arabic})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50">
                      <span className="h-2 w-2 rounded-full bg-gray-300" />
                    </span>

                    <span className="text-gray-400">Select vehicle color</span>
                  </>
                )}
              </div>

              <ChevronDown
                size={19}
                className={`ml-2 shrink-0 text-gray-400 transition-transform ${
                  isColorOpen ? "rotate-180 text-blue-500" : ""
                }`}
              />
            </button>

            {isColorOpen && (
              <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="border-b border-gray-100 p-3">
                  <div className="relative">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={colorSearch}
                      onChange={(event) => setColorSearch(event.target.value)}
                      placeholder="Search color..."
                      autoFocus
                      autoComplete="off"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto p-2">
                  {filteredColors.length > 0 ? (
                    filteredColors.map((item) => {
                      const isSelected = form.color === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => handleColorSelect(item.value)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                            isSelected
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-7 w-7 shrink-0 rounded-full border border-gray-300 shadow-sm"
                              style={{
                                backgroundColor: item.hex,
                              }}
                            />

                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">
                                {item.name}
                              </span>

                              <span className="text-xs text-gray-400">
                                {item.arabic}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <Check size={18} className="text-blue-600" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Search size={18} className="mx-auto text-gray-400" />

                      <p className="mt-2 text-sm font-medium text-gray-600">
                        No colors found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Vehicle License
              <span className="ml-1 text-red-500">*</span>
            </label>

            <label
              htmlFor="vehicle-license"
              className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-blue-300 bg-white px-4 py-4 transition hover:border-blue-500 hover:bg-blue-50"
            >
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Upload size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {form.licenseFile
                    ? form.licenseFile.name
                    : form.licenseFileName || "Upload vehicle license"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  PDF, JPG, JPEG or PNG
                </p>
              </div>

              <FileText size={20} className="shrink-0 text-gray-400" />
            </label>

            <input
              id="vehicle-license"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleLicenseChange}
              // required={!form.licenseFile && !form.licenseFileName}
              className="hidden"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-blue-100 pt-2 sm:col-span-2">
            <button
              type="button"
              onClick={() => dispatch(closeVehicleForm())}
              disabled={submitting}
              className="rounded-xl bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting
                ? editing
                  ? "Updating..."
                  : "Adding..."
                : editing
                  ? "Update Vehicle"
                  : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
