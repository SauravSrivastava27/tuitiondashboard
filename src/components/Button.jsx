import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  rotate = false,
  ...props
}) {
  const variantClasses = {
    primary: "nb-button-primary",
    secondary: "nb-button-secondary",
    danger: "nb-button bg-nb-pink text-white hover:bg-nb-pink",
    outline: "nb-button bg-white hover:bg-nb-yellow/10",
    accent: "nb-button-accent text-white",
    success: "nb-button bg-nb-green hover:bg-nb-green",
  };

  const sizeClasses = {
    sm: "text-[10px] px-3 py-1.5",
    md: "text-xs px-6 py-3",
    lg: "text-sm px-8 py-4",
  };

  // Randomized rotation if prop is true
  const rotationClass = rotate ? (Math.random() > 0.5 ? "rotate-2" : "-rotate-2") : "";

  return (
    <button
      className={`${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size]} ${rotationClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}


