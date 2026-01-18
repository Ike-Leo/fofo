"use client";

import { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "gradient";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  clickable?: boolean;
}

const paddingStyles = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5 md:p-6",
  lg: "p-5 sm:p-6 md:p-8",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  hoverable = false,
  clickable = false,
  className = "",
  onClick,
  ...props
}: CardProps) {
  // Base styles
  const baseStyles = "rounded-xl transition-normal";

  // Variant styles - using new design system
  const variantStyles = {
    default: "bg-tertiary border border-subtle",
    elevated: "bg-elevated border border-subtle shadow-lg",
    glass: "glass shadow-lg",
    gradient: "bg-gradient-to-br from-tertiary to-elevated border border-subtle shadow-lg",
  };

  // Hover effects - desktop only using hover-lift utility
  const hoverStyles = hoverable ? "hover-lift cursor-pointer" : "";

  // Clickable state - adds hover lift + touch feedback
  const clickableStyles = clickable || onClick
    ? "hover-lift active-scale-sm cursor-pointer"
    : "";

  // Padding
  const paddingStyle = paddingStyles[padding];

  // Combined styles
  const cardStyles = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${clickableStyles} ${paddingStyle} ${className}`;

  return (
    <div
      className={cardStyles}
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
  return <h3 className={`text-heading-lg font-bold leading-none tracking-tight ${className}`} {...props} />;
}

export function CardDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-body-md text-secondary ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex items-center pt-4 ${className}`} {...props} />;
}
