"use client";

import { ChevronDown } from "lucide-react";

export default function TableFilterSelect({
  id,
  label = "Filter",
  value,
  options = [],
  onChange,
  allValue = "all",
  allLabel = "All",
}) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-gray-600"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 font-semibold text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option === allValue ? allLabel : option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={19}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  );
}