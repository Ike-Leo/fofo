"use client";

import { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
}: BadgeProps) {
  // Variant styles
  const variantStyles = {
    default: "bg-muted/50 text-muted-foreground border-border",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  // Size styles
  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  // Dot indicator color
  const dotColors = {
    default: "bg-muted-foreground",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      <span className="truncate max-w-[200px]">{children}</span>
    </span>
  );
}
