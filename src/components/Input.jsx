import React from "react";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  error = null,
  required = false,
  placeholder = "",
  className = "",
  ...props
}) {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block text-sm font-bold mb-2 uppercase tracking-tight text-nb-black">
          {label}
          {required && <span className="text-nb-pink ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`nb-input ${error ? 'border-nb-pink ring-2 ring-nb-pink ring-inset' : ''}`}
        required={required}
        {...props}
      />
      {error && <div className="text-xs font-bold text-nb-pink mt-2 uppercase">{error}</div>}
    </div>
  );
}

