"use client";

import { useState, useRef, useEffect } from "react";

import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Car,
  Search,
  ChevronDown,
  Check,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { BackWard } from "@/utilites/backFunc";
import VEHICLE_COLORS from "@/data/vehicleData";

import {
  updateFormField,
  updatePlateLetter,
  updatePlateNumbers,
  startEditCar,
  cancelEditCar,
  setSearch,
  setSort,
  setColorSearch,
  createEmployeeCar,
  fetchEmployeeCars,
  updateEmployeeCar,
  updateEmployeeCarStatus,
  getEmployeeCarUserId,
  deleteEmployeeCar,
} from "@/store/slices/employeeCarsSlice";

// =========================================================
// Disallowed Arabic plate letters
// =========================================================

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

// =========================================================
// Arabic-Indic digits
// =========================================================

const ARABIC_INDIC_DIGITS = "١٢٣٤٥٦٧٨٩";

// =========================================================
// Convert Arabic-Indic digits to Western
// =========================================================

const convertArabicIndicToWestern = (value) => {
  return String(value || "")
    .split("")
    .map((char) => {
      const index = ARABIC_INDIC_DIGITS.indexOf(char);

      return index !== -1 ? String(index + 1) : char;
    })
    .join("");
};

// =========================================================
// Convert Western digits to Arabic-Indic
// =========================================================

const convertWesternToArabicIndic = (value) => {
  return String(value || "")
    .split("")
    .map((char) => {
      const index = "123456789".indexOf(char);

      return index !== -1
        ? ARABIC_INDIC_DIGITS[index]
        : char;
    })
    .join("");
};

export default function RollerEmployeeCars() {
  const dispatch = useDispatch();

  // =========================================================
  // Redux state
  // =========================================================

  const {
    cars,
    form,
    search,
    sortConfig,
    colorSearch,
    editingCarId,
    isAdding,
    isLoading,
    isUpdating,
    isUpdatingStatus,
    isDeleting,
    addError,
    updateError,
    updateStatusError,
    deleteError,
    error,
  } = useSelector(
    (state) => state.employeeCars,
  );

  // =========================================================
  // Show More / Show Less
  // =========================================================

  const INITIAL_VISIBLE_ROWS = 5;

  const [showAllCars, setShowAllCars] =
    useState(false);

  // =========================================================
  // Load employee cars
  // =========================================================

  useEffect(() => {
    dispatch(
      fetchEmployeeCars({
        page: 1,
        limit: 20,
      }),
    );
  }, [dispatch]);

  // =========================================================
  // Color dropdown
  // =========================================================

  const [isColorOpen, setIsColorOpen] =
    useState(false);

  const [
    togglingAllowedId,
    setTogglingAllowedId,
  ] = useState(null);

  const colorDropdownRef =
    useRef(null);

  // =========================================================
  // Plate refs
  // =========================================================

  const letterRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const digitsRef = useRef(null);

  // =========================================================
  // Sorting
  // =========================================================

  const handleSort = (key) => {
    dispatch(setSort(key));
  };

  const getSortValue = (car, key) => {
    switch (key) {
      case "employee":
        return car.employee || "";

      case "plate":
        return `${(
          car.plateLetters || []
        ).join("")}${car.plateNumbers || ""
          }`;

      case "role":
        return car.employeeType || "";

      case "vehicle":
        return (
          car.employeeName ||
          car.employee ||
          ""
        );

      case "brand":
        return car.brand || "";

      case "color":
        return car.color || "";

      case "allowed":
        return car.allowed
          ? "Allowed"
          : "Blocked";

      default:
        return "";
    }
  };

  const sortCars = (items) => {
    if (!sortConfig.key) {
      return items;
    }

    const sorted = [...items];

    sorted.sort((a, b) => {
      const aValue = getSortValue(
        a,
        sortConfig.key,
      );

      const bValue = getSortValue(
        b,
        sortConfig.key,
      );

      const aText = String(aValue)
        .trim()
        .toLowerCase();

      const bText = String(bValue)
        .trim()
        .toLowerCase();

      const result =
        aText.localeCompare(
          bText,
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          },
        );

      return sortConfig.direction ===
        "asc"
        ? result
        : -result;
    });

    return sorted;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <ChevronsUpDown
          size={16}
          className="text-gray-400"
        />
      );
    }

    return sortConfig.direction ===
      "asc" ? (
      <ChevronUp
        size={16}
        className="text-blue-600"
      />
    ) : (
      <ChevronDown
        size={16}
        className="text-blue-600"
      />
    );
  };

  // =========================================================
  // Close color dropdown
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (
      event,
    ) => {
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(
          event.target,
        )
      ) {
        setIsColorOpen(false);

        dispatch(setColorSearch(""));
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
  }, [dispatch]);

  // =========================================================
  // Filter colors
  // =========================================================

  const filteredColors =
    VEHICLE_COLORS.filter((item) => {
      const query =
        colorSearch
          .toLowerCase()
          .trim();

      if (!query) {
        return true;
      }

      return (
        item.name
          .toLowerCase()
          .includes(query) ||
        item.arabic.includes(query)
      );
    });

  // =========================================================
  // Selected color
  // =========================================================

  const selectedColor =
    VEHICLE_COLORS.find(
      (item) =>
        item.value === form.color,
    );

  // =========================================================
  // Search table
  // =========================================================

  const filteredCars = cars.filter(
    (car) => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return true;
      }

      const plate = `${(
        car.plateLetters || []
      ).join("")}${car.plateNumbers || ""
        }`;

      const plateWithSpaces = `${(
        car.plateLetters || []
      ).join(" ")} ${car.plateNumbers || ""
        }`;

      return [
        car.employee,
        car.employeePhone,
        car.employeeType,
        car.employeeName,
        car.brand,
        plate,
        plateWithSpaces,
        car.color,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      );
    },
  );

  const displayedCars =
    sortCars(filteredCars);

  // =========================================================
  // Show More / Show Less
  //
  // Apply this AFTER filtering and sorting so that:
  // Search + Sort + Show More/Less work together.
  // =========================================================

  const visibleCars = showAllCars
    ? displayedCars
    : displayedCars.slice(
      0,
      INITIAL_VISIBLE_ROWS,
    );

  const canShowMore =
    displayedCars.length >
    INITIAL_VISIBLE_ROWS;

  // =========================================================
  // Normal form inputs
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    let nextValue = value;

    if (name === "employeePhone") {
      nextValue = value.replace(
        /\D/g,
        "",
      );
    }

    dispatch(
      updateFormField({
        name,
        value: nextValue,
      }),
    );
  };

  // =========================================================
  // Color selection
  // =========================================================

  const handleColorSelect = (
    selectedValue,
  ) => {
    dispatch(
      updateFormField({
        name: "color",
        value: selectedValue,
      }),
    );

    setIsColorOpen(false);

    dispatch(setColorSearch(""));
  };

  // =========================================================
  // Plate letters
  // =========================================================

  const handlePlateLetter = (
    index,
    e,
  ) => {
    const value = e.target.value;

    const arabicLetters = (
      value.match(
        /[\u0600-\u06FF]/g,
      ) || []
    ).filter(
      (letter) =>
        !DISALLOWED_PLATE_LETTERS.has(
          letter,
        ),
    );

    const newChar =
      arabicLetters
        .join("")
        .slice(-1);

    dispatch(
      updatePlateLetter({
        index,
        value: newChar,
      }),
    );

    if (newChar.length === 1) {
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

  // =========================================================
  // Plate keyboard navigation
  // =========================================================

  const handlePlateLetterKeyDown = (
    index,
    e,
  ) => {
    if (
      e.key === "Backspace" &&
      form.plateLetters[index] ===
      "" &&
      index > 0
    ) {
      e.preventDefault();

      requestAnimationFrame(() => {
        letterRefs[
          index - 1
        ].current?.focus();

        letterRefs[
          index - 1
        ].current?.select();
      });

      return;
    }

    if (
      e.key === "ArrowLeft" &&
      index < 2
    ) {
      e.preventDefault();

      letterRefs[
        index + 1
      ].current?.focus();

      letterRefs[
        index + 1
      ].current?.select();

      return;
    }

    if (
      e.key === "ArrowRight" &&
      index > 0
    ) {
      e.preventDefault();

      letterRefs[
        index - 1
      ].current?.focus();

      letterRefs[
        index - 1
      ].current?.select();
    }
  };

  // =========================================================
  // Plate digits
  // =========================================================

  const handlePlateNumbers = (e) => {
    const value = e.target.value;

    let result = "";

    for (const char of value) {
      if (/^[1-9]$/.test(char)) {
        result +=
          ARABIC_INDIC_DIGITS[
          Number(char) - 1
          ];

        continue;
      }

      const arabicIndex =
        ARABIC_INDIC_DIGITS.indexOf(
          char,
        );

      if (arabicIndex !== -1) {
        result += char;
      }
    }

    result = result.slice(0, 4);

    dispatch(
      updatePlateNumbers(result),
    );
  };

  // =========================================================
  // Digits keyboard navigation
  // =========================================================

  const handleDigitsKeyDown = (e) => {
    if (
      e.key === "Backspace" &&
      form.plateNumbers === ""
    ) {
      e.preventDefault();

      requestAnimationFrame(() => {
        letterRefs[0].current?.focus();

        letterRefs[0].current?.select();
      });
    }
  };

  // =========================================================
  // Plate click
  // =========================================================

  const handlePlateClick = (e) => {
    if (editingCarId !== null) {
      return;
    }

    if (
      e.target !==
      letterRefs[2].current
    ) {
      e.preventDefault();

      letterRefs[2].current?.focus();

      letterRefs[2].current?.select();
    }
  };

  // =========================================================
  // START EDIT
  // =========================================================

  const handleEdit = (id) => {
    const car = cars.find(
      (item) => item.id === id,
    );

    dispatch(startEditCar(id));

    if (car) {
      dispatch(
        updateFormField({
          name: "employee",
          value:
            car.employeeName ||
            car.employee ||
            "",
        }),
      );

      dispatch(
        updateFormField({
          name: "employeePhone",
          value:
            car.employeePhone || "",
        }),
      );

      dispatch(
        updateFormField({
          name: "employeeType",
          value:
            car.employeeType || "",
        }),
      );

      dispatch(
        updateFormField({
          name: "brand",
          value: car.brand || "",
        }),
      );

      dispatch(
        updateFormField({
          name: "color",
          value: car.color || "",
        }),
      );

      const rawLetters =
        Array.isArray(
          car.plateLetters,
        )
          ? car.plateLetters
          : String(
            car.plateLetters || "",
          )
            .trim()
            .split(/\s+/);

      [0, 1, 2].forEach(
        (idx) => {
          const letter =
            rawLetters[idx] || "";

          dispatch(
            updatePlateLetter({
              index: idx,
              value:
                DISALLOWED_PLATE_LETTERS.has(
                  letter,
                )
                  ? ""
                  : letter,
            }),
          );
        },
      );

      dispatch(
        updatePlateNumbers(
          convertWesternToArabicIndic(
            car.plateNumbers,
          ),
        ),
      );
    }

    setIsColorOpen(false);

    dispatch(setColorSearch(""));

    requestAnimationFrame(() => {
      letterRefs[0].current?.focus();

      letterRefs[0].current?.select();
    });
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancelEdit = () => {
    dispatch(cancelEditCar());

    setIsColorOpen(false);

    dispatch(setColorSearch(""));
  };

  // =========================================================
  // Submit
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.employee ||
      !form.employeePhone ||
      !form.employeeType ||
      !form.plateLetters[0] ||
      !form.plateNumbers ||
      !form.brand ||
      !form.color
    ) {
      await Swal.fire({
        title: "Missing Information",
        text:
          "Please fill Employee Name, Phone, Employee Type, Brand, Color, the first plate letter, and plate numbers.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      return;
    }

    const plateLetters = [
      ...form.plateLetters,
    ];

    // =======================================================
    // PATCH EXISTING VEHICLE
    // =======================================================

    if (editingCarId !== null) {
      const payload = {
        vehicleType: "EMPLOYEE",

        plateLetters:
          plateLetters.join(" "),

        plateNumbers:
          convertArabicIndicToWestern(
            form.plateNumbers,
          ),

        brand: form.brand,

        color: form.color,

        employeeName:
          form.employee,

        employeePhone:
          form.employeePhone,

        employeeType:
          form.employeeType,
      };

      const result =
        await dispatch(
          updateEmployeeCar({
            id: editingCarId,
            payload,
          }),
        );

      if (
        updateEmployeeCar.fulfilled.match(
          result,
        )
      ) {
        setIsColorOpen(false);

        dispatch(setColorSearch(""));
      }

      return;
    }

    // =======================================================
    // POST /vehicles
    // =======================================================

    const payload = {
      vehicleType: "EMPLOYEE",

      plateLetters:
        plateLetters.join(" "),

      plateNumbers:
        convertArabicIndicToWestern(
          form.plateNumbers,
        ),

      brand: form.brand,

      color: form.color,

      employeeName:
        form.employee,

      employeePhone:
        form.employeePhone,

      employeeType:
        form.employeeType,
    };

    const result =
      await dispatch(
        createEmployeeCar(payload),
      );

    if (
      createEmployeeCar.fulfilled.match(
        result,
      )
    ) {
      setIsColorOpen(false);

      dispatch(setColorSearch(""));
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const result =
      await Swal.fire({
        title: "Are you sure?",
        text:
          "You are about to delete this employee car.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText:
          "Yes, delete it",
        cancelButtonText:
          "Cancel",
        confirmButtonColor:
          "#dc2626",
        cancelButtonColor:
          "#6b7280",
      });

    if (!result.isConfirmed) {
      return;
    }

    await dispatch(
      deleteEmployeeCar(id),
    );
  };

  // =========================================================
  // TOGGLE GATE ACCESS
  // =========================================================

  const handleToggleAllowed = async (
    car,
  ) => {
    if (
      togglingAllowedId !== null ||
      isDeleting
    ) {
      return;
    }

    const userId =
      getEmployeeCarUserId(car);

    if (!userId) {
      return;
    }

    setTogglingAllowedId(car.id);

    await dispatch(
      updateEmployeeCarStatus({
        userId,
        allowed: !car.allowed,
      }),
    );

    setTogglingAllowedId(null);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-200 px-4 py-8">
      <div className="mx-auto max-w-380">

        {/* =====================================================
            BACK BUTTON
        ====================================================== */}

        <button
          onClick={BackWard}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={18} />

          Back to Dashboard
        </button>

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Employee Cars
          </h1>

          <p className="mt-1 text-gray-500">
            Register and manage employee
            vehicles.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">

          {/* =====================================================
              ADD / EDIT FORM
          ====================================================== */}

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <Car size={24} />
              </div>

              <h2 className="text-xl font-bold">
                {editingCarId !== null
                  ? "Edit Employee Car"
                  : "Add Employee Car"}
              </h2>
            </div>

            <div className="space-y-4">

              {/* =================================================
                  PLATE
              ================================================= */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Plate Number
                </label>

                <div
                  className="flex w-full items-center justify-start gap-2"
                  dir="ltr"
                >
                  <input
                    required
                    ref={digitsRef}
                    type="text"
                    value={
                      form.plateNumbers
                    }
                    onChange={
                      handlePlateNumbers
                    }
                    onKeyDown={
                      handleDigitsKeyDown
                    }
                    onClick={
                      handlePlateClick
                    }
                    onFocus={(e) => {
                      if (
                        editingCarId ===
                        null
                      ) {
                        return;
                      }

                      const target =
                        e.target;

                      requestAnimationFrame(
                        () => {
                          target.select();
                        },
                      );
                    }}
                    placeholder="١٢٣٤"
                    className="h-12 w-20 rounded-xl border border-gray-300 bg-white px-2 text-center text-lg font-bold shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    inputMode="numeric"
                    maxLength={4}
                    dir="rtl"
                    autoComplete="off"
                    aria-label="Plate numbers"
                  />

                  <span className="px-1 text-lg font-bold text-gray-400">
                    -
                  </span>

                  {[2, 1, 0].map(
                    (idx) => (
                      <input
                        key={idx}
                        ref={
                          letterRefs[idx]
                        }
                        type="text"
                        value={
                          form
                            .plateLetters[
                          idx
                          ]
                        }
                        onChange={(e) =>
                          handlePlateLetter(
                            idx,
                            e,
                          )
                        }
                        onKeyDown={(e) =>
                          handlePlateLetterKeyDown(
                            idx,
                            e,
                          )
                        }
                        onFocus={(e) => {
                          if (
                            editingCarId ===
                            null
                          ) {
                            return;
                          }

                          const target =
                            e.target;

                          requestAnimationFrame(
                            () => {
                              target.select();
                            },
                          );
                        }}
                        placeholder={
                          idx === 0
                            ? "أ"
                            : "—"
                        }
                        className="h-12 w-12 rounded-xl border border-gray-300 bg-white px-1 text-center text-lg font-bold shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        inputMode="text"
                        lang="ar"
                        maxLength={1}
                        dir="rtl"
                        autoComplete="off"
                        aria-label={`Arabic letter ${idx + 1
                          }`}
                      />
                    ),
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Type the 3 Arabic letters
                  from the right. The cursor
                  moves automatically from
                  right to left.
                </p>

                <p className="mt-1 text-xs font-medium text-blue-600">
                  Plate numbers: 1–9 only.
                  Zero is not allowed.
                </p>
              </div>

              {/* =================================================
                  EMPLOYEE
              ================================================= */}

              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700">
                  Employee Name
                </label>

                <input
                  required
                  name="employee"
                  value={form.employee}
                  onChange={handleChange}
                  placeholder="Employee Name"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* =================================================
                  EMPLOYEE PHONE
              ================================================= */}

              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700">
                  Employee Phone
                </label>

                <input
                  required
                  name="employeePhone"
                  value={
                    form.employeePhone
                  }
                  onChange={handleChange}
                  placeholder="01055566677"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={11}
                />
              </div>

              {/* =================================================
                  EMPLOYEE TYPE
              ================================================= */}

              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700">
                  Job
                </label>

                <input
                  required
                  name="employeeType"
                  value={
                    form.employeeType
                  }
                  onChange={handleChange}
                  placeholder="Enter the employee job"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* =================================================
                  BRAND
              ================================================= */}

              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle Brand
                </label>

                <input
                  required
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Hyundai"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* =================================================
                  COLOR
              ================================================= */}

              <div
                ref={colorDropdownRef}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700">
                  Color
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setIsColorOpen(
                      (prev) => !prev,
                    )
                  }
                  className={`mt-1 flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition-all ${isColorOpen
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-300 hover:border-blue-400"
                    }`}
                  aria-haspopup="listbox"
                  aria-expanded={
                    isColorOpen
                  }
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
                    className={`ml-2 shrink-0 text-gray-400 transition-transform ${isColorOpen
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
                            dispatch(
                              setColorSearch(
                                e.target
                                  .value,
                              ),
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

                    <div
                      className="max-h-64 overflow-y-auto p-2"
                      role="listbox"
                    >
                      {filteredColors.length >
                        0 ? (
                        filteredColors.map(
                          (item) => {
                            const isSelected =
                              form.color ===
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
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${isSelected
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-50"
                                  }`}
                                role="option"
                                aria-selected={
                                  isSelected
                                }
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
                          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <Search
                              size={18}
                              className="text-gray-400"
                            />
                          </div>

                          <p className="text-sm font-medium text-gray-600">
                            No colors found
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Try another color
                            name
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={form.color}
                  readOnly
                  tabIndex={-1}
                  className="pointer-events-none absolute h-0 w-0 opacity-0"
                  aria-hidden="true"
                />
              </div>

              {/* =================================================
                  API ERROR
              ================================================= */}

              {(addError ||
                updateError) && (
                  <p className="text-sm font-medium text-red-600">
                    {addError ||
                      updateError}
                  </p>
                )}

              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                disabled={
                  isAdding ||
                  isUpdating
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingCarId !==
                  null ? (
                  <>
                    <Pencil size={19} />

                    {isUpdating
                      ? "Updating Car..."
                      : "Update Car"}
                  </>
                ) : (
                  <>
                    <Plus size={19} />

                    {isAdding
                      ? "Adding Car..."
                      : "Add Car"}
                  </>
                )}
              </button>

              {/* =================================================
                  CANCEL EDIT
              ================================================= */}

              {editingCarId !==
                null && (
                  <button
                    type="button"
                    onClick={
                      handleCancelEdit
                    }
                    className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel Edit
                  </button>
                )}
            </div>
          </form>

          {/* =====================================================
              EMPLOYEE CARS TABLE
          ====================================================== */}

          <div className="overflow-hidden rounded-3xl bg-white shadow-lg">

            {/* ===================================================
                TABLE HEADER
            =================================================== */}

            <div className="border-b px-6 py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <h2 className="text-xl font-bold">
                    Employee Cars
                  </h2>

                  <p className="text-sm text-gray-500">
                    {cars.length} registered
                    car
                    {cars.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="relative w-full md:max-w-sm">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(e) =>
                      dispatch(
                        setSearch(
                          e.target.value,
                        ),
                      )
                    }
                    placeholder="Search name, type, plate, brand or color..."
                    className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* ===================================================
                ERRORS
            =================================================== */}

            {error && (
              <div className="mx-6 mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {deleteError && (
              <div className="mx-6 mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {deleteError}
              </div>
            )}

            {updateStatusError && (
              <div className="mx-6 mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {updateStatusError}
              </div>
            )}

            {/* ===================================================
                TABLE
            =================================================== */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-237.5">

                <thead className="bg-gray-50">
                  <tr>

                    {/* Employee */}

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "employee",
                          )
                        }
                        className="flex items-center gap-2 font-semibold hover:text-blue-600"
                      >
                        Employee

                        {getSortIcon(
                          "employee",
                        )}
                      </button>
                    </th>

                    {/* Plate */}

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "plate",
                          )
                        }
                        className="flex items-center gap-2 font-semibold hover:text-blue-600"
                      >
                        Plate

                        {getSortIcon(
                          "plate",
                        )}
                      </button>
                    </th>

                    {/* Role */}

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "role",
                          )
                        }
                        className="flex items-center gap-2 font-semibold hover:text-blue-600"
                      >
                        Role

                        {getSortIcon(
                          "role",
                        )}
                      </button>
                    </th>

                    {/* Vehicle */}

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "vehicle",
                          )
                        }
                        className="flex items-center gap-2 font-semibold hover:text-blue-600"
                      >
                        Vehicle

                        {getSortIcon(
                          "vehicle",
                        )}
                      </button>
                    </th>

                    {/* Brand */}

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "brand",
                          )
                        }
                        className="flex items-center gap-2 font-semibold hover:text-blue-600"
                      >
                        Brand

                        {getSortIcon(
                          "brand",
                        )}
                      </button>
                    </th>

                    {/* Color */}

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "color",
                          )
                        }
                        className="flex items-center gap-2 font-semibold hover:text-blue-600"
                      >
                        Color

                        {getSortIcon(
                          "color",
                        )}
                      </button>
                    </th>

                    {/* Gate Access */}

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "allowed",
                          )
                        }
                        className="flex items-center gap-2 font-semibold hover:text-blue-600"
                      >
                        Gate Access

                        {getSortIcon(
                          "allowed",
                        )}
                      </button>
                    </th>

                    {/* Action */}

                    <th className="px-6 py-4 text-left">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y">

                  {/* =================================================
                      LOADING
                  ================================================= */}

                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-sm font-medium text-gray-500"
                      >
                        Loading employee
                        cars...
                      </td>
                    </tr>
                  ) : displayedCars.length ===
                    0 ? (
                    /* =================================================
                       EMPTY
                    ================================================= */

                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-sm font-medium text-gray-500"
                      >
                        No employee cars
                        found.
                      </td>
                    </tr>
                  ) : (
                    /* =================================================
                       CARS
                    ================================================= */

                    visibleCars.map(
                      (car) => (
                        <tr
                          key={car.id}
                          className="hover:bg-green-50/40"
                        >

                          {/* Employee */}

                          <td className="px-6 py-5 font-semibold">
                            {car.employee ||
                              "-"}
                          </td>

                          {/* Plate */}

                          <td className="px-6 py-5 font-mono font-bold text-blue-600">
                            {(
                              car.plateLetters ||
                              []
                            ).join(
                              " ",
                            )}{" "}
                            {
                              car.plateNumbers
                            }
                          </td>

                          {/* Role */}

                          <td className="px-6 py-5">
                            {car.employeeType ||
                              "-"}
                          </td>

                          {/* Vehicle */}

                          <td className="px-6 py-5">
                            {car.employeeName ||
                              car.employee ||
                              "-"}
                          </td>

                          {/* Brand */}

                          <td className="px-6 py-5">
                            {car.brand ||
                              "-"}
                          </td>

                          {/* Color */}

                          <td className="px-6 py-5">
                            {car.color ||
                              "-"}
                          </td>

                          {/* Gate Access */}

                          <td className="px-6 py-5">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleAllowed(
                                    car,
                                  )
                                }
                                disabled={
                                  togglingAllowedId !==
                                  null ||
                                  isUpdatingStatus ||
                                  isDeleting
                                }
                                aria-label={
                                  car.allowed
                                    ? "Block gate access"
                                    : "Allow gate access"
                                }
                                title="Click to toggle gate access"
                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${car.allowed
                                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                  }`}
                              >
                                {togglingAllowedId ===
                                  car.id
                                  ? "Updating..."
                                  : car.allowed
                                    ? "Allowed"
                                    : "Blocked"}
                              </button>
                            </div>
                          </td>

                          {/* Action */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    car.id,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Edit employee car"
                              >
                                <Pencil
                                  size={18}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    car.id,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Delete employee car"
                              >
                                <Trash2
                                  size={18}
                                />
                              </button>

                            </div>
                          </td>

                        </tr>
                      ),
                    )
                  )}

                </tbody>
              </table>
            </div>

            {/* ===================================================
                SHOW MORE / SHOW LESS
            =================================================== */}

            {canShowMore && (
              <div className="flex justify-center px-6 py-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowAllCars(
                      (prev) => !prev,
                    )
                  }
                  className="inline-flex items-center gap-2  
                  px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:text-blue-600"
                >
                  {showAllCars ? (
                    <>
                      <ChevronUp
                        size={18}
                      />

                      Show Less

                      <span className="text-xs font-normal text-gray-400">
                        (
                        {
                          displayedCars.length
                        }{" "}
                        cars)
                      </span>
                    </>
                  ) : (
                    <>
                      <ChevronDown
                        size={18}
                      />

                      Show More

                      <span className="text-xs font-normal text-gray-400">
                        (
                        {
                          displayedCars.length -
                          INITIAL_VISIBLE_ROWS
                        }{" "}
                        more)
                      </span>
                    </>
                  )}
                </button>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}