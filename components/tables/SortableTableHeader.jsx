"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export default function SortableTableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
  className = "px-6 py-4 text-left text-sm font-semibold text-gray-600",
}) {
  const isActive = sortConfig?.key === sortKey;

  const icon = !isActive ? (
    <ChevronsUpDown size={16} className="text-gray-400" />
  ) : sortConfig.direction === "asc" ? (
    <ChevronUp size={16} className="text-blue-600" />
  ) : (
    <ChevronDown size={16} className="text-blue-600" />
  );

  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-2 font-semibold hover:text-blue-600"
      >
        {label}
        {icon}
      </button>
    </th>
  );
}
