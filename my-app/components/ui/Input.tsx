"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
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

    // Base input styles
    const baseStyles = "w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground transition-all duration-200 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-primary/50";

    // Border color based on state
    const borderStyles = error
      ? "border-destructive focus:border-destructive"
      : "border-border focus:border-primary";

    // Width styles
    const widthStyles = fullWidth ? "w-full" : "";

    // Combined styles
    const inputStyles = `${baseStyles} ${borderStyles} ${widthStyles} ${className}`;

    return (
      <div className={`space-y-1.5 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          inputMode={getInputMode() as any}
          className={inputStyles}
          {...props}
        />

        {error && (
          <div className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
