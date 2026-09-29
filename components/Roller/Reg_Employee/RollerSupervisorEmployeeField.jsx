import { AlertCircle } from "lucide-react";

export default function RollerSupervisorEmployeeField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  children,
}) {
  return (
    <div>
      {/* Label */}
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>

      {/* Input */}
      {children || (
        <input
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
        />
      )}

      {/* Error */}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
          <AlertCircle size={15} />

          <span>{error}</span>
        </div>
      )}
    </div>
  );
}