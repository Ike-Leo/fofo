"use client";

import { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  clickable?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  clickable = false,
  className = "",
}: BadgeProps) {
  // Variant styles - all use gradient backgrounds
  const variantStyles = {
    default:
      "bg-gradient-to-br from-gray-400/20 to-gray-500/10 text-gray-300 border border-gray-400/20",
    success:
      "bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 text-emerald-300 border border-emerald-400/20 shadow-lg shadow-emerald-500/10",
    warning:
      "bg-gradient-to-br from-amber-400/20 to-amber-600/10 text-amber-300 border border-amber-400/20 shadow-lg shadow-amber-500/10",
    danger:
      "bg-gradient-to-br from-red-400/20 to-red-600/10 text-red-300 border border-red-400/20 shadow-lg shadow-red-500/10",
    info:
      "bg-gradient-to-br from-cyan-400/20 to-blue-600/10 text-cyan-300 border border-cyan-400/20 shadow-lg shadow-cyan-500/10",
  };

  // Size styles - mobile-friendly with minimum touch targets
  const sizeStyles = {
    sm: "text-body-sm px-2 py-0.5",
    md: "text-body-md px-2.5 py-1",
    lg: "text-body-lg px-3 py-1.5",
  };

  // Dot indicator with optional pulse animation
  const dotStyles = {
    default: "bg-gray-300",
    success: "bg-emerald-400 animate-pulse-dot",
    warning: "bg-amber-400 animate-pulse-dot",
    danger: "bg-red-400 animate-pulse-dot",
    info: "bg-cyan-400 animate-pulse-dot",
  };

  // Clickable state
  const clickableStyles = clickable
    ? "cursor-pointer hover-lift active-scale min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
    : "";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-fast ${variantStyles[variant]} ${sizeStyles[size]} ${clickableStyles} ${className}`}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotStyles[variant]}`} />
      )}
      <span className="truncate max-w-[200px]">{children}</span>
    </span>
  );
}
