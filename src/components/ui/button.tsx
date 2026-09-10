"use client";
import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  // Base class apply to all buttons
  const baseClass =
    "inline-flex items-center justify-center font-medium rounded-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  // classes specific to the varient classes
  const variants = {
    primary:
      "bg-primary text-background hover:bg-primary-glow shadow-[0_0_10px_rgba(0,102,255,0.2)] hover:shadow-[0_0_15px_rgba(77,255,255,0.4)]",
    destructive: "bg-destructive text-white hover:bg-red-400",
    secondary:
      "bg-surface text-text-main border border-border hover:bg-surface-hover",
  };

  //Classes specific to the size chosen
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg w-full",
  };

  return (
    <button
      className={clsx(baseClass, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
