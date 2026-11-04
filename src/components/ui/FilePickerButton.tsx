"use client";
import { ChangeEvent, ReactNode, useRef } from "react";
import clsx from "clsx";
import { Plus } from "lucide-react";

import Button from "./Button";

interface FilePickerButtonProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  children?: ReactNode; // replaces the default + icon
}

export default function FilePickerButton({
  onFileSelect,
  accept,
  disabled,
  label = "Attach a file",
  className,
  children,
}: FilePickerButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = ""; // lets the same file be picked again later
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        className={clsx("p-3 rounded-full flex shrink-0", className)}
      >
        {children ?? <Plus size={18} />}
      </Button>
    </>
  );
}
