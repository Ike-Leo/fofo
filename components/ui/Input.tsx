"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      size = "md",
      leftIcon,
      rightIcon,
      className = "",
      type = "text",
      ...props
    },
    ref
  ) => {
    // Determine inputMode for mobile keyboards
    const getInputMode = () => {
      switch (type) {
        case "email":
          return "email";
        case "tel":
          return "tel";
        case "number":
          return "decimal";
        case "url":
          return "url";
        default:
          return "text";
      }
    };

    // Size styles - mobile-first with minimum touch targets
    const sizeStyles = {
      sm: "h-10 px-3 text-sm min-h-[44px] sm:min-h-0", // 40px on desktop, 44px min on mobile
      md: "h-12 px-4 text-base min-h-[48px]", // 48px on all sizes
      lg: "h-14 px-5 text-lg min-h-[48px] sm:min-h-[56px]", // 56px on desktop
    };

    // Icon padding adjustments
    const paddingStyles = {
      sm: leftIcon && rightIcon ? "px-8" : leftIcon || rightIcon ? "px-10" : "px-3",
      md: leftIcon && rightIcon ? "px-10" : leftIcon || rightIcon ? "px-12" : "px-4",
      lg: leftIcon && rightIcon ? "px-12" : leftIcon || rightIcon ? "px-14" : "px-5",
    };

    // Base input styles - 16px font size to prevent iOS zoom
    const baseStyles = `w-full bg-tertiary border rounded-xl text-primary placeholder:text-tertiary transition-fast min-h-[48px] focus:outline-none`;

    // Border color based on state
    const borderStyles = error
      ? "border-accent-danger focus:ring-2 focus:ring-accent-danger/20"
      : "border-subtle focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20";

    // Width styles
    const widthStyles = fullWidth ? "w-full" : "";

    // Combine size and padding
    const sizeWithPadding = sizeStyles[size].replace(/px-\d+/g, paddingStyles[size]);

    // Combined styles
    const inputStyles = `${baseStyles} ${borderStyles} ${sizeWithPadding} ${widthStyles} ${className}`;

    return (
      <div className={`space-y-2 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="block text-label-md text-secondary uppercase tracking-wide">
            {label}
            {props.required && <span className="text-accent-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            inputMode={getInputMode()}
            className={inputStyles}
            style={{ fontSize: 16 }} // Prevent iOS zoom
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-body-sm text-accent-danger">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {helperText && !error && (
          <p className="text-body-sm text-secondary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
