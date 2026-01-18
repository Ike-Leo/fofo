"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
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
  // Base styles - premium feel with transitions
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-fast rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary/40 disabled:opacity-50 disabled:cursor-not-allowed active-scale";

  // Variant styles - using new design system gradients
  const variantStyles = {
    primary: "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xl shadow-amber-500/20 hover-lift hover-glow-primary",
    secondary: "bg-tertiary text-primary border border-subtle hover:bg-elevated hover:border-default",
    ghost: "text-primary hover:bg-tertiary/50",
    danger: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl shadow-red-500/20 hover-lift hover-glow-danger",
  };

  // Size styles - mobile-first with minimum touch targets
  // All sizes maintain min-h-[48px] on mobile for touch targets
  const sizeStyles = {
    sm: "h-10 px-4 text-sm min-h-[48px] sm:min-h-0", // 40px on desktop, 48px min on mobile
    md: "h-12 px-5 text-base min-h-[48px]", // 48px on all sizes
    lg: "h-14 px-6 text-lg min-h-[48px] sm:min-h-[56px]", // 56px on desktop
    xl: "h-16 px-8 text-xl min-h-[48px] sm:min-h-[64px]", // 64px on desktop
  };

  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";

  // Combined styles
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

  // Icon rendering with proper sizing
  const renderIcon = () => {
    if (!icon && !loading) return null;

    if (loading) {
      return <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />;
    }

    return <span className="flex-shrink-0">{icon}</span>;
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
      <span className="truncate">{children}</span>
      {iconPosition === "right" && renderIcon() && (
        <span className="ml-2">{renderIcon()}</span>
      )}
    </button>
  );
}
