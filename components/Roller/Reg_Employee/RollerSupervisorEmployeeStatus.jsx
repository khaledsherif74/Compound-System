export default function RollerSupervisorEmployeeStatus({
  active,
  onToggle,
  employeeName,
}) {
  return (
  <div className="flex items-center">
  <button
    type="button"
    onClick={onToggle}
    aria-label={
      active
        ? `Deactivate ${employeeName}`
        : `Activate ${employeeName}`
    }
    aria-pressed={active}
    title={
      active
        ? `Deactivate ${employeeName}`
        : `Activate ${employeeName}`
    }
    className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
      active
        ? "border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100"
        : "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100"
    }`}
  >
    <span
      className={`h-2.5 w-2.5 rounded-full shadow-sm transition-all duration-200 ${
        active
          ? "bg-green-500 shadow-green-200 group-hover:scale-125"
          : "bg-red-500 shadow-red-200 group-hover:scale-125"
      }`}
    />

    <span>
      {active ? "Active" : "Inactive"}
    </span>

    <span
      className={`absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
        active
          ? "bg-green-400/5"
          : "bg-red-400/5"
      }`}
    />
  </button>
</div>
  );
}