import React from "react";

export default function Input({
  label_title,
  input_type,
  placeholder,
  name,
  handleCahnge,
  value
}) {
  return (
    <div className="w-full max-w-3xl 
    flex flex-col items-start gap-2 md:gap-3">
      <label
        htmlFor={name}
        className="whitespace-nowrap text-gray-700 font-semibold tracking-wide"
      >
        {label_title}
      </label>

      <input
        id={name}
        name={name}
        type={input_type}
        placeholder={placeholder}
        onChange={handleCahnge}
        value={value}
        className="
          w-full
          rounded-xl
          border
          border-gray-300
          bg-gray-50
          px-4
          py-3
          text-gray-800
          text-base
          outline-none
          transition-all
          duration-300
          focus:border-blue-500
          focus:bg-white
          focus:ring-4
          focus:ring-blue-200
          hover:border-gray-400
          shadow-sm
        "
        required
      />
    </div>
  );
}