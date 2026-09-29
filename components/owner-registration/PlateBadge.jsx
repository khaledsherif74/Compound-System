"use client";

export default function PlateBadge({
  vehicle,
  getPlateString,
}) {
  return (
    <span
      dir="rtl"
      className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold tracking-wide text-slate-700"
    >
      {getPlateString(vehicle)}
    </span>
  );
}