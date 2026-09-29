"use client";

import { useRef, useState } from "react";
import {
  Car,
  Check,
  FileText,
  Plus,
  Upload,
  X,
} from "lucide-react";

import ColorSelect from "./ColorSelect";

import {
  DISALLOWED_PLATE_LETTERS,
} from "./rollerRegOwnerData";

export default function VehicleForm({
  form,
  owner,
  editingVehicleId,
  onChange,
  onSubmit,
  onClose,
}) {
  const licenseInputRef =
    useRef(null);

  const [licenseError, setLicenseError] =
    useState("");

  // =========================================================
  // PLATE INPUT REFS
  // =========================================================

  const letterRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const digitsRef = useRef(null);

  const plateLetters =
    Array.isArray(form.plateLetters)
      ? [
          ...form.plateLetters,
          "",
          "",
          "",
        ].slice(0, 3)
      : ["", "", ""];

  const plateNumbers =
    form.plateNumbers ?? "";

  // =========================================================
  // LETTER CHANGE
  // =========================================================

  const handleLetterChange = (
    index,
    event,
  ) => {
    const value =
      event.target.value;

    /*
      Only Arabic letters are accepted
      inside the three letter boxes.

      Western digits are NOT converted here,
      because these inputs represent letters.
    */

    const arabicLetters =
      value.match(
        /[\u0621-\u063A\u0641-\u064A]/g,
      ) || [];

    const allowedLetters =
      arabicLetters.filter(
        (char) =>
          !DISALLOWED_PLATE_LETTERS.has(
            char,
          ),
      );

    const newChar =
      allowedLetters
        .join("")
        .slice(-1);

    const newLetters = [
      ...plateLetters,
    ];

    newLetters[index] = newChar;

    onChange({
      plateLetters:
        newLetters,
    });

    // Move right-to-left through letters.
    if (newChar) {
      if (index > 0) {
        requestAnimationFrame(() => {
          letterRefs[
            index - 1
          ].current?.focus();

          letterRefs[
            index - 1
          ].current?.select();
        });
      } else {
        requestAnimationFrame(() => {
          digitsRef.current?.focus();

          digitsRef.current?.select();
        });
      }
    }
  };

  // =========================================================
  // LETTER KEYBOARD NAVIGATION
  // =========================================================

  const handleLetterKeyDown = (
    index,
    event,
  ) => {
    if (
      event.key === "Backspace" &&
      plateLetters[index] === "" &&
      index < 2
    ) {
      event.preventDefault();

      requestAnimationFrame(() => {
        letterRefs[
          index + 1
        ].current?.focus();

        letterRefs[
          index + 1
        ].current?.select();
      });

      return;
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      event.preventDefault();

      letterRefs[
        index - 1
      ].current?.focus();

      return;
    }

    if (
      event.key === "ArrowRight" &&
      index < 2
    ) {
      event.preventDefault();

      letterRefs[
        index + 1
      ].current?.focus();
    }
  };

  // =========================================================
  // DIGITS CHANGE
  // =========================================================

  const handleDigitsChange = (
    event,
  ) => {
    const value =
      event.target.value;

    const converted =
      value.replace(
        /[0-9]/g,
        (char) =>
          String.fromCharCode(
            char.charCodeAt(0) +
              1584,
          ),
      );

    const hindiDigits =
      (
        converted.match(
          /[\u0660-\u0669]/g,
        ) || []
      )
        .join("")
        .slice(0, 4);

    onChange({
      plateNumbers:
        hindiDigits,
    });
  };

  // =========================================================
  // LICENSE CHANGE
  // =========================================================

  const handleLicenseChange = (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      onChange({
        licenseFile: null,
        licenseFileName: "",
      });

      setLicenseError("");

      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setLicenseError(
        "Please upload a PDF, JPG, or PNG file.",
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setLicenseError(
        "The license file must be smaller than 5 MB.",
      );

      event.target.value = "";

      return;
    }

    setLicenseError("");

    onChange({
      licenseFile: file,
      licenseFileName: file.name,
    });
  };

  // =========================================================
  // REMOVE LICENSE
  // =========================================================

  const removeLicense = () => {
    onChange({
      licenseFile: null,
      licenseFileName: "",
    });

    setLicenseError("");

    if (
      licenseInputRef.current
    ) {
      licenseInputRef.current.value =
        "";
    }
  };

  return (
    <div
      id="vehicle-form-section"
      className="mb-8 rounded-3xl bg-white p-6 shadow-lg"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
            <Car size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {editingVehicleId
                ? "Edit Vehicle"
                : "Add Vehicle"}
            </h2>

            {owner && (
              <div className="mt-1 space-y-0.5">
                <p className="text-sm text-gray-500">
                  Owner:{" "}
                  <span className="font-semibold text-gray-700">
                    {owner.firstName}{" "}
                    {owner.lastName}
                  </span>
                </p>

                <p className="text-sm text-gray-500">
                  Unit No.:{" "}
                  <span className="font-semibold text-gray-700">
                    {owner.unitNumber}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
          title="Close"
        >
          <X size={19} />
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Plate Number
            </label>

            <div
              className="mt-2 flex w-full items-center justify-start gap-1.5 sm:gap-2"
              dir="ltr"
            >
              <input
                ref={digitsRef}
                type="text"
                value={plateNumbers}
                onChange={
                  handleDigitsChange
                }
                className="h-12 min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-2 text-center font-sans text-base font-bold shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:h-12 sm:max-w-28 sm:text-lg"
                placeholder="١٢٣٤"
                dir="rtl"
                inputMode="numeric"
                maxLength={4}
                autoComplete="off"
                required
                aria-label="Plate numbers"
              />

              <span className="shrink-0 px-0.5 text-lg font-bold text-gray-400 sm:px-1">
                -
              </span>

              {[0, 1, 2].map(
                (index) => (
                  <input
                    key={index}
                    ref={
                      letterRefs[index]
                    }
                    type="text"
                    value={
                      plateLetters[
                        index
                      ]
                    }
                    onChange={(
                      event,
                    ) =>
                      handleLetterChange(
                        index,
                        event,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) =>
                      handleLetterKeyDown(
                        index,
                        event,
                      )
                    }
                    maxLength={1}
                    className="h-12 w-10 shrink-0 rounded-xl border border-gray-300 bg-white px-1 text-center text-base font-bold shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-12 sm:text-lg"
                    placeholder="أ"
                    dir="rtl"
                    autoComplete="off"
                    required={
                      index === 2
                    }
                    aria-label={`Arabic letter ${index + 1}`}
                  />
                ),
              )}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Type the 3 Arabic letters
              from the right. Cursor moves
              automatically.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Vehicle Model
            </label>

            <input
              name="model"
              value={form.model || ""}
              onChange={(event) =>
                onChange({
                  model:
                    event.target.value,
                })
              }
              placeholder="Hyundai Elantra"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <ColorSelect
            value={form.color || ""}
            onChange={(color) =>
              onChange({
                color,
              })
            }
          />

          <div className="lg:col-span-2">
            <div className="mb-1 flex justify-between">
              <label className="text-sm font-medium text-gray-700">
                Vehicle License
              </label>

              <span className="text-xs text-gray-400">
                Optional
              </span>
            </div>

            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              {!form.licenseFileName ? (
                <>
                  <input
                    ref={
                      licenseInputRef
                    }
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={
                      handleLicenseChange
                    }
                    className="hidden"
                    id="vehicle-license-upload"
                  />

                  <label
                    htmlFor="vehicle-license-upload"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-6 text-center transition hover:border-blue-400 hover:bg-blue-50/50"
                  >
                    <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Upload
                        size={21}
                      />
                    </div>

                    <span className="text-sm font-semibold text-gray-700">
                      Upload Vehicle License
                    </span>

                    <span className="mt-1 text-xs text-gray-400">
                      PDF, JPG, or PNG —
                      Maximum 5 MB
                    </span>
                  </label>
                </>
              ) : (
                <div className="flex items-center justify-between rounded-xl border bg-white p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <FileText
                        size={20}
                      />
                    </div>

                    <div>
                      <p className="max-w-70 truncate text-sm font-semibold">
                        {
                          form.licenseFileName
                        }
                      </p>

                      <p className="text-xs text-gray-400">
                        Vehicle license
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeLicense
                    }
                    className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                    title="Remove license"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {licenseError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {licenseError}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            {editingVehicleId ? (
              <>
                <Check size={18} />
                Update Vehicle
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Vehicle
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}