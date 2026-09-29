"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Search,
} from "lucide-react";

import { VEHICLE_COLORS } from "./rollerRegOwnerData";

export default function ColorSelect({
  value,
  onChange,
}) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const dropdownRef =
    useRef(null);

  useEffect(() => {
    const handleOutsideClick = (
      event,
    ) => {
      if (
        !dropdownRef.current?.contains(
          event.target,
        )
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  const filteredColors = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return VEHICLE_COLORS;
    }

    return VEHICLE_COLORS.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(query) ||
        item.arabic.includes(query),
    );
  }, [search]);

  const selectedColor =
    VEHICLE_COLORS.find(
      (item) =>
        item.value === value,
    );

  const handleSelect = (color) => {
    onChange(color.value);

    setIsOpen(false);

    setSearch("");
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Vehicle Color
      </label>

      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (prev) => !prev,
          )
        }
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-200"
            : "border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          {selectedColor ? (
            <>
              <span
                className="h-6 w-6 rounded-full border border-gray-300"
                style={{
                  backgroundColor:
                    selectedColor.hex,
                }}
              />

              <span className="font-medium">
                {selectedColor.name}
              </span>

              <span className="text-sm text-gray-400">
                (
                {
                  selectedColor.arabic
                }
                )
              </span>
            </>
          ) : (
            <span className="text-gray-400">
              Select vehicle color
            </span>
          )}
        </div>

        <ChevronDown
          size={18}
          className={`text-gray-400 transition ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b p-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                autoFocus
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search color..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filteredColors.length >
            0 ? (
              filteredColors.map(
                (item) => {
                  const selected =
                    value ===
                    item.value;

                  return (
                    <button
                      key={
                        item.value
                      }
                      type="button"
                      onClick={() =>
                        handleSelect(
                          item,
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 ${
                        selected
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-7 w-7 rounded-full border border-gray-300"
                          style={{
                            backgroundColor:
                              item.hex,
                          }}
                        />

                        <div className="text-left">
                          <p className="text-sm font-semibold">
                            {
                              item.name
                            }
                          </p>

                          <p className="text-xs text-gray-400">
                            {
                              item.arabic
                            }
                          </p>
                        </div>
                      </div>

                      {selected && (
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
              <p className="px-3 py-4 text-center text-sm text-gray-400">
                No colors found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}