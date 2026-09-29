"use client";

import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Upload,
  FileText,
  Phone,
  X,
  ChevronDown,
  Search,
  Check,
} from "lucide-react";

import VEHICLE_COLORS from "@/data/vehicleData";
import {
  setRegistrationField,
  setPlateLetter,
  resetRegistrationForm,
} from "@/store/slices/registrationSlice";

const DISALLOWED_PLATE_LETTERS = new Set([
  "ت",
  "ث",
  "ح",
  "خ",
  "ذ",
  "ز",
  "ش",
  "ض",
  "ظ",
  "غ",
  "ك",
]);

/* =========================================================
   ARABIC-INDIC DIGITS
========================================================= */

const ARABIC_DIGITS = "١٢٣٤٥٦٧٨٩";

/* =========================================================
   ENGLISH -> ARABIC-INDIC

   1 -> ١
   2 -> ٢
   ...
   9 -> ٩

   0 intentionally not supported.
========================================================= */

function toArabicDigits(value) {
  return String(value || "").replace(
    /[1-9]/g,
    (digit) => ARABIC_DIGITS[Number(digit) - 1],
  );
}

/* =========================================================
   NORMALIZE ARABIC / PERSIAN DIGITS

   Arabic:
   ١ -> 1

   Persian:
   ۱ -> 1
========================================================= */

function normalizeDigits(value) {
  return String(value || "")
    .replace(/[١-٩]/g, (digit) => {
      return String(
        ARABIC_DIGITS.indexOf(digit) + 1,
      );
    })
    .replace(/[۱-۹]/g, (digit) => {
      return String(
        "۱۲۳۴۵۶۷۸۹".indexOf(digit) + 1,
      );
    });
}

/* =========================================================
   NORMALIZE ARABIC PLATE LETTER

   ا -> أ

   This ensures that plain Alef is automatically converted
   to Alef with Hamza.
========================================================= */

function normalizePlateLetter(value) {
  if (value === "ا") {
    return "أ";
  }

  return value;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AddVehicleForm({
  vehicles = [],
  vehicleLimit = null,
  onAddVehicle,
  onRequestIncrease,
}) {
  const dispatch = useDispatch();

  const {
    isFormOpen,
    showLimitMessage,
    isSubmitting,
    brand,
    color,
    vehicleLicense,
    plateLetters,
    plateDigits,
    isColorOpen,
    colorSearch,
  } = useSelector((state) => state.registration);

  /* =========================================================
     REDUX FIELD HELPERS
  ========================================================= */

  const setIsFormOpen = (value) =>
    dispatch(
      setRegistrationField({
        field: "isFormOpen",
        value:
          typeof value === "function"
            ? value(isFormOpen)
            : value,
      }),
    );

  const setShowLimitMessage = (value) =>
    dispatch(
      setRegistrationField({
        field: "showLimitMessage",
        value:
          typeof value === "function"
            ? value(showLimitMessage)
            : value,
      }),
    );

  const setIsSubmitting = (value) =>
    dispatch(
      setRegistrationField({
        field: "isSubmitting",
        value:
          typeof value === "function"
            ? value(isSubmitting)
            : value,
      }),
    );

  const setBrand = (value) =>
    dispatch(
      setRegistrationField({
        field: "brand",
        value:
          typeof value === "function"
            ? value(brand)
            : value,
      }),
    );

  const setColor = (value) =>
    dispatch(
      setRegistrationField({
        field: "color",
        value:
          typeof value === "function"
            ? value(color)
            : value,
      }),
    );

  const setVehicleLicense = (value) =>
    dispatch(
      setRegistrationField({
        field: "vehicleLicense",
        value:
          typeof value === "function"
            ? value(vehicleLicense)
            : value,
      }),
    );

  const setPlateDigits = (value) =>
    dispatch(
      setRegistrationField({
        field: "plateDigits",
        value:
          typeof value === "function"
            ? value(plateDigits)
            : value,
      }),
    );

  const setIsColorOpen = (value) =>
    dispatch(
      setRegistrationField({
        field: "isColorOpen",
        value:
          typeof value === "function"
            ? value(isColorOpen)
            : value,
      }),
    );

  const setColorSearch = (value) =>
    dispatch(
      setRegistrationField({
        field: "colorSearch",
        value:
          typeof value === "function"
            ? value(colorSearch)
            : value,
      }),
    );

  /* =========================================================
     REFS
  ========================================================= */

  const colorDropdownRef = useRef(null);

  const letterRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const digitsRef = useRef(null);

  /* =========================================================
     VEHICLE LIMIT
  ========================================================= */

  const vehiclesCount = Array.isArray(vehicles)
    ? vehicles.length
    : 0;

  /*
    vehicleLimit comes from the backend/current user
    profile.

    We do NOT use a hardcoded number here.
  */

  const hasVehicleLimit = Number.isFinite(
    Number(vehicleLimit),
  );

  const canAddVehicle =
    hasVehicleLimit &&
    vehiclesCount < Number(vehicleLimit);

  /* =========================================================
     CLOSE COLOR DROPDOWN
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(
          event.target,
        )
      ) {
        setIsColorOpen(false);
        setColorSearch("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /* =========================================================
     FILTER COLORS
  ========================================================= */

  const filteredColors = VEHICLE_COLORS.filter(
    (item) => {
      const search = colorSearch
        .toLowerCase()
        .trim();

      if (!search) {
        return true;
      }

      return (
        item.name
          .toLowerCase()
          .includes(search) ||
        item.arabic.includes(search)
      );
    },
  );

  /* =========================================================
     SELECTED COLOR
  ========================================================= */

  const selectedColor = VEHICLE_COLORS.find(
    (item) => item.value === color,
  );

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    dispatch(resetRegistrationForm());
  };

  /* =========================================================
     SELECT COLOR
  ========================================================= */

  const handleColorSelect = (selectedValue) => {
    setColor(selectedValue);
    setIsColorOpen(false);
    setColorSearch("");
  };

  /* =========================================================
     TOGGLE FORM
  ========================================================= */

  const handleToggle = () => {
    /*
      If backend/profile did not provide a limit,
      don't allow the form to open.
    */

    if (!hasVehicleLimit) {
      setShowLimitMessage(true);
      return;
    }

    /*
      Limit reached.
    */

    if (!canAddVehicle) {
      setShowLimitMessage(true);
      return;
    }

    if (!isFormOpen) {
      resetForm();
      setIsFormOpen(true);

      requestAnimationFrame(() => {
        letterRefs[0].current?.focus();
        letterRefs[0].current?.select();
      });
    } else {
      setIsFormOpen(false);
    }
  };

  /* =========================================================
     CLOSE FORM
  ========================================================= */

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);
    setIsColorOpen(false);
    setColorSearch("");
  };

  /* =========================================================
     LETTER CHANGE
  ========================================================= */

  const handleLetterChange = (index, e) => {
    const value = e.target.value;

    const normalized = normalizeDigits(value);

    const converted = toArabicDigits(
      normalized,
    );

    const allowedCharacters =
      converted.match(
        /[\u0600-\u06FF١-٩]/g,
      ) || [];

    let newChar =
      allowedCharacters[
        allowedCharacters.length - 1
      ] || "";

    /* =======================================================
       AUTO-CORRECT ARABIC ALEF

       User enters:
       ا

       Automatically becomes:
       أ
    ======================================================= */

    newChar = normalizePlateLetter(newChar);

    /*
      Reject disallowed Arabic letters.
    */

    if (
      /^[\u0600-\u06FF]$/.test(newChar) &&
      DISALLOWED_PLATE_LETTERS.has(newChar)
    ) {
      newChar = "";
    }

    /*
      Update Redux.
    */

    dispatch(
      setPlateLetter({
        index,
        value: newChar,
      }),
    );

    /*
      Move FIRST -> SECOND -> THIRD

      Visual:

      [NUMBERS] [THIRD] [SECOND] [FIRST]

      User enters:

      FIRST
      then SECOND
      then THIRD
    */

    if (newChar) {
      if (index < 2) {
        requestAnimationFrame(() => {
          letterRefs[
            index + 1
          ].current?.focus();

          letterRefs[
            index + 1
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

  /* =========================================================
     KEYBOARD NAVIGATION
  ========================================================= */

  const handleLetterKeyDown = (index, e) => {
    /*
      Backspace
    */

    if (
      e.key === "Backspace" &&
      plateLetters[index] === "" &&
      index > 0
    ) {
      e.preventDefault();

      requestAnimationFrame(() => {
        letterRefs[
          index - 1
        ].current?.focus();
      });

      return;
    }

    /*
      Arrow Left
    */

    if (
      e.key === "ArrowLeft" &&
      index < 2
    ) {
      e.preventDefault();

      letterRefs[
        index + 1
      ].current?.focus();

      return;
    }

    /*
      Arrow Right
    */

    if (
      e.key === "ArrowRight" &&
      index > 0
    ) {
      e.preventDefault();

      letterRefs[
        index - 1
      ].current?.focus();
    }
  };

  /* =========================================================
     DIGITS CHANGE
  ========================================================= */

  const handleDigitsChange = (e) => {
    const value = e.target.value;

    const normalized =
      normalizeDigits(value);

    const digitsOnly = normalized
      .replace(/[^1-9]/g, "")
      .slice(0, 4);

    /*
      State stays English numbers:

      "1234"

      UI displays:

      "١٢٣٤"
    */

    setPlateDigits(digitsOnly);
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    /* =======================================================
       CHECK LIMIT AGAIN

       This is important because the backend is the source
       of truth.
    ======================================================= */

    if (!hasVehicleLimit) {
      alert(
        "Unable to determine your vehicle limit. Please refresh your profile and try again.",
      );

      return;
    }

    if (
      vehiclesCount >= Number(vehicleLimit)
    ) {
      setShowLimitMessage(true);
      setIsFormOpen(false);

      return;
    }

    /* =======================================================
       BRAND
    ======================================================= */

    if (!brand.trim()) {
      alert("Please fill in Brand.");
      return;
    }

    /* =======================================================
       COLOR
    ======================================================= */

    if (!color.trim()) {
      alert(
        "Please select a vehicle color.",
      );

      return;
    }

    /* =======================================================
       FIRST LETTER REQUIRED
    ======================================================= */

    if (!plateLetters[0].trim()) {
      alert(
        "Please enter the first plate character.",
      );

      letterRefs[0].current?.focus();

      return;
    }

    /* =======================================================
       VALIDATE LETTERS
    ======================================================= */

    const validPlateCharacter =
      /^[\u0600-\u06FF١-٩]$/;

    for (
      let index = 0;
      index < plateLetters.length;
      index++
    ) {
      const value =
        plateLetters[index].trim();

      if (!value) {
        continue;
      }

      if (
        !validPlateCharacter.test(value)
      ) {
        alert(
          `Plate character ${
            index + 1
          } must be an Arabic letter or a number from ١ to ٩.`,
        );

        letterRefs[
          index
        ].current?.focus();

        return;
      }

      if (value === "٠") {
        alert(
          "Zero is not allowed in Egyptian plate numbers.",
        );

        letterRefs[
          index
        ].current?.focus();

        return;
      }
    }

    /* =======================================================
       NUMBERS
    ======================================================= */

    if (!plateDigits.length) {
      alert(
        "Please enter the numeric part of the plate.",
      );

      digitsRef.current?.focus();

      return;
    }

    if (
      !/^[1-9]{1,4}$/.test(
        plateDigits,
      )
    ) {
      alert(
        "Plate numbers must contain only digits from ١ to ٩.",
      );

      digitsRef.current?.focus();

      return;
    }

    /* =======================================================
       LICENSE
    ======================================================= */

    // License validation intentionally disabled.

    /* =======================================================
       IMPORTANT PLATE ORDER

       Internal:

       [0] = FIRST
       [1] = SECOND
       [2] = THIRD

       Backend receives:

       FIRST SECOND THIRD

       Example:

       ["أ", "ب", "ج"]

       => "أ ب ج"

       DO NOT reverse this.
    ======================================================= */

    const plateLettersValue =
      plateLetters
        .filter(Boolean)
        .join(" ");

    /*
      Backend requested:

      plateNumbers = "1234"

      NOT Arabic digits.
    */

    const plateNumbersValue =
      plateDigits;

    /*
      Display value only.
    */

    const displayPlate =
      `${plateLettersValue} ${toArabicDigits(
        plateDigits,
      )}`;

    /* =======================================================
       DATA SENT TO PARENT
    ======================================================= */

    const vehicleData = {
      plateLetters:
        plateLettersValue,

      plateNumbers:
        plateNumbersValue,

      plateNumber:
        displayPlate,

      brand:
        brand.trim(),

      color:
        color.trim(),

      vehicleType:
        "OWNER",

      licenseFile:
        vehicleLicense,
    };

    /* =======================================================
       SEND TO DASHBOARD

       Dashboard will call backend.
    ======================================================= */

    try {
      setIsSubmitting(true);

      await onAddVehicle?.(
        vehicleData,
      );

      /*
        Parent successfully added the vehicle.
      */

      resetForm();
      setIsFormOpen(false);
      setShowLimitMessage(false);
    } catch (error) {
      /*
        Backend error is handled/displayed by parent.

        We intentionally DON'T close the form here.
      */

      console.error(
        "Add vehicle failed:",
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <>
      {/* =====================================================
          ADD VEHICLE BUTTON
      ===================================================== */}

      <div className="mt-4 flex justify-start">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={20} />

          {isFormOpen
            ? "Cancel"
            : "Add Vehicle"}
        </button>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      {isFormOpen && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-800">
              Add Vehicle
            </h3>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl p-1 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {/* =================================================
                PLATE
            ================================================= */}

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">
                Plate Number
              </label>

              <div
                className="mt-2 flex w-full items-center justify-start gap-1.5 sm:gap-2"
                dir="ltr"
              >
                {/* NUMBERS */}

                <input
                  ref={digitsRef}
                  type="text"
                  value={toArabicDigits(
                    plateDigits,
                  )}
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

                {/* =================================================
                    VISUAL:

                    [NUMBERS] [THIRD] [SECOND] [FIRST]
                ================================================= */}

                {[2, 1, 0].map(
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
                      onChange={(e) =>
                        handleLetterChange(
                          index,
                          e,
                        )
                      }
                      onKeyDown={(e) =>
                        handleLetterKeyDown(
                          index,
                          e,
                        )
                      }
                      maxLength={1}
                      className="h-12 w-10 shrink-0 rounded-xl border border-gray-300 bg-white px-1 text-center text-base font-bold shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-12 sm:text-lg"
                      placeholder={
                        index === 0
                          ? "أ"
                          : "—"
                      }
                      dir="rtl"
                      autoComplete="off"
                      required={
                        index === 0
                      }
                      aria-required={
                        index === 0
                      }
                      aria-label={
                        index === 0
                          ? "First plate character"
                          : index === 1
                            ? "Second plate character"
                            : "Third plate character"
                      }
                    />
                  ),
                )}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Enter the plate from right to
                left. The first character is
                required; the second and third
                characters are optional.
              </p>
            </div>

            {/* =================================================
                BRAND
            ================================================= */}

            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-gray-700"
              >
                Brand
              </label>

              <input
                type="text"
                id="brand"
                value={brand}
                onChange={(e) =>
                  setBrand(
                    e.target.value,
                  )
                }
                className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="e.g., Toyota"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* =================================================
                COLOR
            ================================================= */}

            <div
              ref={colorDropdownRef}
              className="relative"
            >
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700"
              >
                Color
              </label>

              <button
                type="button"
                id="color"
                onClick={() =>
                  setIsColorOpen(
                    (prev) => !prev,
                  )
                }
                disabled={isSubmitting}
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
                          backgroundColor:
                            selectedColor.hex,
                        }}
                      />

                      <span className="truncate font-medium text-gray-800">
                        {
                          selectedColor.name
                        }
                      </span>

                      <span className="hidden text-sm text-gray-400 sm:inline">
                        (
                        {
                          selectedColor.arabic
                        }
                        )
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50">
                        <span className="h-2 w-2 rounded-full bg-gray-300" />
                      </span>

                      <span className="text-gray-400">
                        Select vehicle color
                      </span>
                    </>
                  )}
                </div>

                <ChevronDown
                  size={19}
                  className={`ml-2 shrink-0 text-gray-400 transition-transform ${
                    isColorOpen
                      ? "rotate-180 text-blue-500"
                      : ""
                  }`}
                />
              </button>

              {isColorOpen && (
                <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 p-3">
                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        value={
                          colorSearch
                        }
                        onChange={(e) =>
                          setColorSearch(
                            e.target.value,
                          )
                        }
                        placeholder="Search color..."
                        autoFocus
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-2">
                    {filteredColors.length >
                    0 ? (
                      filteredColors.map(
                        (item) => {
                          const isSelected =
                            color ===
                            item.value;

                          return (
                            <button
                              key={
                                item.value
                              }
                              type="button"
                              onClick={() =>
                                handleColorSelect(
                                  item.value,
                                )
                              }
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
                                    backgroundColor:
                                      item.hex,
                                  }}
                                />

                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold">
                                    {
                                      item.name
                                    }
                                  </span>

                                  <span className="text-xs text-gray-400">
                                    {
                                      item.arabic
                                    }
                                  </span>
                                </div>
                              </div>

                              {isSelected && (
                                <Check
                                  size={18}
                                  className="text-blue-600"
                                />
                              )}
                            </button>
                          );
                        },
                      )
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Search
                          size={18}
                          className="mx-auto text-gray-400"
                        />

                        <p className="mt-2 text-sm font-medium text-gray-600">
                          No colors found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <input
                type="text"
                value={color}
                readOnly
                tabIndex={-1}
                required
                className="pointer-events-none absolute h-0 w-0 opacity-0"
                aria-hidden="true"
              />
            </div>

            {/* =================================================
                LICENSE
            ================================================= */}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Vehicle License
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
                    {vehicleLicense
                      ? vehicleLicense.name
                      : "Upload vehicle license"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    PDF, JPG, JPEG or PNG
                  </p>
                </div>

                <FileText
                  size={20}
                  className="text-gray-400"
                />
              </label>

              <input
                id="vehicle-license"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) =>
                  setVehicleLicense(
                    e.target.files?.[0] ||
                      null,
                  )
                }
                disabled={isSubmitting}
              />
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-xl bg-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Adding..."
                  : "Add Vehicle"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          LIMIT MESSAGE
      ===================================================== */}

      {showLimitMessage && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            {!hasVehicleLimit ? (
              <>
                <h3 className="font-bold text-orange-800">
                  Vehicle Limit Not Available
                </h3>

                <p className="mt-1 text-sm text-orange-700">
                  Unable to determine your
                  vehicle limit. Please refresh
                  your profile and try again.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-orange-800">
                  Vehicle Limit Reached
                </h3>

                <p className="mt-1 text-sm text-orange-700">
                  You have reached your
                  maximum vehicle limit of{" "}
                  <strong>
                    {vehicleLimit}
                  </strong>
                  . Please contact compound
                  management to request an
                  increase.
                </p>
              </>
            )}
          </div>

          {onRequestIncrease && (
            <button
              type="button"
              onClick={
                onRequestIncrease
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white transition hover:bg-orange-700"
              aria-label="Request increase"
            >
              <Phone size={20} />
            </button>
          )}
        </div>
      )}
    </>
  );
}