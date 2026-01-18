"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled,
  icon,
  iconPosition = "left",
  className = "",
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50";

  // Variant styles
  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-card text-foreground border border-border hover:bg-muted/50",
    ghost: "text-foreground hover:bg-muted/50",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
  };

  // Size styles (mobile-first with minimum touch targets)
  const sizeStyles = {
    sm: "h-9 px-3 text-sm min-h-[36px]", // 36px minimum for small buttons
    md: "h-11 px-4 text-base min-h-[44px]", // 44px minimum for standard buttons (iOS standard)
    lg: "h-14 px-6 text-lg min-h-[48px]", // 48px for prominent CTAs (Android standard)
  };

  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";

  // Combined styles
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

  // Icon rendering
  const renderIcon = () => {
    if (!icon && !loading) return null;

    if (loading) {
      return <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />;
    }

    return icon;
  };

  return (
    <button
      className={buttonStyles}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === "left" && renderIcon() && (
        <span className="mr-2">{renderIcon()}</span>
      )}
      <span>{children}</span>
      {iconPosition === "right" && renderIcon() && (
        <span className="ml-2">{renderIcon()}</span>
      )}
    </button>
  );
}
