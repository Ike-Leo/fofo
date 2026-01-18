"use client";

import { ReactNode, HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  clickable?: boolean;
}

const paddingStyles = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  children,
  padding = "md",
  hoverable = false,
  clickable = false,
  className = "",
  onClick,
  ...props
}: CardProps) {
  const baseStyles = "bg-card rounded-xl border border-border transition-all duration-200";

  const hoverStyles = hoverable
    ? "hover:shadow-md hover:border-input"
    : "";

  const interactiveStyles = clickable || onClick
    ? "active:scale-[0.98] cursor-pointer"
    : "";

  const paddingStyle = paddingStyles[padding];

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${interactiveStyles} ${paddingStyle} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// Card sub-components for better organization
export function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-1.5 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />;
}

export function CardDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-muted-foreground ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex items-center pt-4 ${className}`} {...props} />;
}
