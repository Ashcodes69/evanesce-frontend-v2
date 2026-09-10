"use client";
import { InputHTMLAttributes } from "react";
import clsx from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        // base styles
        "w-full bg-surface border border-border rounded-lg px-4 py-2 text-text-main",
        //typography & placeholder
        "text-sm placeholder: text-text-muted",
        //focus
        "focus: outline-none focus; border-primary focusL ring-1 focus: ring-primary",
        "transition-all duration-200",
        className,
      )}
      {...props}
    ></input>
  );
}
